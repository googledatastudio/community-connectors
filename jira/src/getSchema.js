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
        .setId(field.id)
        .setName(field.name)
        .setType(type);
      }
      else{
        fields.newDimension()
        .setId(field.id)
        .setName(field.name)
        .setType(type);
      }
    }
  );
  
//  
//  fields.newDimension()
//      .setId('statuscategorychangedate')
//      .setName('Status category change date')
//      .setType(types.YEAR_MONTH_DAY_HOUR);
//  
//  fields.newDimension()
//      .setId('resolution')
//      .setName('Resolution')
//      .setType(types.TEXT);
//  
//  fields.newDimension()
//      .setId('priotity')
//      .setName('Priority')
//      .setType(types.TEXT);
//  
//  fields.newDimension()
//      .setId('labels')
//      .setName('Labels')
//      .setType(types.TEXT);
//      
//  fields.newDimension()
//    .setId('assignee')
//    .setName('Assignee')
//    .setType(types.TEXT);
//    
//  fields.newDimension()
//    .setId('status')
//    .setName('Status')
//    .setType(types.TEXT);
//  
//  fields.newDimension()
//    .setId('statusCategory')
//    .setName('Status Category')
//    .setType(types.TEXT);
//    
//  fields.newDimension()
//    .setId('components')
//    .setName('Components')
//    .setType(types.TEXT);
//    
//  fields.newDimension()
//    .setId('creator')
//    .setName('Creator')
//    .setType(types.TEXT);
//  
//  fields.newDimension()
//    .setId('reporter')
//    .setName('Reporter')
//    .setType(types.TEXT);
//  
//  fields.newDimension()
//    .setId('issueLabel')
//    .setName('Issue Label')
//    .setType(types.TEXT);
//    
//  fields.newDimension()
//    .setId('issuetype')
//    .setName('Issue type')
//    .setType(types.TEXT);
//  
//  fields.newDimension()
//   .setId('project')
//   .setName('Project')
//   .setType(types.TEXT);
//  
//  fields.newDimension()
//    .setId('resolutiondate')
//    .setName('Resolution Date')
//    .setType(types.YEAR_MONTH_DAY_HOUR);
//  
//  fields.newDimension()
//    .setId('created')
//    .setName('Created')
//    .setType(types.YEAR_MONTH_DAY_HOUR);
//  
//  fields.newDimension()
//   .setId('brand')
//   .setName('Brand')
//   .setType(types.TEXT);
//  
//  fields.newDimension()
//    .setId('updated')
//    .setName('Updated')
//    .setType(types.YEAR_MONTH_DAY_HOUR);
//  
//  fields.newDimension()
//   .setId('pullRequest')
//   .setName('Pull Request')
//   .setType(types.URL);
//  
//  fields.newDimension()
//     .setId('sprint')
//     .setName('Sprint')
//     .setType(types.TEXT);
//  
//  fields.newDimension()
//     .setId('description')
//     .setName('Description')
//     .setType(types.TEXT);
//  
//  fields.newDimension()
//   .setId('brandCollection')
//   .setName('Brand/Collection')
//   .setType(types.TEXT);
//  
//  fields.newDimension()
//   .setId('summary')
//   .setName('Summary')
//   .setType(types.TEXT);
//  
//  fields.newDimension()
//    .setId('duedate')
//    .setName('Due date')
//    .setType(types.YEAR_MONTH_DAY_HOUR);
//  
//  fields.newDimension()
//    .setId('started')
//    .setName('Date started')
//    .setType(types.YEAR_MONTH_DAY_HOUR);
//  
//  fields.newDimension()
//    .setId('closed')
//    .setName('Date closed')
//    .setType(types.YEAR_MONTH_DAY_HOUR);
//  
//  fields.newMetric()
//    .setId('durationInProgress')
//    .setName('Time in progress')
//    .setType(types.DURATION);
//  
//  fields.newMetric()
//    .setId('daysInProgress')
//    .setName('Days in progress')
//    .setType(types.NUMBER);
//  
//  fields.newMetric()
//    .setId('daysLastUpdated')
//    .setName('Days last updated')
//    .setType(types.NUMBER);
//  
//  fields.newMetric()
//    .setId('daysSinceStatusCategoryChange')
//    .setName('Days since last status category changed')
//    .setType(types.NUMBER);
//  
//  fields.newMetric()
//    .setId('points')
//    .setName('Points')
//    .setType(types.NUMBER);
//  
//  fields.newMetric()
//    .setId('storyPoints')
//    .setName('Story Points')
//    .setType(types.NUMBER);
//  
//  fields.newMetric()
//    .setId('actualStoryPoints')
//    .setName('Actual Story Points')
//    .setType(types.NUMBER);
    
//  fields.newMetric()
//      .setId('downloads')
//      .setName('Downloads')
//      .setType(types.NUMBER)
//      .setAggregation(aggregations.SUM);

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
function getJiraFields(request){
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
      '/rest/api/2/field?'
  ];
    
    // Fetch and parse data from API
  var response = UrlFetchApp.fetch(encodeURI(url.join('')), params);
  return JSON.parse(response);
}