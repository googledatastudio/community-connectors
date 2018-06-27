var connector = {};
// Sample Kaggle dataset. 
// Kaggle URL format: https://www.kaggle.com/{ownerSlug}/{datasetSlug}.
// Sample Kaggle URL: https://www.kaggle.com/unsdsn/world-happiness
// Filename refers to the dataset under the 'Data' tab.
connector.ownerSlug = 'unsdsn';
connector.datasetSlug = 'world-happiness';
connector.fileName = '2016.csv';

function getAuthType() {
  return {
    "type": "USER_PASS"
  };
}
function getConfig(request) {
  var config = {
    configParams: [
        {
            'type': 'INFO',
            'name': 'generalInfo',
            'text': 'Enter the following information for the desired Kaggle dataset. The kaggle URL for datasets gives the ownerSlug and datasetSlug. For eg: https://www.kaggle.com/{ownerSlug}/{datasetSlug}. Filename can be found under the "Data" tab'
        },
        {
            'type': 'TEXTINPUT',
            'name': 'ownerSlug',
            'displayName': 'Enter owner slug',
            'placeholder': connector.ownerSlug
        },
        {
            'type': 'TEXTINPUT',
            'name': 'datasetSlug',
            'displayName': 'Enter dataset slug',
            'placeholder': connector.datasetSlug
        },
        {
            'type': 'TEXTINPUT',
            'name': 'fileName',
            'displayName': 'Enter filename',
            'placeholder': connector.fileName
        }
    ] 
  };
  return config;
}
function getSchema(request) {
  request = validateConfig(request);
  var result = getFileData(request.configParams);
  var rawData = result.csvData;
  var cacheKey = result.cacheKey;
  var cache = CacheService.getScriptCache();
  var cachedSchema = JSON.parse(cache.get(cacheKey))
  if(cachedSchema === null){
    var kaggleSchema = buildSchema(rawData, cacheKey);
    return { schema: kaggleSchema };
  }
  return { schema: cachedSchema };
}
function validateConfig(request) {
  request.configParams = request.configParams || {}; 
  var config = request.configParams;
  config.ownerSlug = config.ownerSlug || connector.ownerSlug;
  config.datasetSlug = config.datasetSlug || connector.datasetSlug;
  config.fileName = config.fileName || connector.fileName;
  return request;
}
function getData(request) {
  request = validateConfig(request);
  var result = getFileData(request.configParams);
  var rawData = result.csvData;
  var cacheKey = result.cacheKey;
  var cache = CacheService.getScriptCache();
  var cachedSchema = JSON.parse(cache.get(cacheKey))
  if(cachedSchema === null)
    var kaggleSchema = buildSchema(rawData, cacheKey);
  else
    var kaggleSchema = cachedSchema;
  var requestedSchema = request.fields.map(function (field) {
    for (var i = 0; i < kaggleSchema.length; i++) {
      if (kaggleSchema[i].name == field.name) {
        return kaggleSchema[i];
      }
    }
  });
  var requestedData = processData(rawData, requestedSchema);
  return {
    schema: requestedSchema,
    rows: requestedData
  };
}
function buildSchema(data, cacheKey) {
  var columnNames = data[0];
  var content = data[1];
  var schema = [];
  for (var i = 0; i < columnNames.length; i++) {
    var fieldSchema = mapColumn(i, columnNames[i], content[i]);
    schema.push(fieldSchema);
  }
  var cache = CacheService.getScriptCache();
  cache.put(cacheKey, JSON.stringify(schema))
  return schema;
}
function mapColumn(index, columnName, content) {
  var field = {};
  field.name = 'c' + index;
  field.label = columnName;
  if (isNaN(content)) {
    field.dataType = 'STRING';
    field.semantics = {};
    field.semantics.conceptType = 'DIMENSION';
  } else {
    field.dataType = 'NUMBER';
    field.semantics = {};
    field.semantics.conceptType = 'METRIC';
    field.semantics.isReaggregatable = true
  };
  return field;
};
function processData(data, fields) {
  var header = data[0];
  var dataIndexes = fields.map( function(field){
    return header.indexOf(field.label)
  });
  var result = [];
  for (var rowIndex = 1; rowIndex < data.length; rowIndex++) {
    var rowData = dataIndexes.map( function(columnIndex){
      return data[rowIndex][columnIndex];
    }); 
    result.push({
      'values': rowData
    });
  }
  return result;
}
function getFileData(config) {
  var userProperties = PropertiesService.getUserProperties();
  var user = userProperties.getProperty('USERNAME');
  var key = userProperties.getProperty('KEY');
  var kaggleAuth = {
    userName: user,
    apiToken: key
  };
  var ownerSlug = config.ownerSlug;
  var datasetSlug = config.datasetSlug;
  var fileName = config.fileName;
  var url = [
    "datasets/download-raw",
    ownerSlug,
    datasetSlug,
    fileName
  ].join("/");
  var key = [
    ownerSlug,
    datasetSlug,
    fileName
  ].join("--");
 
  var response = kaggleFetch(url, kaggleAuth);
  var fileContent = response.getContentText();
  var csvData = Utilities.parseCsv(fileContent);
  var result = {
    csvData: csvData,
    cacheKey: key
  }
  return result;
}
function kaggleFetch(url, kaggleAuth) {
  var fullUrl = "https://www.kaggle.com/api/v1/" + url;
  var authParamPlain = kaggleAuth.userName + ":" + kaggleAuth.apiToken;
  var authParamBase64 = Utilities.base64Encode(authParamPlain);
  var options = {
    headers: {
      "Authorization": "Basic " + authParamBase64 
    }
  };
  var response = UrlFetchApp.fetch(fullUrl, options);
  return response;
}
function isAuthValid() {
  var userProperties = PropertiesService.getUserProperties();
  var userName = userProperties.getProperty('USERNAME');
  var key = userProperties.getProperty('KEY');
  return validateCredentials(userName, key);
}
function validateCredentials(username, key){
  if(username === null || key === null)
    return false;
  
  // To check if the credentials entered are valid. 
  var ping =  'https://www.kaggle.com/api/v1/competitions/list';
  var authParamPlain = username + ":" + key;
  var authParamBase64 = Utilities.base64Encode(authParamPlain);
  var options = {
    headers: {
      "Authorization": "Basic " + authParamBase64 
    }
  };
  try{
    var response = UrlFetchApp.fetch(ping, options);
  }
  catch(err){
    return false;
  }
  // Status OK: 200
  // Status unauthorized: 401
  if(response.getResponseCode() == 200)
    return true;
  return false;
}
// Added for USER_PASS auth type.
function setCredentials(request) {
  var creds = request.userPass;
  var username = creds.username;
  var key = creds.password;
  
  // Optional
  // Check if the provided username and key are valid through a
  // call to your service. 
  var validCreds = validateCredentials(username, key);
  if (!validCreds) {
   return {
      errorCode: "INVALID_CREDENTIALS"
    };
  }
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('USERNAME', username);
  userProperties.setProperty('KEY', key);
  return {
    errorCode: "NONE"
  };  
}
function resetAuth() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('USERNAME');
  userProperties.deleteProperty('KEY');
}
function isAdminUser() {
  return false;
}
