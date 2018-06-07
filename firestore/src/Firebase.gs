/** Handles fetching data from Firestore and GCP. */
function Firebase() {
  
  /** @const */
  this.PREDEFINED_FIELDS = [
    'name',
    'createTime',
    'updateTime'
  ];
}


/**
 * Fetches the list of all Google Cloud projects managed by the user.
 *
 * @return {Array} List of Cloud projects.
 */
Firebase.prototype.listCloudProjects = function() {
  var url = 'https://cloudresourcemanager.googleapis.com/v1beta1/projects';
  var response = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
    }
  });
  var projects = JSON.parse(response.getContentText()).projects;
  return projects;
}


// TODO: This method currently fetches a random sample of up to 1000 docuements.
// Add support for filtering by date range, at least. Support pagination and allow
// page size to be specified in config.
// TODO: Add auth support. Currently only works with unprotected database.
// TODO: Add support for other field types and nested collections.
/**
 * Fetches documents from Firestore and parses fields based on schema.
 *
 * @param {string} project The Google Cloud project ID containing Firestore instance.
 * @param {string} collection The Firestore collection to use.
 * @param {Object} schema The set of fields for which to retrieve data.
 * @return {Array} Tabular data for fields matching schema.
 */
Firebase.prototype.fetchDocuments = function(project, collection, schema) {
  // Fetch all documents in collection
  var url = [
    'https://firestore.googleapis.com/v1beta1/projects/',
    project,
    '/databases/(default)/documents/',
    collection,
    '?pageSize=1000'];
  var response = UrlFetchApp.fetch(url.join(''));
  var documents = JSON.parse(response.getContentText()).documents;
    
  var data = [];
  var instance = this;
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
        var valueWrapper = document.fields[field.name];
        if (valueWrapper) {
          switch(field.dataType) {
            case 'STRING':
              if (field.semantics && field.semantics.semanticGroup == 'DATE_AND_TIME') {
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
 * Convert Firestore timestamp to Data Studio YEAR_MONTH_DAY_HOUR, which is the finest datetime format.
 *
 * @param {string} timestamp Timestamp in the Firestore format (YYYY-MM-DDTHH:MM:SSZ).
 * @return {string} Timestamp in Data Studio format (YYYYMMDDHH).
 */
Firebase.prototype.parseTimestamp = function(timestamp) {
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
Firebase.prototype.parseDocumentId = function(path) {
  return path.substring(path.lastIndexOf('/') + 1); 
}
