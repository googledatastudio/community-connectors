/* global CacheService, UrlFetchApp, HtmlService, PropertiesService, OAuth2 */

/* istanbul ignore next */
if (typeof(require) !== 'undefined') {
  var Connector = require('./Connector.js')['default'];
}

/* istanbul ignore next */
function getConnector() {
  return new Connector({
    CacheService: CacheService,
    UrlFetchApp: UrlFetchApp,
    HtmlService: HtmlService,
    PropertiesService: PropertiesService,
    OAuth2: OAuth2
  });
}

/* istanbul ignore next */
// eslint-disable-next-line no-unused-vars
function getConfig() {
  return getConnector().getConfig();
}

/* istanbul ignore next */
// eslint-disable-next-line no-unused-vars
function getSchema() {
  return getConnector().getSchema();
}

/* istanbul ignore next */
// eslint-disable-next-line no-unused-vars
function getData(request) {
  console.log('REQUST:', request);
  return getConnector().getData(request);
}

/* istanbul ignore next */
// eslint-disable-next-line no-unused-vars
function getAuthType() {
  return getConnector().getAuthType();
}

/* istanbul ignore next */
// eslint-disable-next-line no-unused-vars
function isAdminUser() {
  return getConnector().isAdminUser();
}

/* istanbul ignore next */
// eslint-disable-next-line no-unused-vars
function authCallback(request) {
  return getConnector().authCallback(request);
}

/* istanbul ignore next */
// eslint-disable-next-line no-unused-vars
function isAuthValid() {
  return getConnector().isAuthValid();
}

/* istanbul ignore next */
// eslint-disable-next-line no-unused-vars
function resetAuth() {
  getConnector().resetAuth();
}

/* istanbul ignore next */
// eslint-disable-next-line no-unused-vars
function get3PAuthorizationUrls() {
  return getConnector().get3PAuthorizationUrls();
}

/* global exports */
/* istanbul ignore next */
if (typeof(exports) !== 'undefined') {
  exports['__esModule'] = true;
  exports['getConfig'] = getConfig;
}
