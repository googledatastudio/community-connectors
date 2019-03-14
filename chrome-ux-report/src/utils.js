var propStore = propStore || {};

propStore.services = {
  user: PropertiesService.getUserProperties(),
  script: PropertiesService.getScriptProperties()
};

/**
 * Deletes all properties for a property store
 *
 * @param {Properties} service A specific Property Store (https://developers.google.com/apps-script/reference/properties/properties-service#methods)
 */
propStore.flush = function(service) {
  var prop = propStore.services[service];
  prop.deleteAllProperties();
};

/**
 * Returns value for the defined key from the defined Property Store
 *
 * @param {Properties} service A specific Property Store (https://developers.google.com/apps-script/reference/properties/properties-service#methods)
 * @param {string} key Key for the Property
 * @returns {string} Value of the Property
 */
propStore.get = function(service, key) {
  var prop = propStore.services[service];
  return prop.getProperty(key);
};

/**
 * Stores the key-value pair in the defined Property Store
 *
 * @param {Properties} service A specific Property Store (https://developers.google.com/apps-script/reference/properties/properties-service#methods)
 * @param {string} key Key for the Property
 * @param {string} value Value of the Property
 */
propStore.set = function(service, key, value) {
  var prop = propStore.services[service];
  prop.setProperty(key, value);
};

/**
 * Create MD5 hash for a string.
 * Original from https://stackoverflow.com/a/16227521/4024072
 *
 * @param {string} aStr String to create has for.
 * @returns {string} MD5 hash for aStr.
 */
function digest(aStr) {
  var algorithm = Utilities.DigestAlgorithm.MD5;
  aStr = aStr || '';
  var signature = Utilities.computeDigest(
    algorithm,
    aStr,
    Utilities.Charset.US_ASCII
  );
  var signatureStr = '';
  for (i = 0; i < signature.length; i++) {
    var byte = signature[i];
    if (byte < 0) byte += 256;
    var byteStr = byte.toString(16);
    // Ensure we have 2 chars in our byte, pad with 0
    if (byteStr.length == 1) byteStr = '0' + byteStr;
    signatureStr += byteStr;
  }
  return signatureStr;
}

/**
 * Initialize the connector by setting default set of script properties.
 * Add values as indicated by inline comments and run this function once before
 * using the connector.
 *
 */
function init() {
  var properties = [
    {
      property: 'admins',
      value: [''] // enter list of admin emails
    },
    {
      property: 'lastDataUpdate',
      value: 20180607 // enter last update date for the dataset
    },
    {
      property: 'bigQuery.client',
      value: {
        name: 'bigQuery',
        scopes: 'https://www.googleapis.com/auth/bigquery',
        key: '', // enter service account key
        email: '', // enter service account email
        projectId: '' // enter GCP project Id for the service account
      }
    },
    {
      property: 'firebase.client',
      value: {
        name: 'firebase',
        scopes: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/firebase.database'
        ],
        key: '', // enter service account key
        email: '', // enter service account email
        projectId: '' // enter GCP project Id for the service account
      }
    }
  ];

  properties.forEach(function(item) {
    var value = JSON.stringify(item.value);
    propStore.set('script', item.property, value);
  });
}
