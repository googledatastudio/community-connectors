
/**
 * Generate Athena query string from the getData() request.
 *
 * Rules:
 * 1. Fields specified in request.fields will be SELECT-ed.
 * 2. If `dateRangeColumn` is specified, it will be added in the WHERE clause.
 * 3. If `rowLimit` is specified, it will be added in the LIMIT clause.
 *
 * @param {Object} request Data request parameters.
 * @param {Array} fields Array of objects defining the table fields. For mapping data types.
 * @return {string} The generated query string.
 */
function generateAthenaQuery(request, fields) {
  var defaultRowLimit = 1000;
  var params = request.configParams || {};

  var rowLimit = parseInt(params.rowLimit || defaultRowLimit);
  var columns = request.fields.map(function (field) {
    return '"' + field.name + '"';
  });
  var table = params.tableName;

  var query = 'SELECT ' + columns.join(', ') + ' FROM "' + table + '"';
  if (params.dateRangeColumn) {
    var startDate = request.dateRange.startDate;
    var endDate = request.dateRange.endDate;

    // startDate and endDate are always STRING
    // But in Athena query we need a correct data type
    var dateRangeField = fields.getFieldById(params.dateRangeColumn);
    var cc = DataStudioApp.createCommunityConnector();
    var types = cc.FieldType;
    var dateRangeDataType;
    switch (dateRangeField.getType()) {
      case types.YEAR_MONTH_DAY:
        dateRangeDataType = 'DATE';
        break;
      case types.YEAR_MONTH_DAY_HOUR:
        dateRangeDataType = 'TIMESTAMP';
        break;
      default:
        dateRangeDataType = 'VARCHAR';
        break;
    }

    // WHERE "${params.dateRangeColumn}"
    // BETWEEN ${dateRangeDataType} '${startDate}'
    // AND ${dateRangeDataType} '${endDate}'
    query += ' WHERE "' + params.dateRangeColumn + '"' +
      ' BETWEEN ' + dateRangeDataType + ' \'' + startDate + '\'' +
      ' AND ' + dateRangeDataType + ' \'' + endDate + '\'' ;
  }
  if (rowLimit !== -1) {
    query += ' LIMIT ' + rowLimit;
  }

  return query;
}

/**
 * Submit a query to AWS Athena.
 *
 * @param  {string} region Region of the AWS Athena to use.
 * @param  {string} database Glue datebase to run this query.
 * @param  {string} query The query string.
 * @param  {string} outputLocation The S3 path (s3://<bucket>/<path>) to store the query result.
 * @return {Object} {"QueryExecutionId": "string"}
 */
function runAthenaQuery(region, database, query, outputLocation) {
  var payload = {
    'ClientRequestToken': uuidv4(),
    'QueryExecutionContext': {
      'Database': database
    },
    'QueryString': query,
    'ResultConfiguration': {
      'OutputLocation': outputLocation
    }
  };
  return AWS.post('athena', region, 'AmazonAthena.StartQueryExecution', payload);
}

/**
 * Wait until an Athena query to reach a terminal state.
 *
 * This is a blocking function that continuously pull the state of the query.
 * If the query finished without any errors, the function will return nothing.
 * Otherwise an exception will be thrown.
 * @param  {string} region Region of the AWS Athena to use.
 * @param  {string} queryExecutionId The submitted execution ID.
 */
function waitAthenaQuery(region, queryExecutionId) {
  var payload = {
    'QueryExecutionId': queryExecutionId
  };

  // Ping for status until the query reached a terminal state
  while (1) {
    var result = AWS.post('athena', region, 'AmazonAthena.GetQueryExecution', payload);
    var state = result.QueryExecution.Status.State.toLowerCase();
    switch (state) {
      case 'succeeded':
        return true;
      case 'failed':
        throw new Error(result.QueryExecution.Status.StateChangeReason || 'Unknown query error');
      case 'cancelled':
        throw new Error('Query cancelled');
    }

    Utilities.sleep(3000);
  }
}

/**
 * Fetch all rows from a submitted AWS Athena query.
 * @param  {string} region Region of the AWS Athena to use.
 * @param  {string} queryExecutionId The submitted execution ID.
 * @return {Array} Array of rows, in the form of { col0: val0, col1: val1, ... }
 */
function getAthenaQueryResults(region, queryExecutionId) {
  // Get results until all rows are fetched
  var rows = [];
  var nextToken = null;
  while (1) {
    var payload = {
      'QueryExecutionId': queryExecutionId
    };
    if (nextToken) {
      payload.NextToken = nextToken;
    }

    // Parse and append data
    var result = AWS.post('athena', region, 'AmazonAthena.GetQueryResults', payload);
    var columns = result.ResultSet.ResultSetMetadata.ColumnInfo.map(function (info) {
      return info.Name;
    });
    result.ResultSet.Rows.forEach(function (row) {
      // Combine [val0, val1, ...] and [col0, col1, ...] into { col0: val0, col1: val1, ... }
      var newRow = {};
      row.Data.forEach(function (data, index) {
        var column = columns[index];
        newRow[column] = data.VarCharValue;
      });
      rows.push(newRow);
    });

    nextToken = result.NextToken;
    if (!nextToken) {
      break;
    }
  }

  // Athena data is CSV, need to remove header row
  rows.shift();
  return rows;
}

/**
 * Transform the Athena query results to required format.
 *
 * @param {Array} schema Array of objects defining the requested fields.
 * @param {Array} queryResults Array of values obtained from getAthenaQueryResults().
 * @returns {Array} Array of rows with the data type transformed.
 */
function queryResultsToRows(schema, queryResults) {
  return queryResults.map(function (data) {
    var values = [];
    schema.forEach(function (field) {
      var value = data[field.name];
      // Athena returned all values as strings, need to convert data type
      switch (field.dataType.toLowerCase()) {
        case 'number':
          values.push(parseFloat(value));
          break;
        case 'boolean':
          values.push(value.toLowerCase() === 'true');
          break;
        default:
          values.push(value);
          break;
      }
    });
    return { values: values };
  });


  return rows.map(function (row) {
    return row.map(function (field, index) {
      switch (schema[index].dataType.toLowerCase()) {
        case 'number':
          return parseFloat(field);
        case 'boolean':
          return field === 'true';
        default:
          return field;
      }
    });
  });
}

/**
 * Submit query to AWS Athena and return results as required by Data Studio.
 *
 * @param  {Object} request Data request parameters.
 * @return {Object} Contains the schema and data for the given request.
 */
function getDataFromAthena(request) {
  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  var fields = getFieldsFromGlue(request);
  var requestedFields = fields.forIds(requestedFieldIds);
  var schema = requestedFields.build();

  var params = request.configParams;
  AWS.init(params.awsAccessKeyId, params.awsSecretAccessKey);

  // Generate and submit query
  var query = generateAthenaQuery(request, fields);
  var runResult = runAthenaQuery(params.awsRegion, params.databaseName, query, params.outputLocation);
  var queryExecutionId = runResult.QueryExecutionId;
  waitAthenaQuery(params.awsRegion, queryExecutionId);

  // Fetch and transform data
  var queryResults = getAthenaQueryResults(params.awsRegion, queryExecutionId);
  var rows = queryResultsToRows(schema, queryResults);

  return {
    schema: schema,
    rows: rows
  };
}
