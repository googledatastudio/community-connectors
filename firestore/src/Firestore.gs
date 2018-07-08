/*
Copyright 2018 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/** 
 * Handles fetching data from Firestore. 
 *
 * @constructor
 */
function Firestore() {
  
  /** @const */
  this.PREDEFINED_FIELDS = [
    'name',
    'createTime',
    'updateTime'
  ];
  
  /** @const */
  this.PAGE_SIZE = 100;
  
  /** @const */
  this.RETRIES = 3;
  
  /** @const */
  this.CACHE_TTL = 20; // seconds
  
  /** @const */
  this.AUTH_URL = 'https://www.googleapis.com/oauth2/v4/token/';
  
  this.cache = CacheService.getScriptCache();
  
  this.authToken = null;
  const userProperties = PropertiesService.getUserProperties();
  const email = userProperties.getProperty('dscc.email');
  const key = userProperties.getProperty('dscc.key');
  if (email && key) {
    this.authToken = this.getAuthToken(email, key);
  }
}


// TODO: Add support for other field types and nested collections.
/**
 * Fetches documents from Firestore and parses fields based on schema.
 *
 * @param {string} project The Google Cloud project ID containing Firestore instance.
 * @param {string} collection The Firestore collection to use.
 * @param {Object} schema The set of fields for which to retrieve data.
 * @param {number} numResults Maximum documents to fetch.
 * @return {Array} Tabular data for fields matching schema.
 */
Firestore.prototype.getData = function(project, collection, schema, numResults) {
  const documents = this.fetchDocuments(project, collection, numResults);
    
  var data = [];
  const instance = this;
  documents.forEach(function(document) {
    var values = [];
    // Provide values in the order defined by the schema.
    schema.forEach(function(field) {
      if (instance.PREDEFINED_FIELDS.indexOf(field.name) >= 0) {
        var value = document[field.name];
        switch(field.name) {
          case 'createTime':
          case 'updateTime':
            values.push(instance.parseTimestamp(value));
            break;
          case 'name':
            values.push(instance.parseDocumentId(value));
            break;
          default:
            values.push(value);
        }
      } else {
        const valueWrapper = document.fields[field.name];
        if (valueWrapper) {
          switch(field.dataType) {
            case 'STRING':
              if (field.semantics && field.semantics.semanticGroup === 'DATE_AND_TIME') {
                values.push(instance.parseTimestamp(valueWrapper.timestampValue)); 
              } else {
                values.push(valueWrapper.stringValue);
              }
              break;
            case 'NUMBER':
              if (valueWrapper.integerValue != null) {
                values.push(valueWrapper.integerValue);
              } else {
                values.push(valueWrapper.doubleValue);
              }
              break;
            case 'BOOLEAN':
              values.push(valueWrapper.booleanValue);
              break;
            default:
              throw 'Unsupported data type: ' + field.dataType;    
          }
        } else {
          values.push(null); 
        }
      }
    });
    data.push({
      values: values
    });
  });
  
  return data;
}


/**
 * Fetches documents from Firestore or cache.
 *
 * @param {string} project The Google Cloud project ID containing Firestore instance.
 * @param {string} collection The Firestore collection to use.
 * @param {number} numResults Maximum documents to fetch.
 * @return {Array} Array of Firestore documents.
 */
Firestore.prototype.fetchDocuments = function(project, collection, numResults) {
  const urlComponents = [
    'https://firestore.googleapis.com/v1beta1/projects/',
    project,
    '/databases/(default)/documents/',
    collection,
    '?pageSize=',
    this.PAGE_SIZE];
  const url = urlComponents.join('');
  
  const cached = this.cache.get(url);
  if (cached) {
    return JSON.parse(Utilities.unzip(cached).getDataAsString());
  }
  
  var documents = [];
  var token = null;
  while (documents.length < numResults) {
    var response = this.fetchPage(url, token);
    if (response.documents && response.documents.length > 0) {
      Array.prototype.push.apply(documents, response.documents);
    }
    if (response.nextPageToken) {
      token = response.nextPageToken;
    } else {
      break; 
    }
  }
  
  try {
    const zip = Utilities.zip(Utilities.newBlob(JSON.stringify(documents)));
    this.cache.put(url, zip, this.CACHE_TTL); 
  } catch (e) {
    // Ignore. This usually means the data is too big to cache (which does make 
    // the cache less useful...).
  }
  return documents;
}


