function getConfig(request) {
  var config = {
    dateRangeRequired: true,
    configParams: [
      {
        name: 'AppId',
        displayName: 'App Id',
        helpText: 'The id of your app. Go to: Account -> Apps -> Choose the app and take the id from the url',
        placeholder: '123123123'
      },
      {
        name: 'UserName',
        displayName: 'Username',
        helpText: 'The username which you login with to heyzap',
        placeholder: 'mycoolname'
      },
      {
        name: 'ApiKey',
        displayName: 'Api key',
        helpText: 'The api key. Can be found under: Account -> Account Details -> API Key',
        placeholder: 'asdf12ea34asdf3tasdfa4'
      }
    ]
  };
  return config;
}
function getData(request) {
  var url = [
    'https://developers.heyzap.com/api/v2/publisher/applications/stats?app_id=',
    request.configParams.AppId,
    '&developer=',
    request.configParams.UserName,
    '&end_date=',
    request.dateRange.endDate,
    '&key=',
    request.configParams.ApiKey,
    '&start_date=',
    request.dateRange.startDate
    ];
  debugger;
  // Fetch the data.
  // By default URL fetch will throw an exception if the response code indicates failure.
  var response = UrlFetchApp.fetch(url.join(''));
  var revenues = JSON.parse(response.getContentText());

  // Prepare the schema for the fields requested.
  var dataSchema = [];
  request.fields.forEach(function(field) {
    for (var i=0; i < fixedSchema.length; i++) {
      if (fixedSchema[i].name == field.name) {
        dataSchema.push(fixedSchema[i]);
        break;
      }
    }
  });

  // Prepare the tabular data.
  var data = [];
  revenues.data.forEach(function(revenueday) {
    revenueday.data.forEach(function(specificrevenue) {
      
       var values = [];
      // Provide values in the order defined by the schema.
      dataSchema.forEach(function(field) {
        switch(field.name) {
          case 'CountryName':
            values.push(specificrevenue.country_code);
            break;
          case 'Network':
            values.push(revenueday.network);
            break;
          case 'RevenueDate':
            values.push(revenueday.network.replace('-', ''));
            break;
          case 'Impressions':
            values.push(specificrevenue.impressions);
            break;
          case 'RevenueUSD':
            values.push(specificrevenue.revenue_in_cents/100);
            break;
          case 'Clicks':
            values.push(specificrevenue.clicks);
            break;
          default:
            values.push('');
        }
      });
      data.push({
        values: values
      });
      
      
    });
   
  });

  return {
    schema: dataSchema,
    rows: data
  };
}


var fixedSchema = [
  {
    name: 'CountryName',
    label: 'Country',
    description: 'The name of the country.',
    group: 'Geo',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'COUNTRY_CODE',
      semanticGroup: 'GEO'
    }
  },
  {
    name: 'Network',
    label: 'Network',
    description: 'The ad network.. unity/admob etc..',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'RevenueDate',
    label: 'Time',
    description: '',
    group: 'Date',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'YEAR_MONTH_DAY',
      semanticGroup: 'DATE_AND_TIME'
    }
  },
  {
    name: 'Impressions',
    label: 'Impressions',
    description: 'Number of impressions that was recorded',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      semanticGroup: 'NUMERIC'
    }
  },
  {
    name: 'RevenueUSD',
    label: 'Revenue',
    description: 'How much usd has been earned',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticGroup: "CURRENCY",
      semanticType: "CURRENCY_USD"
    }
  },
  {
    name: 'eCMPUSD',
    label: 'ePCM',
    description: 'total usd revenue per 1000 impressions',
    dataType: 'NUMBER',
    formula: "SUM(Revenue)/(SUM(Impressions)/1000)",
    semantics: {
      conceptType: 'METRIC',
      semanticGroup: "CURRENCY",
      semanticType: "CURRENCY_USD"
    },
    defaultAggregationType: "AVG"
  },
  {
    name: 'Clicks',
    label: 'Clicks',
    description: 'How many times an ad was clicked',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      semanticGroup: 'NUMERIC'
    }
  }
];

function getSchema(request) {
  return {schema: fixedSchema};
}

function getAuthType() {
  var response = {
    "type": "NONE"
  };
  return response;
}