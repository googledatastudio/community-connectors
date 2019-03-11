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
    .setName('Station Name')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('abbr')
    .setName('Station Abbreviation')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('destination')
    .setName('Destination')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('abbreviation')
    .setName('Destination Abbreviation')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('limited')
    .setName('Limited')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('minutes')
    .setName('Minutes')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('platform')
    .setName('Platform')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('direction')
    .setName('Direction')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('length')
    .setName('Length')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('color')
    .setName('Color')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('hexcolor')
    .setName('Hex Color')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('bikeflag')
    .setName('Bike Flag')
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId('delay')
    .setName('Delay')
    .setType(types.NUMBER);

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

  var url = [
    'http://api.bart.gov/api/etd.aspx?cmd=etd&orig=ALL&json=y&key=MW9S-E7SL-26DU-VV8V',
  ];
  var response = JSON.parse(UrlFetchApp.fetch(url.join(''))).root.station;

  var data = [];
  response.forEach(function(station) {
    station.etd.forEach(function(dest) {
      dest.estimate.forEach(function(train) {
        var values = [];
        requestedFields.asArray().forEach(function(field) {
          switch (field.getId()) {
            case 'name':
              values.push(station.name);
              break;
            case 'abbr':
              values.push(station.abbr);
              break;
            case 'destination':
              values.push(dest.destination);
              break;
            case 'abbreviation':
              values.push(dest.abbreviation);
              break;
            case 'limited':
              values.push(dest.limited);
              break;
            case 'minutes':
              values.push(train.minutes);
              break;
            case 'platform':
              values.push(train.platform);
              break;
            case 'direction':
              values.push(train.direction);
              break;
            case 'length':
              values.push(train.length);
              break;
            case 'color':
              values.push(train.color);
              break;
            case 'hexcolor':
              values.push(train.hexcolor);
              break;
            case 'bikeflag':
              values.push(train.bikeflag);
              break;
            case 'delay':
              values.push(train.delay);
              break;
            case 'count':
              values.push(1);
              break;
            default:
              values.push('');
          }

          data.push({
            values: values,
          });
        });
      });
    });
  });

  return {
    schema: requestedFields.build(),
    rows: data,
  };
}

function getAuthType() {
  var response = {
    type: 'NONE',
  };
  return response;
}

function isAdminUser() {
  return false;
}
