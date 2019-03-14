function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config
    .newInfo()
    .setId('connect')
    .setText(
      'This connector does not require any configuration. Click CONNECT at the top right to get started.'
    );

  return config.build();
}

function getFields() {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
    .newDimension()
    .setId('name')
    .setName('Satellite Name')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('id')
    .setName('Satellite ID')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('latitude')
    .setName('Latitude')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('longitude')
    .setName('Longitude')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('latLong')
    .setName('Latitude, Longitude')
    .setType(types.LATITUDE_LONGITUDE);

  fields
    .newDimension()
    .setId('altitude')
    .setName('Altitude')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('velocity')
    .setName('Velocity')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('visibiltiy')
    .setName('Visibility')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('footprint')
    .setName('Footprint')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('timestamp')
    .setName('Timestamp')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('daynum')
    .setName('Day Number')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('solar_lat')
    .setName('Solar Latitude')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('solar_lon')
    .setName('Solar Longitude')
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId('units')
    .setName('Units')
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId('count')
    .setName('Count')
    .setType(types.NUMBER);

  return fields;
}

function getSchema(request) {
  return {schema: getFields().build()};
}

function getData(request) {
  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  var requestedFields = getFields().forIds(requestedFieldIds);

  if (!Date.now) {
    Date.now = function now() {
      return new Date().getTime();
    };
  }

  var t = Date.now() / 1000;

  var timestamps = [];
  for (var i = 0; i < 10; i++) {
    timestamps.push(t);
    t = t - 60 * 5;
  }

  var url = [
    'https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=',
    timestamps.join()
  ];
  var response = JSON.parse(UrlFetchApp.fetch(url.join('')));

  var data = [];
  response.forEach(function(item) {
    var values = [];
    requestedFields.asArray().forEach(function(field) {
      switch (field.getId()) {
        case 'count':
          values.push('1');
          break;
        case 'latLong':
          values.push(item.latitude + ',' + item.longitude);
          break;
        default:
          if (!!item[field.getId()]) {
            values.push(item[field.getId()]);
          } else {
            values.push('');
          }
      }
    });
    data.push({
      values: values
    });
  });
  return {
    schema: requestedFields.build(),
    rows: data
  };
}

function getAuthType() {
  var response = {
    type: 'NONE'
  };
  return response;
}

function isAdminUser() {
  return false;
}
