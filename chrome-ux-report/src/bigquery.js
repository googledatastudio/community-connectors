/**
 * bqlocal object mimics the BigQuery service provided in Apps Script.
 * This help to switch out the service account or reuse BigQuery related
 * code from other projects.
 *
 * For full reference on BigQuery service and API See
 * https://developers.google.com/apps-script/advanced/bigquery and
 * https://cloud.google.com/bigquery/docs/reference/rest/v2/
 */
var bqlocal = bqlocal || {};

bqlocal.setOAuthToken = function(oAuthToken) {
  this.oAuthToken = oAuthToken;
};

/**
 * A generalized function to run mimic Jobs.query and Jobs.getQueryResults
 * for the BigQuery Apps Scrpit Service
 *
 * @param {object} bqRequest See https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query#request-body
 * @param {string} projectId Project Id for the BigQuery project
 * @param {string} jobId Id for the BigQuery job
 * @returns {object} See https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/getQueryResults#response
 */
bqlocal.bdQuery = function(bqRequest, projectId, jobId) {
  var urlElements = [
    'https://www.googleapis.com/bigquery/v2/projects/',
    projectId,
    '/queries',
  ];
  if (jobId) {
    urlElements.push('/' + jobId);
  }
  var url = urlElements.join('');

  var responseOptions = {
    headers: {
      Authorization: 'Bearer ' + bqlocal.oAuthToken,
    },
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
  };

  if (bqRequest) {
    responseOptions.payload = JSON.stringify(bqRequest);
  }

  var response = UrlFetchApp.fetch(url, responseOptions);

  var queryResults = JSON.parse(response.getContentText());
  return queryResults;
};

bqlocal.Jobs = {};

/**
 * See https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
 */
bqlocal.Jobs.query = function(bqRequest, projectId) {
  var queryResults = bqlocal.bdQuery(bqRequest, projectId, null);
  return queryResults;
};

/**
 * See https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/getQueryResults
 */
bqlocal.Jobs.getQueryResults = function(projectId, jobId) {
  var queryResults = bqlocal.bdQuery(null, projectId, jobId);
  return queryResults;
};

/**
 * Gets data from the Chrome UX dataset for the given url.
 * Originl code from: https://developers.google.com/apps-script/advanced/bigquery#run_query
 *
 * @param {string} url URL/Origin to fetch data for
 * @returns {object} An object with data and column headers for the given url.
 */
function getBqData(url) {
  var bqRequest = {
    query: crux.dataQueryString,
    queryParameters: [
      {
        parameterType: {
          type: 'STRING',
        },
        parameterValue: {
          value: url,
        },
        name: 'url',
      },
    ],
    useLegacySql: false,
  };

  return getBigQueryResults(bqRequest);
}

function getBigQueryResults(request) {
  var bqClient = JSON.parse(propStore.get('script', 'bigQuery.client'));
  var bqOauthService = getOauthService(bqClient);
  var bqOAuthToken = bqOauthService.getAccessToken();
  bqlocal.setOAuthToken(bqOAuthToken);
  var projectId = bqClient.projectId;

  var queryResults = bqlocal.Jobs.query(request, projectId);
  var jobId = queryResults.jobReference.jobId;

  // Check on status of the Query Job.
  var sleepTimeMs = 250;
  while (!queryResults.jobComplete) {
    Utilities.sleep(sleepTimeMs);
    sleepTimeMs *= 2;
    queryResults = bqlocal.Jobs.getQueryResults(projectId, jobId);
  }

  // Get all the rows of results.
  var rows = queryResults.rows;
  while (queryResults.pageToken) {
    queryResults = bqlocal.Jobs.getQueryResults(projectId, jobId, {
      pageToken: queryResults.pageToken,
    });
    rows = rows.concat(queryResults.rows);
  }

  var headers = queryResults.schema.fields.map(function(field) {
    return field.name;
  });

  var data = new Array(rows.length);
  for (var i = 0; i < rows.length; i++) {
    var cols = rows[i].f;
    data[i] = new Array(cols.length);
    for (var j = 0; j < cols.length; j++) {
      data[i][j] = cols[j].v;
    }
  }

  return {
    headers: headers,
    data: data,
  };
}
