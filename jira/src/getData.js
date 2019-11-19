/**
 * Constructs an object with values as rows.
 * @param {Fields} requestedFields The requested fields.
 * @param {object[]} response The response.
 * @param {object} request object.
 * @return {object} An object containing rows with values.
 */
function responseToRows(requestedFields, response, request) {
  const timeZone = 'GMT';
  const format = 'yyyyMMddHH';
  // Transform parsed data and filter for requested fields
  return response.map(function(issue) {
    var row = [];
    requestedFields.asArray().forEach(function(field) {
      var fieldId = field.getId();
      var fieldType = field.getType();
      switch (fieldId) {
        case 'id':
          return row.push(issue.id);
        case 'url':
          return row.push(
            'https://' + request.configParams.host + '/browse/' + issue.key
          );
        case 'issuekey':
          return row.push(issue.key);
        default:
          var field = issue.fields[fieldId];
          var result = '';
          if (field) {
            if (field.constructor === ''.constructor) {
              // Process strings here
              if (fieldType == 'YEAR_MONTH_DAY_HOUR') {
                result = Utilities.formatDate(
                  new Date(field),
                  timeZone,
                  format
                );
              } else {
                result = field;
              }
            } else if (field.constructor === (0).constructor) {
              // Process numbers here
              result = field;
            } else if (field.constructor === [].constructor) {
              // Process arrays here
              result = field.join();
            } else if (field.constructor === {}.constructor) {
              // Process object here
              result =
                field.displayName ||
                field.value ||
                field.name ||
                JSON.stringify(field);
            }
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
function hasValue(value) {
  return ['', null, undefined].indexOf(value) < 0;
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
    request.configParams.dateForQuery != 'none'
      ? request.configParams.dateForQuery +
        ' >= ' +
        request.dateRange.startDate +
        ' AND ' +
        request.configParams.dateForQuery +
        ' <= ' +
        request.dateRange.endDate
      : '',
    request.configParams.dateForQuery != 'none' ? 'AND ' : '',
    hasValue(request.configParams.projects)
      ? 'project in (' + request.configParams.projects + ')'
      : '',
    hasValue(request.configParams.projects) &&
    hasValue(request.configParams.additionalQuery)
      ? 'AND '
      : '',
    hasValue(request.configParams.additionalQuery)
      ? request.configParams.additionalQuery
      : ''
  ];
  var params = getParams();
  var response = null;
  var parsedResponse = null;
  var startAt = 0;
  var total = null;
  var issues = [];
  try {
    do {
      var url = [
        'https://',
        request.configParams.host,
        '/rest/api/3/search?',
        'jql=',
        jql.join('+'),
        '&maxResults=100',
        '&startAt=',
        startAt,
        '&fields=*all'
      ];

      // Fetch and parse data from API
      response = UrlFetchApp.fetch(encodeURI(url.join('')), params);
      if (response.getResponseCode() === 200) {
        parsedResponse = JSON.parse(response);
        issues = issues.concat(parsedResponse.issues);
        total = parsedResponse.total;
        startAt += parsedResponse.maxResults;
      } else {
        switch (response.getResponseCode()) {
          case 400:
            throw 'ERROR: Bad request.';
          case 401:
            throw 'ERROR: Unauthorized. Please validate credentials.';
          case 500:
            throw 'ERROR: Server error.';
          default:
            throw 'ERROR: Code ' + response.getResponseCode();
        }
      }
    } while (startAt <= total);
  } catch (e) {
    DataStudioApp.createCommunityConnector()
      .newUserError()
      .setDebugText('Error fetching data from API. Exception details: ' + e)
      .setText(
        'There was an error communicating with the service. Try again later, or file an issue if this error persists.'
      )
      .throwException();
  }
  var rows = responseToRows(requestedFields, issues, request);
  return {
    schema: requestedFields.build(),
    rows: rows
  };
}

/**
 * Gets request params to call jira api using UrlFetchApp
 * @returns {object} Object containing request params
 */
function getParams() {
  var userProperties = PropertiesService.getUserProperties();
  var userName = userProperties.getProperty('dscc.username');
  var token = userProperties.getProperty('dscc.token');
  var headers = {
    Authorization: 'Basic ' + Utilities.base64Encode(userName + ':' + token)
  };
  var params = {
    contentType: 'application/json',
    headers: headers, // Authentication sent as a header
    method: 'get',
    validateHttpsCertificates: false,
    followRedirects: true,
    muteHttpExceptions: true,
    escaping: true
  };
  return params;
}
