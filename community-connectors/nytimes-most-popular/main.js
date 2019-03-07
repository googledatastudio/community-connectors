function getConfig(request) {

  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config.newInfo()
  .setId("connect")
  .setText("This connector does not require any configuration. Click CONNECT at the top right to get started.")

  return config.build();
};

function getFields() {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields.newDimension()
  .setId("section")
  .setName("Section")
  .setType(types.TEXT);

  fields.newDimension()
  .setId("title")
  .setName("Title")
  .setType(types.TEXT);

  fields.newDimension()
  .setId("abstract")
  .setName("Abstract")
  .setType(types.TEXT);

  fields.newDimension()
  .setId("url")
  .setName("URL")
  .setType(types.URL);

  fields.newDimension()
  .setId("byline")
  .setName("Byline")
  .setType(types.TEXT);

  fields.newDimension()
  .setId("source")
  .setName("Source")
  .setType(types.TEXT);

  fields.newDimension()
  .setId("published_date")
  .setName("Published Date")
  .setType(types.TEXT);

  fields.newMetric()
  .setId("count")
  .setName("Count of Articles")
  .setType(types.NUMBER);

  return fields;
};

function getSchema(request) {
  return {'schema': getFields().build()};
}

function getData(request) {
  var userProperties = PropertiesService.getUserProperties();
  var key = userProperties.getProperty('dscc.key');

  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  var requestedFields = getFields().forIds(requestedFieldIds);

  var url = [
    'https://api.nytimes.com/svc/mostpopular/v2/mostviewed/all-sections/1.json?api-key=',
    key
  ];
  var response = JSON.parse(UrlFetchApp.fetch(url.join(''))).results;

  var data = [];
  response.forEach(function(item) {
    var values = [];
    requestedFields.asArray().forEach(function(field) {
      switch(field.getId()) {
        case 'section':
          values.push(item.section);
          break;
        case 'title':
          values.push(item.title);
          break;
        case 'abstract':
          values.push(item.abstract);
          break;
        case 'url':
          values.push(item.url);
          break;
        case 'byline':
          values.push(item.byline);
          break;
        case 'source':
          values.push(item.source);
          break;
        case 'published_date':
          values.push(item.published_date);
          break;
        case 'count':
          values.push(1);
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
    schema: requestedFields.build(),
    rows: data
  };

};

function getAuthType() {
  return {
    "type": "KEY"
  };
}

function validateKey(key) {
  var url = [
    'https://api.nytimes.com/svc/mostpopular/v2/mostviewed/all-sections/1.json?api-key=',
    key
  ];
  var response = JSON.parse(UrlFetchApp.fetch(url.join(''), {'muteHttpExceptions':true}));

  return response.status == 'OK';
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
    errorCode: "NONE"
  };
}

function isAdminUser() {
  return false;
};
