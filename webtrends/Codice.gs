function getConfig(request) {
  var config = {
    configParams: [
      {
        type: 'INFO',
        name: 'welcomeMessage',
        text: 'Enter the ID of your Webtrends Account, the ID of the Report you want to query and choose a timezone.'
      },
      {
        type: 'TEXTINPUT',
        name: 'accountid',
        displayName: 'Account ID',
        helpText: 'The ID of the Account in Webtrends.',
        placeholder: ''
      },
      {
        type: 'TEXTINPUT',
        name: 'reportid',
        displayName: 'Report ID',
        helpText: 'The ID of the Report in Webtrends you want to query.',
        placeholder: ''
      },
      {
        type: 'SELECT_SINGLE',
        name: 'timezone',
        displayName: 'Select a timezone (default: Europe/Rome)',
        helpText: 'Select the timezone of your area (default: Europe/Rome).',
        options: [
          { label: "Pacific/Pago Pago", value: "Pacific/Pago Pago" },
          { label: "Pacific/Honolulu", value: "Pacific/Honolulu" },
          { label: "Pacific/Marquesas", value: "Pacific/Marquesas" },
          { label: "America/Adak", value: "America/Adak" },
          { label: "America/Anchorage", value: "America/Anchorage" },
          { label: "America/Los Angeles", value: "America/Los Angeles" },
          { label: "America/Vancouver", value: "America/Vancouver" },
          { label: "America/Denver", value: "America/Denver" },
          { label: "America/Edmonton", value: "America/Edmonton" },
          { label: "America/Chicago", value: "America/Chicago" },
          { label: "America/Caracas", value: "America/Caracas" },
          { label: "America/New York", value: " America/New York" },
          { label: "Africa/Nairobi", value: "Africa/Nairobi" },
          { label: "Africa/Cairo", value: "Africa/Cairo" },
          { label: "Africa/Algiers", value: "Africa/Algiers" },
          { label: "Africa/Accra", value: "Africa/Accra" },
          { label: "Europe/London", value: "Europe/London" },
          { label: "Europe/Paris", value: "Europe/Paris" },
          { label: "Europe/Rome", value: "Europe/Rome" },
          { label: "Europe/Moscow", value: "Europe/Moscow" },
          { label: "Asia/Dubai", value: "Asia/Dubai" },
          { label: "Asia/Tehran", value: "Asia/Tehran" },
          { label: "Asia/Karachi", value: "Asia/Karachi" },
          { label: "Asia/Colombo", value: "Asia/Colombo" },
          { label: "Asia/Bishkek", value: "Asia/Bishkek" },
          { label: "Asia/Rangoon", value: "Asia/Rangoon" },
          { label: "Asia/Jakarta", value: "Asia/Jakarta" },
          { label: "Asia/Shanghai", value: "Asia/Shanghai" },
          { label: "Australia/Perth", value: "Australia/Perth" },
          { label: "Australia/Eucla", value: "Australia/Eucla" },
          { label: "Asia/Tokyo", value: "Asia/Tokyo" },
          { label: "Australia/Adelaide", value: "Australia/Adelaide" },
          { label: "Australia/Sydney", value: "Australia/Sydney" },
          { label: "Australia/Lord Howe", value: "Australia/Lord Howe" },
          { label: "Pacific/Norfolk", value: "Pacific/Norfolk" },
          { label: "Pacific/Auckland", value: "Pacific/Auckland" },
          { label: "Pacific/Chatham", value: "Pacific/Chatham" },
          { label: "Pacific/Tongatapu", value: "Pacific/Tongatapu" },
          { label: "Pacific/Kiritimati", value: "Pacific/Kiritimati" }
        ]
      }
    ],
    dateRangeRequired: true
  };
  return config;
}

function call3rdPartyService(request, format) {

  var startDate = '';
  var endDate = '';
  if (request.dateRange !== undefined) {
    startDate = request.dateRange.startDate;
    endDate = request.dateRange.endDate;
    if (startDate !== undefined) { startDate = startDate.replace(new RegExp('-', 'gi'), '/'); }
    if (endDate !== undefined) { endDate = endDate.replace(new RegExp('-', 'gi'), '/'); }
  } else {
    startDate = '2018/01/01';
    endDate = '2018/01/01';
  }
  
  var accountid = request.configParams.accountid || '';
  var reportid = request.configParams.reportid || '';
  var timezone = request.configParams.timezone || '';
  if (timezone == '') { timezone = 'Europe/Rome'; }
  var totals = false;
  
  var params = {};  
  var userProperties = PropertiesService.getUserProperties();
  var username = userProperties.getProperty('dscc.username');
  var password = userProperties.getProperty('dscc.password');

  var headers = { "Authorization" : "Basic " + Utilities.base64Encode(username + ':' + password) };
  var params = { "method":"GET", "headers":headers };

  try {
    var response = UrlFetchApp.fetch("https://api.webtrends.io/v1/account/" + accountid + "/dataexport/" + reportid + "/data?begin=" + startDate + "/00&end=" + endDate + "/23&format=" + format + "&timezone=" + timezone + "&totals=" + totals, params);  
  } catch (e) {
    //throw new Error("The requested values have not been entered or are not correct. Check them and try to connect again.");
  }
  return response;
}

var webtrendsDataSchema = [];

