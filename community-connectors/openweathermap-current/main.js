function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config
    .newTextInput()
    .setId('cityName')
    .setName('City')
    .setHelpText(
      'Enter the name of the city for which you would like to retrieve the current weather.'
    )
    .setPlaceholder('e.g. Toronto');

  config
    .newTextInput()
    .setId('countryCode')
    .setName('Country Code')
    .setHelpText(
      'Enter the ISO 3166 two-letter country code for the city entered above (e.g. enter "US" for United States or "CA" for Canada).'
    )
    .setPlaceholder('e.g. CA');

  config
    .newTextInput()
    .setId('utcOffset')
    .setName('UTC Offset')
    .setHelpText(
      'Enter the timezone offset (relative to UTC) for the city entered above'
    )
    .setPlaceholder('e.g. -5');

  return config.build();
}

function getFields() {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
    .newDimension()
    .setId('coord.lon')
    .setName('Longitude')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('coord.lat')
    .setName('Latitude')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('dt')
    .setName('Time updated')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('id')
    .setName('City ID')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('name')
    .setName('City Name')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('weather.main')
    .setName('Weather Main')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('weather.description')
    .setName('Weather Description')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('weather.icon')
    .setName('Weather Icon')
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId('main.temp')
    .setName('Temperature')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('main.pressure')
    .setName('Pressure')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('main.humidity')
    .setName('Humidity')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('wind.speed')
    .setName('Wind Speed')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('wind.deg')
    .setName('Wind Direction (degrees)')
    .setType(types.NUMBER);

  fields
    .newMetric()
    .setId('clouds.all')
    .setName('Cloudiness')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('sys.country')
    .setName('Country Code')
    .setType(types.TEXT);

  return fields;
}

function getSchema(request) {
  return {schema: getFields().build()};
}

function getData(request) {
  var userProperties = PropertiesService.getUserProperties();
  var key = userProperties.getProperty('dscc.key');

  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  var requestedFields = getFields().forIds(requestedFieldIds);

  var url = [
    'http://api.openweathermap.org/data/2.5/weather?units=metric&appid=',
    key,
    '&q=',
    request.configParams.cityName,
    ',',
    request.configParams.countryCode
  ];
  var item = JSON.parse(UrlFetchApp.fetch(url.join('')));

  var data = [];

  var values = [];
  requestedFields.asArray().forEach(function(field) {
    switch (field.getId()) {
      case 'coord.lon':
        values.push(item.coord.lon);
        break;
      case 'coord.lat':
        values.push(item.coord.lat);
        break;
      case 'dt':
        var dayTime = new Date(
          (item.dt + request.configParams.utcOffset * 3600) * 1000
        );
        values.push(
          dayTime
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, '') +
            (dayTime.getHours() < 10 ? '0' : '') +
            dayTime.getHours()
        );
        break;
      case 'id':
        values.push(item.id);
        break;
      case 'name':
        values.push(item.name);
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
      case 'main.temp':
        values.push(item.main.temp);
        break;
      case 'main.pressure':
        values.push(item.main.pressure);
        break;
      case 'main.humidity':
        values.push(item.main.humidity);
        break;
      case 'wind.speed':
        values.push(item.wind.speed);
        break;
      case 'wind.deg':
        values.push(item.wind.deg);
        break;
      case 'clouds.all':
        values.push(item.clouds.all);
        break;
      case 'sys.country':
        values.push(item.sys.country);
        break;
      default:
        values.push('');
    }
  });
  data.push({
    values: values
  });

  return {
    schema: requestedFields.build(),
    rows: data
  };
}

function getAuthType() {
  return {
    type: 'KEY'
  };
}

function validateKey(key) {
  var url =
    'http://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + key;
  var response = JSON.parse(UrlFetchApp.fetch(url, {muteHttpExceptions: true}));

  return response.cod == '401' ? false : true;
}

function isAuthValid() {
  var userProperties = PropertiesService.getUserProperties();
  var key = userProperties.getProperty('dscc.key');

  return validateKey(key);
}

function resetAuth() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('dscc.key');
}

function setCredentials(request) {
  var key = request.key;

  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('dscc.key', key);
  return {
    errorCode: 'NONE'
  };
}

function isAdminUser() {
  return false;
}
