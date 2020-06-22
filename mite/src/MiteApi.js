/** @constant the Mite API including a wildcard. also see connector URL whitelisting in the manifest file */
const MITE_URL = "https://{0}.mite.yo.lk";

/** @constant the current version of the user-agent (e.g. Google Data Studio connector) */
const AGENT_VERSION = 1.01;

/**
 * Invokes the Mite API using a HTTP GET call.
 *
 * @param {string} domain - the domain (e.g. account name) to use when calling the Mite API
 * @param {string} api_key - the API key to use when calling the Mite API
 * @param {string} api - the relative path for the dedicated Mite API to call (e.g. time_entries, customers, projects, services, users). It will be added to the Mite URL
 * @param {object} params - the parameters that will added as HTTP query parameters given as a dictionary.
 * @returns {object} an object with the HTTP response code as code property and the data as json property (e.g. object in JSON notation).
 */
function miteGet(domain, api_key, api, params) {
  var activeUser = Session.getActiveUser().getEmail();
  var scriptUser = Session.getEffectiveUser().getEmail();

  var userAgent = "Mite Connector for Google Datastudio v{0}; user: {1}; credentials: {2}; The unbelievable Machine Company GmbH".format(
    AGENT_VERSION,
    activeUser,
    scriptUser
  );
  console.log(userAgent);

  var headers = {
    "X-MiteApiKey": api_key,
    "User-Agent": userAgent,
  };

  var options = {
    headers: headers,
  };

  var url = "{0}/{1}.json".format(MITE_URL.format(domain), api);
  if (params && Object.keys(params).length > 0) {
    var params_ = [];
    for (const [key, value] of Object.entries(params)) {
      var value_ = value;
      if (Array.isArray(value)) value_ = value.join(",");

      params_.push("{0}={1}".format(key, encodeURIComponent(value_)));
    }

    var query = params_.join("&");
    url = "{0}?{1}".format(url, query);
  }

  try {
    // ToDo: handling of ETag; see https://mite.yo.lk/api/index.html#conditional-requests (remark: HTTP result might be 304 instead of 200)

    console.log("HTTP GET %s", url);
    var response = UrlFetchApp.fetch(url, options);

    var data = JSON.parse(response.getContentText());
    //console.log(data);

    return {
      code: response.getResponseCode(),
      json: data,
    };
  } catch (e) {
    throwConnectorError(e);
  }
}

/**
 * Retrieves the details for the user for which the domain and API key have been created.
 *
 * @param {string} domain - the domain (e.g. account name) to use when calling the Mite API
 * @param {string} api_key - the API key to use when calling the Mite API
 * @returns {object} an object with the HTTP response code as code property and the user/account data as json property (e.g. object in JSON notation).
 */
function miteGetMyself(domain, api_key) {
  return miteGet(domain, api_key, "myself");
}
