function getAuthType() {
  var response = {type: 'NONE'};
  return response;
}

function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config
    .newInfo()
    .setId('instructions')
    .setText(
      'Access all historical data from NovelCOVID API. No configuration required.'
    );

  return config.build();
}

function getFields(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
    .newDimension()
    .setId('country')
    .setType(types.TEXT);
  fields
    .newDimension()
    .setId('province')
    .setType(types.TEXT);
  fields
    .newDimension()
    .setId('day')
    .setType(types.YEAR_MONTH_DAY);
  fields
    .newDimension()
    .setId('cases')
    .setType(types.NUMBER);
  fields
    .newDimension()
    .setId('deaths')
    .setType(types.NUMBER);

  return fields;
}

function getSchema(request) {
  var fields = getFields(request).build();
  return {schema: fields};
}

function responseToRows(requestedFields, response) {
  // Transform parsed data and filter for requested fields
  var rows = [];
  response.map(function(data) {
    var country = data.country;
    var province = data.province;
    var days = Object.keys(data.timeline.cases);
    var cases = data.timeline.cases;
    var deaths = data.timeline.deaths;
    days.forEach(function(day) {
      var row = [];
      requestedFields.asArray().forEach(function(field) {
        switch (field.getId()) {
          case 'country':
            return row.push(country);
          case 'province':
            return row.push(province);
          case 'day':
            var datepart = day.split('/');
            var cYear = '20' + datepart[2];
            var cMonth =
              datepart[0].length == 1 ? '0' + datepart[0] : datepart[0];
            var cDay =
              datepart[1].length == 1 ? '0' + datepart[1] : datepart[1];
            return row.push(cYear + cMonth + cDay);
          case 'cases':
            return row.push(cases[day]);
          case 'deaths':
            return row.push(deaths[day]);
          default:
            return row.push('');
        }
      });
      rows.push({values: row});
    });
  });
  return rows;
}

function getData(request) {
  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  var requestedFields = getFields().forIds(requestedFieldIds);

  // Fetch and parse data from API
  var url = 'https://corona.lmao.ninja/v2/historical';
  var response = UrlFetchApp.fetch(url);
  var parsedResponse = JSON.parse(response);
  var rows = responseToRows(requestedFields, parsedResponse);

  return {
    schema: requestedFields.build(),
    rows: rows
  };
}

function isAdminUser() {
  return false;
}
