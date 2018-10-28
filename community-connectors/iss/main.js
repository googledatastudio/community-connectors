function getConfig(request) {
  var config = {
    configParams: [
      {
        type: "INFO",
        name: "connect",
        text: "This connector does not require any configuration. Click CONNECT at the top right to get started."
      }
    ]
  };
  return config;
};

var fixedSchema = [  
  {
    name: 'name',
    label: 'Satellite Name',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'id',
    label: 'Satellite ID',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },  
  {
    name: 'latitude',
    label: 'Latitude',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'longitude',
    label: 'Longitude',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'DIMENSION'
    }
  }, 
  {
    name: 'latLong',
    label: 'Latitude, Longitude',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },   
  {
    name: 'altitude',
    label: 'Altitude',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'velocity',
    label: 'Velocity',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'DIMENSION'
    }
  }, 
  {
    name: 'visibiltiy',
    label: 'Visibility',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'footprint',
    label: 'Footprint',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },  
  {
    name: 'timestamp',
    label: 'Timestamp',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },  
  {
    name: 'daynum',
    label: 'Day Number',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },  
  {
    name: 'solar_lat',
    label: 'Solar Latitude',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },  
  {
    name: 'solar_lon',
    label: 'Solar Longitude',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },  
  {
    name: 'units',
    label: 'Units',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'count',
    label: 'Count',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable:true
    }
  }  
];

function getSchema(request) {
  return {schema: fixedSchema};
};

function getData(request) {
  var dataSchema = [];
  request.fields.forEach(function(field) {
    for (var i = 0; i < fixedSchema.length; i++) {
      if (fixedSchema[i].name === field.name) {
        dataSchema.push(fixedSchema[i]);
        break;
      }
    }
  });

  if (!Date.now) {
    Date.now = function now() {
      return new Date().getTime();
    };
  }

  var t = Date.now()/1000;
  
  var timestamps = [];
  for(var i=0; i<10; i++) {
    timestamps.push(t);
    t = t - (60*5);  
  }

  var url = [
    'https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=',
    timestamps.join()
  ];
  var response = JSON.parse(UrlFetchApp.fetch(url.join('')));

  var data = [];
  response.forEach(function(item) {
    var values = [];
    dataSchema.forEach(function(field) {
      switch(field.name) {
        case 'count':
          values.push('1');
          break;
        case 'latLong':
          values.push(item.latitude + ',' + item.longitude)
          break;
        default:
          if(!!item[field.name]){
            values.push(item[field.name]);
          } else {
            values.push('');
          }
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
};

function isAdminUser() {
  return false;
};
