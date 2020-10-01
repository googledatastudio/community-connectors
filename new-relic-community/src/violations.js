/**
 * Defines violations specific fields.
 *
 * @returns {Array} Array of all fields defined with their types
 */
function violationFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;

  fields
    .newDimension()
    .setId('violation_id')
    .setName('Violation Id')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('label')
    .setName('Label')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('policy_name')
    .setName('Policy name')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('priority')
    .setName('Priority')
    .setType(types.TEXT);

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
    .setId('entity_product')
    .setName('Entity product')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('entity_name')
    .setName('Entity name')
    .setType(types.TEXT);

  return fields;
}

/**
 * Formats a single row of data into the required format.
 *
 * @param {Object} requestedFields Fields requested in the getData request.
 * @param {Object} violation object representation to extract data.
 * @returns {Object} Contains values for requested fields in predefined format.
 */
function formatViolationData(requestedFields, violation) {
  var opened_at = new Date(violation.opened_at);
  var closed_at = new Date(violation.closed_at);
  var row = requestedFields.asArray().map(function(requestedField) {
    switch (requestedField.getId()) {
      case 'opened_at':
        return getDateFormated(opened_at);
      case 'closed_at':
        return getDateFormated(closed_at);
      case 'duration':
        return violation.duration;
      case 'violation_id':
        return violation.id.toString();
      case 'label':
        return violation.label;
      case 'policy_name':
        return violation.policy_name;
      case 'priority':
        return violation.priority;
      case 'entity_product':
        return violation.entity.product;
      case 'entity_name':
        return violation.entity.name;
      default:
        return '';
    }
  });
  return {values: row};
}
