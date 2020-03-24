/**
 * Defines incidents specific fields.
 *
 * @returns {Array} Array of all fields defined with their types
 */
function incidentFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;  

  fields
    .newDimension()
    .setId('opened_at')
    .setName('Opened')
    .setType(types.YEAR_MONTH_DAY_SECOND);

  fields
    .newDimension()
    .setId('closed_at')
    .setName('Closed')
    .setType(types.YEAR_MONTH_DAY_SECOND);
  
  fields
    .newDimension()
    .setId('duration')
    .setName('Duration')
    .setType(types.NUMBER);
  
  fields
    .newDimension()
    .setId('incident_id')
    .setName('Incident Id')
    .setType(types.TEXT);
  
  fields
    .newDimension()
    .setId('policy_id')
    .setName('Policy Id')
    .setType(types.TEXT);

  return fields;
}


/**
 * Formats a single row of data into the required format.
 *
 * @param {Object} requestedFields Fields requested in the getData request.
 * @param {Object} incident object representation to extract data.
 * @returns {Object} Contains values for requested fields in predefined format.
 */
function formatIncidentData(requestedFields, incident) {
  var opened_at = new Date(incident.opened_at);
  var closed_at = new Date(incident.closed_at);
  var row = requestedFields.asArray().map(function(requestedField) {
    switch (requestedField.getId()) {
      case 'opened_at':
        return getDateFormated(opened_at);
      case 'closed_at':
        return getDateFormated(closed_at);
      case 'duration':
        return minutesBetweenDates(opened_at, closed_at);
      case 'incident_id':
        return incident.id.toString();
      case 'policy_id':
        return incident.links.policy_id.toString();
      default:
        return '';
    }
  });
  return {values: row};
}

function minutesBetweenDates(date_opened, date_closed) {
    var diff = date_closed.getTime() - date_opened.getTime();
    return Math.round(diff / 60000)
}