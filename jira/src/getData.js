function toDate(dateString){
  return new Date(dateString)
}

/**
 * Constructs an object with values as rows.
 * @param {Fields} requestedFields The requested fields.
 * @param {object[]} response The response.
 * @param {object} request object.
 * @return {object} An object containing rows with values.
 */
function responseToRows(requestedFields, response, request) {
  const timeZone = 'GMT'
  const format = 'yyyyMMddHH'
  // Transform parsed data and filter for requested fields
  return response.map(function(issue) {
    var row = [];
    requestedFields.asArray().forEach(function(field) {
      var fieldId = field.getId();
      switch (fieldId) {
        case 'id':
          return row.push(issue.id);
        case 'url':
          return row.push('https://'+ request.configParams.host +'/browse/' + issue.key);
        case 'issuekey':
          return row.push(issue.key);
        default:
          var field = issue.fields[fieldId] 
          var result = ''
          if(field.displayName || field.value || field.name){
            result = field.displayName || field.value || field.name;
          }
          else if(field.join){
            result = field.join();
          }
          else if(field.stringify){
            result = field.stringify();
          }
          return row.push(result);
      }
    });
    return {values: row};
  });
}

/**
 * Return true if valid
 * @param {object} value 
 * @return {boolean} True if is not '', null or undefined
*/
function hasValue(value){
  return ['', null, undefined].indexOf(value) < 0
}

/**
 * Gets the data for the community connector
 * @param {object} request The request.
 * @return {object} The data.
 */
function getData(request) {
  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  
  var fieldsData = getJiraFields(request);
  var requestedFields = getFields(fieldsData).forIds(requestedFieldIds);
  
  var jql = [
    request.configParams.dateForQuery != 'none' ? request.configParams.dateForQuery +' >= ' + request.dateRange.startDate + ' AND ' + request.configParams.dateForQuery + ' <= ' + request.dateRange.endDate : '',
    request.configParams.dateForQuery != 'none' ? 'AND ': '',
    hasValue(request.configParams.projects) ? 'project in (' + request.configParams.projects + ')' : '',
    hasValue(request.configParams.projects) && hasValue(request.configParams.additionalQuery) ? 'AND ' : '',
    hasValue(request.configParams.additionalQuery) ? request.configParams.additionalQuery : ''
  ]
  
  var headers = {
    "Authorization":"Basic " + Utilities.base64Encode(request.configParams.username + ':' + request.configParams.apiToken)
  }
  
  var params = {
    "contentType":"application/json",
    "headers":headers, //Authentication sent as a header
    "method":'get',
//    "payload" : JSON.stringify(data),
//    "useIntranet":false, //Deprecated,
    "validateHttpsCertificates":false,
    "followRedirects":true,
    "muteHttpExceptions":true,
    "escaping":true
  }
    
  var response = null
  var parsedResponse = null
  var startAt = 0
  var total = null
  var issues = []
  do{
    var url = [
      'https://',
      request.configParams.host,
      '/rest/api/2/search?',
      'jql=',
      jql.join('+'),
      '&maxResults=',
      request.configParams.maxResults,
      '&expand=changelog',
      '&startAt=',
      startAt
    ]
    
    // Fetch and parse data from API
    response = UrlFetchApp.fetch(encodeURI(url.join('')), params)
    parsedResponse = JSON.parse(response)
    issues = issues.concat(parsedResponse.issues)
    total = parsedResponse.total
    startAt += parsedResponse.maxResults
  }while(startAt <= total)
  
  var rows = responseToRows(requestedFields, issues, request);
    
  return {
    schema: requestedFields.build(),
    rows: rows
  };
}