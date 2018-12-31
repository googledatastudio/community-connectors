/**
 * Transform Glue table schema into Data Studio Fields.
 *
 * For each column in Glue Table, it maps to one of the data types in Data Studio.
 * Glue Table data types: https://docs.aws.amazon.com/athena/latest/ug/data-types.html
 * NOTE: BINARY, ARRAY, MAP, STRUCT are ignored, since there's no corresponding data types.
 *
 * @param  {Object} table Table object from AWSGlue.GetTable.
 * @return {Object} Data Studio Fields object.
 */
function glueTableToFields(table) {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var columns = table.PartitionKeys.concat(table.StorageDescriptor.Columns);

  columns.forEach(function (column) {
    // Set fields based on data type
    var field;
    switch (column.Type.toLowerCase()) {
      case 'boolean':
        field = fields.newDimension()
          .setType(types.BOOLEAN);
        break;
      case 'tinyint':
      case 'smallint':
      case 'int':
      case 'bigint':
      case 'double':
      case 'float':
      case 'decimal':
        field = fields.newMetric()
          .setType(types.NUMBER);
        break;
      case 'char':
      case 'varchar':
      case 'string':
      case 'timestamp':
        field = fields.newDimension()
          .setType(types.TEXT);
        break;
      case 'date':
        field = fields.newDimension()
          .setType(types.YEAR_MONTH_DAY);
      default:
        return;
    }

    // Set field name and description (if any)
    field.setId(column.Name);
    if (typeof(column.Comment) === 'string') {
      field.setDescription(column.Comment);
    }
  });

  return fields;
}

/**
 * Get schema data from AWS Glue and return Fields for Data Studio.
 *
 * @param  {Object} request Data/Schema request parameters.
 * @return {Object} Data Studio Fields object.
 */
function getFieldsFromGlue(request) {
  var params = request.configParams;
  AWS.init(params.awsAccessKeyId, params.awsSecretAccessKey);

  var payload = {
    'DatabaseName': params.databaseName,
    'Name': params.tableName
  };
  var result = AWS.post('glue', params.awsRegion, 'AWSGlue.GetTable', payload);
  return glueTableToFields(result.Table);
}