function getSchema(request) {
  var k = 0;
  do {
    if (k > 0) {
      Utilities.sleep(15000);
    }
    var response_json = call3rdPartyService(request, 'json');
    response_json = JSON.parse(response_json.getContentText());
    k = k + 1;
  }
  while (response_json.state == 'Submitted');  // {state=Submitted, message=This export is processing. Export processing time depends on the amount of data requested. If you are viewing this message in a browser, hit Refresh to get the latest status. If processing is complete, Refreshing the browser will return the export file.}

  if (response_json.state === undefined) {
    var dimension1st_name = response_json.dimensions[0].type;
    webtrendsDataSchema.push({name: cleanFieldName(dimension1st_name), label: dimension1st_name, dataType: 'STRING', semantics: {conceptType: 'DIMENSION'}});
    
    try {
      var dimension2st_name = response_json.dimensions[0].dimensions[0].type;
      if (dimension2st_name !== undefined) {
        webtrendsDataSchema.push({name: cleanFieldName(dimension2st_name), label: dimension2st_name, dataType: 'STRING', semantics: {conceptType: 'DIMENSION'}});
      }
    }
    catch(error) {
      //Logger.log(error);
    }

    var measures_len = response_json.dimensions[0].measures.length;
    for (i=0; i<measures_len; i++) {
      webtrendsDataSchema.push({name: cleanFieldName(response_json.dimensions[0].measures[i].name), label: response_json.dimensions[0].measures[i].name + ' (' + response_json.dimensions[0].measures[i].type + ')', dataType: 'NUMBER', semantics: {conceptType: 'METRIC'}});
    }
    var scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty("webtrendsDataSchema", JSON.stringify(webtrendsDataSchema));
  }
  
  return {schema: webtrendsDataSchema};
};

function getData(request) {

  var scriptProperties = PropertiesService.getScriptProperties();
  webtrendsDataSchema = scriptProperties.getProperty("webtrendsDataSchema");

  webtrendsDataSchema = JSON.parse(webtrendsDataSchema);

  var dataSchema = [];
  request.fields.forEach(function(field) {
    for (var i = 0; i < webtrendsDataSchema.length; i++) {
      var webtrendsDataSchema_name_cleaned = cleanFieldName(webtrendsDataSchema[i].name);
      if (webtrendsDataSchema_name_cleaned === field.name) {
        dataSchema.push(webtrendsDataSchema[i]);
        break;
      }
    }
  });

  var response = call3rdPartyService(request, 'csv');
  response = CSV2JSON(response);
  response = JSON.parse(response);

  var data = [];
  response.forEach(function(row) {
    var values = [];
    dataSchema.forEach(function(field) {
      for (var key in row) {
        if(field.name == cleanFieldName(key)) {
          var value_to_push = row[key];
          if (value_to_push == '') { value_to_push = "-"; }
          values.push(value_to_push);
        }
      }
      
    });
    
    data.push({
      values: values
    });
  });

  
  var output = {
    schema: dataSchema,
    rows: data
  };

  return JSON.stringify(output);

};

function getAuthType() {
  var response = {
    "type": "USER_PASS"
  };
  return response;
}

function resetAuth() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('dscc.username');
  userProperties.deleteProperty('dscc.password');
}

function isAuthValid() {
  var userProperties = PropertiesService.getUserProperties();
  var username = userProperties.getProperty('dscc.username');
  var password = userProperties.getProperty('dscc.password');
  return validateCredentials(username, password);
}

function setCredentials(request) {
  var creds = request.userPass;
  var username = creds.username;
  var password = creds.password;

  var validCreds = validateCredentials(username, password);
  if (!validCreds) {
    resetAuth();
    return {
      errorCode: "INVALID_CREDENTIALS"
    };
  }
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('dscc.username', username);
  userProperties.setProperty('dscc.password', password);
  return {
    errorCode: "NONE"
  };
}

function validateCredentials(usr, psw) {
  var auth_valid = false;
  var params = {};  
  var headers = { "Authorization" : "Basic " + Utilities.base64Encode(usr + ':' + psw) };
  var params = { "method":"GET", "headers":headers };
  try {
    var response = UrlFetchApp.fetch("https://api.webtrends.io/v1/account/xx/dataexport/xx/data", params); // indirizzo fittizio per verificare le credenziali di accesso in base all'errore generato nella risposta
  } catch (e) {
    var error_str = e.toString();
    auth_valid = true;
    if (error_str.indexOf("authentication is invalid") >= 0) { auth_valid = false; };
  }
  return auth_valid;
}

function cleanFieldName(field_name) {
  var field_name_processed = field_name;
  field_name_processed = field_name_processed.replace(new RegExp(' ', 'gi'), '');
  field_name_processed = field_name_processed.replace(/\(.*?\)/, '');
  field_name_processed = field_name_processed.replace(/\(.*?\)/, '');
  return field_name_processed;
}

// Richiamata all'interno della funzione CSV2JSON per convertire un CSV in JSON
function CSVToArray(strData, strDelimiter) {
    strDelimiter = (strDelimiter || ",");
    var objPattern = new RegExp((
    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
    "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
    var arrData = [[]];
    var arrMatches = null;
    while (arrMatches = objPattern.exec(strData)) {
        var strMatchedDelimiter = arrMatches[1];
        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
            arrData.push([]);
        }
        if (arrMatches[2]) {
            var strMatchedValue = arrMatches[2].replace(
            new RegExp("\"\"", "g"), "\"");
        } else {
            var strMatchedValue = arrMatches[3];
        }
        arrData[arrData.length - 1].push(strMatchedValue);
    }
    return (arrData);
}

// Convertitore da CSV a JSON, fa uso della funzione CSVToArray
function CSV2JSON(csv) {
    var array = CSVToArray(csv);
    var objArray = [];
    for (var i = 1; i < array.length; i++) {
        objArray[i - 1] = {};
        for (var k = 0; k < array[0].length && k < array[i].length; k++) {
            var key = array[0][k];
            objArray[i - 1][key] = array[i][k]
        }
    }
    var json = JSON.stringify(objArray);
    var str = json.replace(/},/g, "},\r\n");
    return str;
}
