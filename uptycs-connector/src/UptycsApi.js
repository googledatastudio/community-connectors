/**
 * Validate config object and throw error if anything wrong.
 *
 * @param  {Object} configParams Config object supplied by user.
 */

function validateConfig(configParams) {
  configParams = configParams || {};
  if (!configParams.uptycs_url) {
    throwUserError("Uptycs API URL with customer id.");
  }
  if (!configParams.authorization_bearer) {
    throwUserError("Authorization bearer is empty.");
  }
  if (!configParams.sql_query) {
    throwUserError("SQL Query is empty.");
  }
  if (!configParams.database) {
    throwUserError("Database name is empty");
  }
}

/**
 * Throws User-facing errors.
 *
 * @param  {string} message Error message.
 */

function throwUserError(message) {
  DataStudioApp.createCommunityConnector()
    .newUserError()
    .setText(message)
    .throwException();
}

/**
 * Call Uptycs API and execute and return value based on
 * Get or post call and return either query status JSON
 * (which contains column JSON) or results JSON
 */

function UptycsExecute(request, CallType) {
  var params = request.configParams;
  var QueryJson = {type: params.database, query: params.sql_query};
  var ApiUrl = params.uptycs_url;
  var QueryJobsUrl = ApiUrl + "/queryJobs";
  var ApiHeader = {Authorization: "Bearer " + params.authorization_bearer};

  var PostOptions = {
    headers: ApiHeader,
    contentType: "application/json",
    method: "post",
    validateHttpsCertificates: true,
    payload: JSON.stringify(QueryJson)
  };

  var GetOptions = {
    headers: ApiHeader,
    contentType: "application/json",
    method: "get",
    validateHttpsCertificates: true
  };

  // post the query and get the query id and QueryId URL
  var PostResponse = UrlFetchApp.fetch(QueryJobsUrl, PostOptions);
  if (PostResponse.getResponseCode() === 200) {
    var PostResponseContent = JSON.parse(PostResponse.getContentText());
    var QueryId = PostResponseContent.id;
    var QueryIdUrl = QueryJobsUrl + "/" + QueryId;
  }

  // Check the status of query and capture the the response content
  var GetResponse = UrlFetchApp.fetch(QueryIdUrl, GetOptions);
  var GetResponseContent = JSON.parse(GetResponse.getContentText());

  while (GetResponse.getResponseCode() === 200) {
    GetResponse = UrlFetchApp.fetch(QueryIdUrl, GetOptions);

    GetResponseContent = JSON.parse(GetResponse.getContentText());

    // console.info(GetResponseContent.status);

    if (GetResponseContent.status === "RUNNING") {
      continue;
    } else if (GetResponseContent.status === "FINISHED") {
      break;
    } else if (GetResponseContent.status === "ERROR") {
      if ("error" in GetResponseContent) {
        var ErrorMsg;
        if ("message" in GetResponseContent.error) {
          if ("brief" in GetResponseContent.error.message) {
            ErrorMsg = GetResponseContent.error.message.brief;
          }
          if ("detail" in GetResponseContent.error.message) {
            ErrorMsg = ErrorMsg + " " + GetResponseContent.error.message.detail;
          }
        }
        if (!ErrorMsg) {
          ErrorMsg = "Undefined Error";
        }
        throwUserError(ErrorMsg);
      }
    } else if (GetResponseContent.status === "CANCELLED") {
      throwUserError("Query got cancelled.");
    } else {
      throwUserError("Unknown error");
    }
  }

  // check if we got rows or not. If not, return the error.
  if (GetResponseContent.rowCount === 0) {
    throwUserError("SQL returned zero rows");
  }

  // Verify if we have column in JSON and send the response
  if (CallType === "columns") {
    if (
      GetResponse.getResponseCode() === 200 &&
      "columns" in GetResponseContent
    ) {
      return GetResponseContent;
    } else {
      throwUserError(GetResponse.getContentText());
    }
  }

  if (CallType === "results") {
    if (
      GetResponse.getResponseCode() === 200 &&
      GetResponseContent.status === "FINISHED"
    ) {
      var QueryIdUrlResults = QueryIdUrl + "/results";
      GetResponse = UrlFetchApp.fetch(QueryIdUrlResults, GetOptions);
      if (GetResponse.getResponseCode() === 200) {
        GetResponseContent = JSON.parse(GetResponse.getContentText());
        return GetResponseContent;
      } else {
        throwUserError(GetResponse.getContentText());
      }
    } else {
      throwUserError(GetResponse.getContentText());
    }
  }
}

/**
 * Returns the tabular data for the given request.
 *
 * @param {Object} request Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */

function getDataFromUptycs(request, schema) {
  validateConfig(request.configParams);
  var ResponseContent = UptycsExecute(request, "results");
  var j = 0;
  var rows = [];
  ResponseContent.items.forEach(function(item) {
    var i = 0;
    var row = [];
    schema.forEach(function(colmn) {
      row[i] = item.rowData[colmn["name"]];
      i = i + 1;
    });
    rows[j] = {values: row};
    j = j + 1;
  });
  console.info({schema: schema, rows: rows});
  return rows;
}

/**
 * Transform Uptycs table schema into Data Studio Fields.
 *
 * For each column in Uptycs Table, it maps to one of the data types in Data Studio.
 *
 * @param  {Object} table Table object from Uptycs.columns.
 * @return {Object} Data Studio Fields object.
 */

function UptycsQueryToFields(UptycsResponse) {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var columns = UptycsResponse.columns;

  columns.forEach(function(column) {
    // Set fields based on data type
    var field;
    switch (column.type.toLowerCase()) {
    case "boolean":
      field = fields
        .newDimension()
        .setId(column.name)
        .setType(types.BOOLEAN);
      break;
    case "number_integer":
    case "id":
      field = fields
        .newMetric()
        .setId(column.name)
        .setType(types.NUMBER);
      break;
    case "char":
    case "varchar":
    case "string":
    case "text":
    case "ref":
      field = fields
        .newDimension()
        .setId(column.name)
        .setType(types.TEXT);
      break;
    case "date":
      field = fields
        .newDimension()
        .setId(column.name)
        .setType(types.YEAR_MONTH_DAY);
      break;
    case "timestamp":
    case "date_time":
      field = fields
        .newDimension()
        .setId(column.name)
        .setType(types.YEAR_MONTH_DAY_HOUR);
      break;
    default:
      return;
    }

    // Set field name and description (if any)
    if (typeof column.description === "string") {
      field.setDescription(column.description);
    }
  });

  return fields;
}
