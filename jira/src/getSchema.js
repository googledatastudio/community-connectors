/**
 * Builds the Community Connector fields object.
 * @return {Fields} The Community Connector fields.
 * @see https://developers.google.com/apps-script/reference/data-studio/fields
 */
function getFields(fieldsData) {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;
  fields.newDimension()
      .setId('id')
      .setName('ID')
      .setType(types.TEXT);
  fields.newDimension()
      .setId('url')
      .setName('Url')
      .setType(types.URL);
  fieldsData.forEach(
    function(field){
      var type = null;
      var fieldSchema = field.schema ? field.schema.type : null;
      switch(fieldSchema){
        case 'datetime':
          type = types.YEAR_MONTH_DAY_HOUR;
          break;
        case 'number':
          type = types.NUMBER;
        default:
          type = types.TEXT;
      };
      if(fieldSchema === 'number'){
        fields.newMetric()
        .setDescription(field.id)
        .setId(field.key)
        .setName(field.name)
        .setType(type);
      }
      else{
        fields.newDimension()
        .setDescription(field.id)
        .setId(field.key)
        .setName(field.name)
        .setType(type);
      }
    }
  );
  return fields;
}

/**
 * Builds the Community Connector schema.
 * @param {object} request The request.
 * @return {object} The schema.
 */
function getSchema(request) {
  var fieldsData = getJiraFields(request);
  var fields = getFields(fieldsData).build();
  return {'schema': fields};
}

/**
 * Builds the Community Connector schema.
 * @param {object} request The request.
 * @return {object} Jira fields.
 */
function getJiraFields(request) {
  var headers = {
    "Authorization":"Basic " + Utilities.base64Encode(request.configParams.username + ':' + request.configParams.apiToken)
  };
  var params = {
    "contentType":"application/json",
    "headers":headers, //Authentication sent as a header
    "method":'get',
    "validateHttpsCertificates":false,
    "followRedirects":true,
    "muteHttpExceptions":true,
    "escaping":true
  };
  var url = [
      'https://',
      request.configParams.host,
      '/rest/api/3/field?'
  ];
  // Fetch and parse data from API
  var response = UrlFetchApp.fetch(encodeURI(url.join('')), params);
  return JSON.parse(response);
}
