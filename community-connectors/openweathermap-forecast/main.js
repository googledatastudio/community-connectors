function getConfig(request) {
  var config = {
    configParams: [
      {
        type: 'TEXTINPUT',
        name: 'apiKey',
        displayName: 'API Key',
        helpText: 'Enter your API key. You can signup for an OpenWeatherMap API key at https://openweathermap.org/appid',
        placeholder: 'Enter API Key'
      },
      {
        name: 'cityName',
        displayName: 'City',
        helpText: 'Enter the name of the city for which you would like to retrieve the weather forecast.',
        placeholder: 'e.g. Toronto'
      },
      {
        name: 'countryCode',
        displayName: 'Country Code',
        helpText: 'Enter the ISO 3166 two-letter country code for the city entered above (e.g. enter "US" for United States or "CA" for Canada).',
        placeholder: 'e.g. CA'
      },
      {
        name: 'utcOffset',
        displayName: 'UTC Offset',
        helpText: 'Enter the timezone offset (relative to UTC) for the city entered above',
        placeholder: 'e.g. -5'
      }
    ]
  };
  return config;
};

var fixedSchema = [

  {
    name: 'city.coord.lon',
    label: 'Longitude',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'city.coord.lat',
    label: 'Latitude',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'city.id',
    label: 'City ID',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'city.name',
    label: 'City Name',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'city.country',
    label: 'Country Code',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'dt',
    label: 'Time of Forecast',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'main.temp',
    label: 'Temperature',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: false
    }
  },
  {
    name: 'main.pressure',
    label: 'Pressure',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: false
    }
  },
  {
    name: 'main.humidity',
    label: 'Humidity',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: false
    }
  },
  {
    name: 'weather.main',
    label: 'Weather Main',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'weather.description',
    label: 'Weather Description',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'weather.icon',
    label: 'Weather Icon',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'clouds.all',
    label: 'Cloudiness',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: false
    }
  },
  {
    name: 'wind.speed',
    label: 'Wind Speed',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: false
    }
  },
  {
    name: 'wind.deg',
    label: 'Wind Direction (degrees)',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: false
    }
  },
  {
    name: 'wind.speed',
    label: 'Wind Speed',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: false
    }
  },
  {
    name: 'wind.deg',
    label: 'Wind Direction (degrees)',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: false
    }
  }
];

function getSchema(request) {
  return {schema: fixedSchema};
};

function getData(request) {
  var dataSchema = [];
  request.fields.forEach(function(field) {
    for (var i = 0; i < fixedSchema.length; i++) {
      if (fixedSchema[i].name === field.name) {
        dataSchema.push(fixedSchema[i]);
        break;
      }
    }
  });

  var url = [
    'api.openweathermap.org/data/2.5/forecast?units=metric&appid=',
    request.configParams.apiKey,
    '&q=',
    request.configParams.cityName,
    ',',
    request.configParams.countryCode
  ];
  var response = UrlFetchApp.fetch(url.join(''));
  var forecast = JSON.parse(response.getContentText());

  var data = [];
  forecast.list.forEach(function(item) {
    var values = [];
    dataSchema.forEach(function(field) {
      switch(field.name) {
        case 'city.id':
          values.push(forecast.city.id);
          break;
        case 'city.name':
          values.push(forecast.city.name);
          break;
        case 'city.country':
          values.push(forecast.city.country);
          break;
        case 'city.coord.lat':
          values.push(forecast.city.coord.lat);
          break;
        case 'city.coord.lon':
          values.push(forecast.city.coord.lon);
          break;
        case 'dt':
          var dayTime = new Date((item.dt+(request.configParams.utcOffset*3600))*1000);
          values.push(
            dayTime.toISOString().slice(0,10).replace(/-/g,"")
            + (dayTime.getHours()<10?'0':'') + dayTime.getHours()
          );
          break;
        case 'main.temp':
          values.push(item.main.temp);
          break;
        case 'main.pressure':
          values.push(item.main.pressure);
          break;
        case 'main.humidity':
          values.push(item.main.humidity);
          break;
        case 'weather.main':
          values.push(item.weather[0].main);
          break;
        case 'weather.description':
          values.push(item.weather[0].description);
          break;
        case 'weather.icon':
          values.push(item.weather[0].icon);
          break;
        case 'clouds.all':
          values.push(item.clouds.all);
          break;
        case 'wind.speed':
          values.push(item.wind.speed);
          break;
        case 'wind.deg':
          values.push(item.wind.deg);
          break;
        default:
          values.push('');
      }
    });
    data.push({
      values: values
    });
  });


  return {
    schema: dataSchema,
    rows: data
  };
};

function getAuthType() {
  var response = {
    "type": "NONE"
  };
  return response;
};

function isAdminUser() {
  return false;
};
