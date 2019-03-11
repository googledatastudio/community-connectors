function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config
    .newInfo()
    .setId('connect')
    .setText(
      'This connector does not require any configuration. Click CONNECT at the top right to get started.'
    );

  config.setDateRangeRequired(true);

  return config.build();
}

function getFields() {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
    .newDimension()
    .setId('date')
    .setName('Date')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('explanation')
    .setName('Explanation')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('media_type')
    .setName('Media Type')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('title')
    .setName('Title')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('url')
    .setName('URL')
    .setType(types.URL);

  fields
    .newDimension()
    .setId('hdurl')
    .setName('High Definition URL')
    .setType(types.URL);

  fields
    .newDimension()
    .setId('copyright')
    .setName('Copyright')
    .setType(types.TEXT);

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
    'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY',
    '&date=',
    request.dateRange.endDate,
    '&hd=true',
  ];
  var response = UrlFetchApp.fetch(url.join(''));
  var item = JSON.parse(response.getContentText());

  var data = [];
  var values = [];
  requestedFields.asArray().forEach(function(field) {
    switch (field.getId()) {
      case 'date':
        values.push(item.date);
        break;
      case 'explanation':
        values.push(item.explanation);
        break;
      case 'copyright':
        values.push(item.copyright);
        break;
      case 'hdurl':
        values.push(item.hdurl);
        break;
      case 'media_type':
        values.push(item.media_type);
        break;
      case 'title':
        values.push(item.title);
        break;
      case 'url':
        values.push(item.url);
        break;
      default:
        values.push('');
    }
  });
  data.push({
    values: values,
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
