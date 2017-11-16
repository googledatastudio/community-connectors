function getConfig() {
  var config = {
    configParams: [
      {
        type: "INFO",
        name: "csvConnector",
        text: "The CSV-Connector currently supports a fixed amount of three columns. Name them column1, column2 and column3. Column1 is the dimension, column2 holds the metrics and column3 may be used as an additional category. You may change the label in the next window."
      }
      ,{
        type: "TEXTINPUT",
        name: "url",
        helpText: "If you want to use a CSV-file from GoogleDrive, use this format where 123 at the end is your document id: https://drive.google.com/uc?export=download&id=123",
        displayName: "Provide the url to your csv file."
      }
      
    ]
  };
  return config;

};


var csvDataSchema = [
  {
    name: 'column1',
    label: 'column1',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'column2',
    label: 'column2',
    dataType: 'NUMBER',
    semantics: {
      "isReaggregatable": true,
      conceptType: 'METRIC'
    }
  },{
    name: 'column3',
    label: 'column3',
    dataType: 'STRING',
    semantics: {
      "isReaggregatable": false,
      conceptType: 'DIMENSION'
  }
  
  }
];

function getSchema(request) {
  
  return {schema: csvDataSchema};
  
};

function isAdminUser() {
  return true;
}


function csvToObject(array) {

  var headers = array[0];

  var jsonData = [];
    for ( var i = 1, length = array.length; i < length; i++ )
    {
      var row = array[i];
      var data = {};
      for ( var x = 0; x < row.length; x++ )
      {
        data[headers[x]] = row[x];
      }
      jsonData.push(data);

    }

    return jsonData;
  }
/*
function stringToObject(string, separator)
{
  var object = {};
  
  var array = string.split(separator);
  
  for (var i = 0; i < array.length; i++) {
    if (i % 2 === 0) { 
      object[array[i]] = array[i + 1];
    } else { 
      continue;
      
    }
  }
  
  return object
}
*/

function getData(request) {
  
  /*
  I DONT GET SPLIT TO WORK SO FOR NOW THIS ONLY SUPPORTS PREPARED AND WORKING SHARING URL
  FOR GOOGLE DRIVE
  if (request.configParams.isGoogleDrive == "true")
  {
      var urlString = request.configParams.url.toString();
    var urlArray = urlString.split("?");
    
      var params = stringToObject(urlArray, '"');
    
      var docId = params["id"];
  
      var url = "https://drive.google.com/uc?export=download&id=" + docId;
    
  } else {
    
      var url = request.configParams.url;
  }
  */
  
  var url = request.configParams.url;
  
  var dataSchema = [];
  
  request.fields.forEach(function(field) {
    for (var i = 0; i < csvDataSchema.length; i++) {
      if (csvDataSchema[i].name === field.name) {
        dataSchema.push(csvDataSchema[i]);
        break;
      }
    }
  });
  
  var csvFile = UrlFetchApp.fetch(url);
  
  var csvData = Utilities.parseCsv(csvFile);

  var sourceData = csvToObject(csvData);
  
  var data = [];
  
  sourceData.forEach(function(row) {
    var values = [];
    dataSchema.forEach(function(field) {
      switch(field.name) {
        case 'column1':
          values.push(row.column1);
          break;
        case 'column2':
          values.push(row.column2);
          break;
        case 'column3':
          values.push(row.column3);
          break;
        default:
          values.push('');
      }
    });
    data.push({
      values: values
    });
  });

  return {
    schema: dataSchema,
    rows: data
  };
  
};

function getAuthType() {
  var response = {
    "type": "NONE"
  };
  return response;
}
