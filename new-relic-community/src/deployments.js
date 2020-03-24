/**
 * Defines deployment specific fields.
 *
 * @returns {Array} Array of all fields defined with their types
 */
function deploymentFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;  

  fields
    .newDimension()
    .setId('deploy_timestamp')
    .setName('Timestamp')
    .setType(types.YEAR_MONTH_DAY_SECOND);
  
  fields
    .newDimension()
    .setId('revision')
    .setName('Revision')
    .setType(types.TEXT);
  
  fields
    .newDimension()
    .setId('deployment_id')
    .setName('Deployment Id')
    .setType(types.TEXT);
  
  fields
    .newDimension()
    .setId('user')
    .setName('User')
    .setType(types.TEXT);

  return fields;
}



/**
 * Formats a single row of data into the required format.
 *
 * @param {Object} requestedFields Fields requested in the getData request.
 * @param {Object} deployment object representation to extract data.
 * @returns {Object} Contains values for requested fields in predefined format.
 */
function formatDeployData(requestedFields, deploy) {
  var timestamp = new Date(deploy.timestamp);
  var row = requestedFields.asArray().map(function(requestedField) {
    switch (requestedField.getId()) {
      case 'deploy_timestamp':
        return getDateFormated(timestamp);
      case 'revision':
        return deploy.revision;
      case 'deployment_id':
        return deploy.id;
      case 'user':
        return deploy.user;
      default:
        return '';
    }
  });
  return {values: row};
}