/**
 * Fetch a single page of documents from Firestore and return the raw response as JSON.
 *
 * @param {string} baseUrl The URL excluding the page token.
 * @param {?string} token Optional token for the page (absent on first request).
 */
Firestore.prototype.fetchPage = function(baseUrl, token) {
  var url = baseUrl;
  if (token) {
    url = url + '&pageToken=' + token; 
  }
  
  var options = {}
  if (this.authToken) {
    options = {headers: {'Authorization': 'Bearer ' + this.authToken}};
  }
  
  var tries = this.RETRIES;
  while (tries > 0) {
    try {
      var response = UrlFetchApp.fetch(url, options);
      return JSON.parse(response.getContentText());
    } catch (e) {
      console.error('Request to Firestore failed.');
      tries--;
    }
  }
  throw 'Failed to complete fetch from Firestore after ' + this.RETRIES + ' attempts.';
}


/** 
 * Convert Firestore timestamp to Data Studio YEAR_MONTH_DAY_HOUR, which is the finest datetime format.
 *
 * @param {string} timestamp Timestamp in the Firestore format (YYYY-MM-DDTHH:MM:SSZ).
 * @return {string} Timestamp in Data Studio format (YYYYMMDDHH).
 */
Firestore.prototype.parseTimestamp = function(timestamp) {
  if (!timestamp) {
    return null;
  }
  return timestamp.replace(/-|T|:.*/g, '');
}


/** 
 * Extract the document ID from the document path.
 *
 * @param {string} path Absolute path to a Firestore document.
 * @return {string} The ID portion of the path.
 */
Firestore.prototype.parseDocumentId = function(path) {
  return path.substring(path.lastIndexOf('/') + 1); 
}


/**
 * Request auth token for accessing Firestore, expiring in 1 hour.
 *
 * @param {string} email Service account email for auth.
 * @param {string} key Private key for auth.
 * @return {string} Auth token for use in request header.
 */
Firestore.prototype.getAuthToken = function(email, key) {
  const jwtHeader = {alg: 'RS256', typ: 'JWT'};

  const now = new Date();
  const nowSeconds = now.getTime() / 1000;

  now.setHours(now.getHours() + 1); // Expires in 1 hour
  const oneHourFromNowSeconds = now.getTime() / 1000;

  const jwtClaim = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: this.AUTH_URL,
    exp: oneHourFromNowSeconds,
    iat: nowSeconds
  };

  const jwtHeaderBase64 = this.base64EncodeSafe(JSON.stringify(jwtHeader));
  const jwtClaimBase64 = this.base64EncodeSafe(JSON.stringify(jwtClaim));
  const signatureInput = jwtHeaderBase64 + '.' + jwtClaimBase64;
  const signature = Utilities.computeRsaSha256Signature(signatureInput, key);
  const encodedSignature = this.base64EncodeSafe(signature);
  const jwt = signatureInput + '.' + encodedSignature;
  
  var options = {
    payload: 'grant_type=' + decodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') + '&assertion=' + jwt
  };
  const response = UrlFetchApp.fetch(this.AUTH_URL, options);
  return JSON.parse(response.getContentText()).access_token;
}


/**
 * @param {string} unencoded 
 * @return {string} Encoded to base 64.
 */
Firestore.prototype.base64EncodeSafe = function(unencoded) {
  return Utilities.base64EncodeWebSafe(unencoded).replace(/=/g, '');
}
