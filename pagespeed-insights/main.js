//NOTE: You can obtain a Google Page Speed Insights API Key from here: https://developers.google.com/speed/docs/insights/v4/first-app
function getAuthType() {
  return {
    type: 'KEY',
  };
}

function isAuthValid() {
  var userProperties = PropertiesService.getUserProperties();
  var key = userProperties.getProperty('dscc.key');
  var isValid = validateKey(key);
  return isValid;
}

function getConfig(request) {
  var config = {
    configParams: [
      {
        name: 'urlTotest',
        displayName: 'Url to generate a Page Speed Insights Score',
        helpText: 'Enter the webpage url to get the Page Speed.',
        placeholder: 'http://www.yourdomain.com/page',
      },
    ],
  };
  return config;
}

var fixedSchema = [
  {
    name: 'pageSpeed',
    label: 'Page Speed Insights Score',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true,
    },
    defaultAggregationType: 'AVG',
  },
  {
    name: 'weburl',
    label: 'weburlName',
    description: 'The uri of the website being analysed by Page Speed Insights',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'TEXT',
    },
  },
];

function getSchema(request) {
  return {schema: fixedSchema};
}

function getData(request) {
  // Create schema for requested fields
  var requestedSchema = request.fields.map(function(field) {
    for (var i = 0; i < fixedSchema.length; i++) {
      if (fixedSchema[i].name == field.name) {
        return fixedSchema[i];
      }
    }
  });
  // Fetch and parse data from API
  var userProperties = PropertiesService.getUserProperties();
  var key = userProperties.getProperty('dscc.key');

  var urlparts = [
    'https://www.googleapis.com/pagespeedonline/v4/runPagespeed?url=',
    request.configParams.urlTotest,
    '&strategy=mobile&key=',
    key,
    '&fields=ruleGroups',
  ];
  var url = urlparts.join('');
  var response = UrlFetchApp.fetch(url);
  var parsedResponse = JSON.parse(response);

  var values = [];

  requestedSchema.forEach(function(field) {
    switch (field.name) {
      case 'weburl':
        var urltoTest = request.configParams.urlTotest;
        values.push(urltoTest);
        break;
      case 'pageSpeed':
        var pageSpeed = parsedResponse.ruleGroups.SPEED.score;
        values.push(pageSpeed);
        break;
      default:
        values.push('');
        break;
    }
  });
  requestedData = [{values: values}];
  return {
    schema: requestedSchema,
    rows: requestedData,
  };
}

function isAdminUser() {
  return false;
}

function setCredentials(request) {
  var key = request.key;
  var validCreds = validateKey(key);
  if (!validCreds) {
    return {
      errorCode: 'INVALID_CREDENTIALS',
    };
  }
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('dscc.key', key);
  return {
    errorCode: 'NONE',
  };
}

function resetAuth() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('dscc.key');
}

function validateKey(key) {
  if (key == '' || key == null) {
    return false;
  } else {
    return true;
  }
}
