/**
 * Returns the URL for a file in a firebase database.
 *
 * @param {string} projectId The project Id for the firebase database
 * @param {string} fileName The filename in the database
 * @returns {string} The url for the file in the database
 */
function buildFbUrl(projectId, fileName) {
  if (fileName) {
    fileName = '/' + fileName;
  }
  var urlElements = [
    'https://',
    projectId,
    '.firebaseio.com/',
    crux.getEnvironment(),
    '/origins',
    fileName,
    '.json',
  ];
  var url = urlElements.join('');
  return url;
}

/**
 * Depending on whether data was retrived from BigQuery, updates the Firebase
 * cache or reads from the Firebase cache.
 *
 * @param {object} origin Contains information about the origin
 * @param {object} [origin.data] Data fetched from BigQuery for the origin
 * @param {string} origin.url Origin URL
 * @param {string} origin.key Hashed key generated from the Origin URL
 */
function processFirebase(origin) {
  var fbClient = JSON.parse(propStore.get('script', 'firebase.client'));
  var fbOauthService = getOauthService(fbClient);
  var fbOAuthToken = fbOauthService.getAccessToken();
  var fbUrl = buildFbUrl(fbClient.projectId, origin.key);
  // If we fetched data from BigQuery delete and rewrite firebase cache
  // else write data to firebase cache
  if (origin.data) {
    console.log('deleting firebase cache for ' + origin.url);
    fbCache('delete', fbOAuthToken, fbUrl);
    console.log('saving firebase cache for ' + origin.url);
    fbCache('post', fbOAuthToken, fbUrl, origin.data);
    propStore.set('script', origin.key, origin.lastUpdate);
  } else {
    console.log('hitting firebase cache for ' + origin.url);
    origin.data = fbCache('get', fbOAuthToken, fbUrl);
  }
}

/**
 * Generic method for handling the Firebase REST API.
 * For `get`: It returns the data at the given url.
 * For `post`: It posts the data in in Firebase db at the given url and returns `undefined`.
 * For `delete`: It deletes the data at the given url and returns `undefined`.
 *
 * @param {string} method Method for the REST API: `get`, `post`, or `delete`
 * @param {string} oAuthToken Token for the OAuth client
 * @param {string} url REST endpoint
 * @param {string} [originData] Data to be stored for `post` method
 * @returns {undefined|object} Returns data from the REST endpoint for `get`
 *          method. For other methods, returns `undefined`.
 */
function fbCache(method, oAuthToken, url, originData) {
  var responseOptions = {
    headers: {
      Authorization: 'Bearer ' + oAuthToken,
    },
    method: method,
    contentType: 'application/json',
  };

  // Add payload for post method
  if (method === 'post') {
    responseOptions['payload'] = JSON.stringify(originData);
  }

  var response = UrlFetchApp.fetch(url, responseOptions);

  // Return value only for `get`.
  if (method === 'get') {
    var responseObject = JSON.parse(response);
    // Firebase realtime db automatically adds a unique key.
    // Due to our lock service, that will be the only key.
    var autoKey = Object.keys(responseObject)[0];
    var returnValue = responseObject[autoKey];
    return returnValue;
  }
}

/**
 * Deletes the entire Firebase cache
 *
 */
function fbFlushCache() {
  var fb = processOauth('firebase.client');
  var fbUrl = buildFbUrl(fb.projectId);
  console.log('flushing firebase cache');
  fbCache('delete', fb.token, fbUrl);
}
