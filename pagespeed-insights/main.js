// NOTE: You can obtain a Google Page Speed Insights API Key from here: https://developers.google.com/speed/docs/insights/v5/get-started
function getAuthType() {
  return {
    type: 'KEY'
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
        placeholder: 'https://www.yourdomain.com/page'
      }
    ]
  };
  return config;
}

var fixedSchema = [
  {
    name: 'pageSpeedDesktop',
    label: 'PS Insights Desktop Score',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    },
    defaultAggregationType: 'AVG'
  },
  {
    name: 'pageSpeedMobile',
    label: 'PS Insights Mobile Score',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    },
    defaultAggregationType: 'AVG'
  },
  {
    name: 'OpportunitiesMobile',
    label: 'Opportunities - Mobile',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    },
    defaultAggregationType: 'AVG'
  },
  {
    name: 'OpportunitiesDesktop',
    label: 'Opportunities - Desktop',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      isReaggregatable: true
    },
    defaultAggregationType: 'AVG'
  },
  {
    name: 'weburl',
    label: 'weburlName',
    description: 'The uri of the website being analysed by Page Speed Insights',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'TEXT'
    }
  },
  {
    name: 'webReport',
    label: 'Insights Web Report',
    description: 'The uri of for the full Pagespeed Insights report',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'URL'
    }
  }
];

function getSchema(request) {
  return {schema: fixedSchema};
}
/**
 * @param {deviceCat} deviceCategory - Can be 'mobile' or 'desktop' only.
 */

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
  var urlToTest = request.configParams.urlTotest;

  var values = [];
  // Note Would be nice to do this with promises however this doesn't seem to work with Data Studio Connectors - I just get an error
  var urlMobile = buildUrl('mobile', key, urlToTest);
  var responseMobile = UrlFetchApp.fetch(urlMobile);
  var parsedResponseMobile = JSON.parse(responseMobile);

  // Get Opportunities
  var ruleResultsMobile = parsedResponseMobile.lighthouseResult.audits;
  var opportunitiesMobile = buildOpportunities(ruleResultsMobile);

  var urlDesktop = buildUrl('desktop', key, urlToTest);
  var responseDesktop = UrlFetchApp.fetch(urlDesktop);
  var parsedResponseDesktop = JSON.parse(responseDesktop);

  // Get Opportunities Desktop
  var ruleResultsDesktop = parsedResponseDesktop.lighthouseResult.audits;
  var opportunitiesDesktop = buildOpportunities(ruleResultsDesktop);

  requestedSchema.forEach(function(field) {
    switch (field.name) {
      case 'weburl':
        var urltoTest = request.configParams.urlTotest;
        values.push(urltoTest);
        break;
      case 'pageSpeedDesktop':
        var pageSpeedDesktop =
          parsedResponseDesktop.lighthouseResult.categories.performance.score;
        values.push(pageSpeedDesktop);
        break;
      case 'pageSpeedMobile':
        var pageSpeedMobile =
          parsedResponseMobile.lighthouseResult.categories.performance.score;
        values.push(pageSpeedMobile);
        break;
      case 'OpportunitiesDesktop':
        var desktopCount = Object.keys(opportunitiesDesktop).length;
        values.push(desktopCount);
        break;
      case 'OpportunitiesMobile':
        var mobileCount = Object.keys(opportunitiesMobile).length;
        values.push(mobileCount);
        break;
      case 'webReport':
        var urltoTest = request.configParams.urlTotest;
        var webReportUrl =
          'https://developers.google.com/speed/pagespeed/insights/?url=' +
          urltoTest;
        values.push(webReportUrl);
        break;

      default:
        values.push('');
        break;
    }
  });

  requestedData = [{values: values}];
  return {
    schema: requestedSchema,
    rows: requestedData
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
      errorCode: 'INVALID_CREDENTIALS'
    };
  }
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('dscc.key', key);
  return {
    errorCode: 'NONE'
  };
}

function resetAuth() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('dscc.key');
}

function buildUrl(deviceCat, key, urlToTest) {
  var urlparts = [
    'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=',
    urlToTest,
    '&strategy=',
    deviceCat,
    '&key=',
    key,
    '&category=performance'
  ];
  var url = urlparts.join('');
  return url;
}

function buildOpportunities(audits) {
  var opportunityThreshold = 0;

  for (var key in audits) {
    if (typeof audits[key].details === 'undefined') {
      delete audits[key];
    } else {
      if (
        audits[key].details.type != 'opportunity' ||
        audits[key].details.overallSavingsMs == opportunityThreshold
      ) {
        delete audits[key];
      }
    }
  }
  return audits;
}
function validateKey(key) {
  if (key == '' || key == null) {
    return false;
  } else {
    return true;
  }
}
