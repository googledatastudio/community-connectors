var cc = DataStudioApp.createCommunityConnector();

function isAdminUser() {
  return true;
}

function getAuthType() {
  var AuthTypes = cc.AuthType;
  return cc
      .newAuthTypeResponse()
      .setAuthType(AuthTypes.NONE)
      .build();
}

function getConfig() {
  var config = cc.getConfig();

  config
      .newTextInput()
      .setId('customer_id')
      .setName(
          'Enter adwords customer id'
      )
      .setHelpText('Enter adwords customer id [xxx-xxx-xxxx]')
      .setAllowOverride(false);

  config
      .newTextInput()
      .setId('country_code')
      .setName(
          'Enter country code'
      )
      .setHelpText('Enter country code [EN]')
      .setAllowOverride(false);

  config
      .newTextInput()
      .setId('token')
      .setName(
          'Enter token'
      )
      .setHelpText('Enter token [02t56g74fu2-3ir457]')
      .setAllowOverride(false);

  config.setDateRangeRequired(true);

  return config.build();
}

function getFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
      .newDimension()
      .setId('date')
      .setName('Date')
      .setType(types.YEAR_MONTH_DAY);

  fields
      .newDimension()
      .setId('customer_id')
      .setName('Customer id')
      .setType(types.TEXT);

  fields
      .newDimension()
      .setId('customer_full_name')
      .setName('Customer full name')
      .setType(types.TEXT);

  fields
      .newDimension()
      .setId('campaign_id')
      .setName('Campaign id')
      .setType(types.TEXT);

  fields
      .newDimension()
      .setId('domain')
      .setName('Domain')
      .setType(types.TEXT);

  fields
      .newDimension()
      .setId('changed_entity')
      .setName('Changed entity')
      .setType(types.TEXT);

  fields
      .newDimension()
      .setId('changed_operation')
      .setName('Changed operation')
      .setType(types.TEXT);

  fields
      .newMetric()
      .setId('changed_value')
      .setName('Changed value')
      .setType(types.NUMBER)
      .setAggregation(aggregations.SUM);

  fields
      .newMetric()
      .setId('impressions')
      .setName('Impressions')
      .setType(types.NUMBER)
      .setAggregation(aggregations.SUM);

  fields
      .newMetric()
      .setId('overlap_rate')
      .setName('Overlap rate')
      .setType(types.NUMBER)
      .setAggregation(aggregations.AVG);

  fields
      .newMetric()
      .setId('competitor_above_rate')
      .setName('Competitor above rate')
      .setType(types.NUMBER)
      .setAggregation(aggregations.AVG);

  fields
      .newMetric()
      .setId('promoted_rate')
      .setName('Promoted rate')
      .setType(types.NUMBER)
      .setAggregation(aggregations.AVG);

  fields
      .newMetric()
      .setId('outranking_share')
      .setName('Outranking share')
      .setType(types.NUMBER)
      .setAggregation(aggregations.AVG);

  return fields;
}

function getSchema(request) {
  return {schema: getFields().build()};
}

function getData(request) {
  var requestedFields = getFields().forIds(
      request.fields.map(function(field) {
        return field.name;
      })
  );
  var requestedFieldsArray = request.fields.map(function(field) {
    return field.name;
  });

  if (!request.configParams.customer_id) {
    throw new Error('Invalid customer id');
  }

  if (!request.configParams.token) {
    throw new Error('Invalid token');
  }
  var host = '';
  switch(request.configParams.country_code) {
    case 'PL':
    case 'EN':
      host = 'promonavigator.com';
      break;
    case 'ID':
      host = 'promonaviasia.com'
      break;
    default:
      throw new Error('Unsupported country');
  }

  var url = [
    'https://' + host + '/api/tools/data_for_datastudio?',
    'date_from=' + request.dateRange.startDate + '&',
    'date_to=' + request.dateRange.endDate + '&',
    'token=' + request.configParams.token + '&',
    'adwords_customer_id=' + request.configParams.customer_id
  ].join('');

  var response = JSON.parse(UrlFetchApp.fetch(url).getContentText());

  var fieldmap = {};
  for (var j = 0; j < response.response.fields.length; j++) {
    fieldmap[response.response.fields[j]] = j;
  }

  var rows = [];
  for (var i = 0; i < response.response.data.length; i++) {
    var item = [];
    for (var j = 0; j < requestedFieldsArray.length; j++) {
      item.push(response.response.data[i][fieldmap[requestedFieldsArray[j]]]);
    }
    rows.push({values: item});
  }

  return {
    schema: requestedFields.build(),
    rows: rows
  };
}