function max(a, b){
  return a > b ? a : b
}

function min(a, b){
  return a < b ? a : b
}

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
    var metrics = getIssueMetrics(issue.changelog.histories);
    requestedFields.asArray().forEach(function(field) {
      switch (field.getId()) {
        case 'id':
          return row.push(issue.id);
        case 'url':
          return row.push('https://'+ request.configParams.host +'/browse/' + issue.key);
        case 'key':
          return row.push(issue.key);
        case 'statuscategorychangedate':
          return row.push(Utilities.formatDate(new Date(issue.fields.statuscategorychangedate), timeZone, format));
        case 'resolution':
          return row.push(issue.fields.resolution ? issue.fields.resolution.name : 'Unresolved');
        case 'priority':
          return row.push(issue.fields.priority);
        case 'labels':
          return row.push(issue.fields.labels.sort().join());
        case 'assignee':
          return row.push(issue.fields.assignee ? issue.fields.assignee.displayName : 'Unassigned');
        case 'status':
          return row.push(issue.fields.status.name);
        case 'statusCategory':
          return row.push(issue.fields.status.statusCategory.name);
        case 'components':
          return row.push(issue.fields.components.map(function(component){ return component.name}).sort().join());
        case 'storyPoints':
          return row.push(issue.fields.customfield_14532);
        case 'actualStoryPoints':
          return row.push(issue.fields.customfield_11542);
        case 'creator':
          return row.push(issue.fields.creator.displayName);
        case 'reporter':
          return row.push(issue.fields.reporter.displayName);
        case 'issueLabel':
          return row.push(issue.fields.customfield_15608 ? issue.fields.customfield_15608.value : null);
        case 'issuetype':
          return row.push(issue.fields.issuetype.name);
        case 'project':
          return row.push(issue.fields.project.name);
        case 'resolutiondate':
          return row.push(issue.fields.resolutiondate ? Utilities.formatDate(new Date(issue.fields.resolutiondate), timeZone, format) : null);
        case 'created':
          return row.push(Utilities.formatDate(new Date(issue.fields.created), timeZone, format));
        case 'brand':
          return row.push(issue.fields.customfield_15435 ? issue.fields.customfield_15435.map(function(brand){return brand.value}).join() : null);
        case 'updated':
          return row.push(Utilities.formatDate(new Date(issue.fields.updated), timeZone, format));
        case 'pullRequest':
          return row.push(issue.fields.customfield_11340);
        case 'sprint':
          return row.push(issue.fields.customfield_10140 ? issue.fields.customfield_10140.join().replace(/.*name=|,goal=.*/g,'') : null);
        case 'description':
          return row.push(issue.fields.description);
        case 'brandCollection':
          return row.push(issue.fields.customfield_15421 ? issue.fields.customfield_15421.value : null);
        case 'summary':
          return row.push(issue.fields.summary);
        case 'points' :
          return row.push(issue.fields.customfield_10003);
        case 'duedate':
          return row.push(issue.fields.duedate ? Utilities.formatDate(new Date(issue.fields.duedate), timeZone, format) : null);
        case 'daysLastUpdated':
          return row.push(getDaysSince(issue.fields.updated));
        case 'daysSinceStatusCategoryChange':
          return row.push(getDaysSince(issue.fields.statuscategorychangedate));
        case 'started':
          return row.push(Utilities.formatDate(new Date(metrics.started), timeZone, format));
        case 'closed':
          return row.push(Utilities.formatDate(new Date(metrics.closed), timeZone, format));
        case 'durationInProgess':
          return row.push(metrics.seconds);
        case 'daysInProgress':
          return row.push(metrics.days);
        default:
          return row.push('');
      }
    });
    return {values: row};
  });
}

function getDaysSince(dateUpdated){
  const dayInMilliseconds = 1*24*60*60*1000 //8.64e7
  const today = new Date()
  const date = new Date(dateUpdated)
  
  return Math.round((today.getTime() - date.getTime())/dayInMilliseconds)
}

// This function returns an object containing dates a ticket was started and completed plus period in days 
function getIssueMetrics(histories){
  const dayInMilliseconds = 1*24*60*60*1000 //8.64e7
  var startedDate = []
  var closedDate = []
    
  for(var currentHistory in histories){
    var history = histories[currentHistory]
    for(var currentItem in history.items){
      var item = history.items[currentItem]

      if(item.field === 'status'){
        switch(item.toString){
          case 'In Progress':
            startedDate.push(new Date(history.created));
            break;
          case 'Closed':
            closedDate.push(new Date(history.created));
            break;
        }
      }
    }
  }
  var days = (Date.parse(closedDate) - Date.parse(startedDate))/dayInMilliseconds
  var seconds = (Date.parse(closedDate) - Date.parse(startedDate))/1000
  return {
    "started":startedDate, 
    "closed":closedDate, 
    "days": isNaN(days) ? 0 : days, 
    "seconds": isNaN(seconds) ? 0 : seconds
  }
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
  
  var requestedFields = getFields().forIds(requestedFieldIds);
  
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