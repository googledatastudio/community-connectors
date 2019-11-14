/**
 * Builds the Community Connector fields object.
 * @return {Fields} The Community Connector fields.
 * @see https://developers.google.com/apps-script/reference/data-studio/fields
 */
function getFields() {
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

  fields.newDimension()
      .setId('key')
      .setName('Key')
      .setType(types.TEXT);
  
  fields.newDimension()
      .setId('statuscategorychangedate')
      .setName('Status category change date')
      .setType(types.YEAR_MONTH_DAY_HOUR);
  
  fields.newDimension()
      .setId('resolution')
      .setName('Resolution')
      .setType(types.TEXT);
  
  fields.newDimension()
      .setId('priotity')
      .setName('Priority')
      .setType(types.TEXT);
  
  fields.newDimension()
      .setId('labels')
      .setName('Labels')
      .setType(types.TEXT);
      
  fields.newDimension()
    .setId('assignee')
    .setName('Assignee')
    .setType(types.TEXT);
    
  fields.newDimension()
    .setId('status')
    .setName('Status')
    .setType(types.TEXT);
  
  fields.newDimension()
    .setId('statusCategory')
    .setName('Status Category')
    .setType(types.TEXT);
    
  fields.newDimension()
    .setId('components')
    .setName('Components')
    .setType(types.TEXT);
    
  fields.newDimension()
    .setId('creator')
    .setName('Creator')
    .setType(types.TEXT);
  
  fields.newDimension()
    .setId('reporter')
    .setName('Reporter')
    .setType(types.TEXT);
  
  fields.newDimension()
    .setId('issueLabel')
    .setName('Issue Label')
    .setType(types.TEXT);
    
  fields.newDimension()
    .setId('issuetype')
    .setName('Issue type')
    .setType(types.TEXT);
  
  fields.newDimension()
   .setId('project')
   .setName('Project')
   .setType(types.TEXT);
  
  fields.newDimension()
    .setId('resolutiondate')
    .setName('Resolution Date')
    .setType(types.YEAR_MONTH_DAY_HOUR);
  
  fields.newDimension()
    .setId('created')
    .setName('Created')
    .setType(types.YEAR_MONTH_DAY_HOUR);
  
  fields.newDimension()
   .setId('brand')
   .setName('Brand')
   .setType(types.TEXT);
  
  fields.newDimension()
    .setId('updated')
    .setName('Updated')
    .setType(types.YEAR_MONTH_DAY_HOUR);
  
  fields.newDimension()
   .setId('pullRequest')
   .setName('Pull Request')
   .setType(types.URL);
  
  fields.newDimension()
     .setId('sprint')
     .setName('Sprint')
     .setType(types.TEXT);
  
  fields.newDimension()
     .setId('description')
     .setName('Description')
     .setType(types.TEXT);
  
  fields.newDimension()
   .setId('brandCollection')
   .setName('Brand/Collection')
   .setType(types.TEXT);
  
  fields.newDimension()
   .setId('summary')
   .setName('Summary')
   .setType(types.TEXT);
  
  fields.newDimension()
    .setId('duedate')
    .setName('Due date')
    .setType(types.YEAR_MONTH_DAY_HOUR);
  
  fields.newDimension()
    .setId('started')
    .setName('Date started')
    .setType(types.YEAR_MONTH_DAY_HOUR);
  
  fields.newDimension()
    .setId('closed')
    .setName('Date closed')
    .setType(types.YEAR_MONTH_DAY_HOUR);
  
  fields.newMetric()
    .setId('durationInProgress')
    .setName('Time in progress')
    .setType(types.DURATION);
  
  fields.newMetric()
    .setId('daysInProgress')
    .setName('Days in progress')
    .setType(types.NUMBER);
  
  fields.newMetric()
    .setId('daysLastUpdated')
    .setName('Days last updated')
    .setType(types.NUMBER);
  
  fields.newMetric()
    .setId('daysSinceStatusCategoryChange')
    .setName('Days since last status category changed')
    .setType(types.NUMBER);
  
  fields.newMetric()
    .setId('points')
    .setName('Points')
    .setType(types.NUMBER);
  
  fields.newMetric()
    .setId('storyPoints')
    .setName('Story Points')
    .setType(types.NUMBER);
  
  fields.newMetric()
    .setId('actualStoryPoints')
    .setName('Actual Story Points')
    .setType(types.NUMBER);
    
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
  var fields = getFields().build();
  return {'schema': fields};
}