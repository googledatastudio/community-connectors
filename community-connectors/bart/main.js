var API_KEY = "MW9S-E7SL-26DU-VV8V";

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
    label: 'Station Name',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'abbr',
    label: 'Station Abbreviation',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'destination',
    label: 'Destination',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'abbreviation',
    label: 'Destination Abbreviation',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'limited',
    label: 'Limited',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'minutes',
    label: 'Minutes',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'platform',
    label: 'Platform',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'direction',
    label: 'Direction',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'length',
    label: 'Length',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'color',
    label: 'Color',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'hexcolor',
    label: 'Hex Color',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'bikeflag',
    label: 'Bike Flag',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'delay',
    label: 'Delay',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: true
    }
  },
  {
    name: 'count',
    label: 'Count',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: true
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

  var url = [
    'http://api.bart.gov/api/etd.aspx?cmd=etd&orig=ALL&json=y&key=',
    API_KEY
  ];
  var response = JSON.parse(UrlFetchApp.fetch(url.join(''))).root.station;

  var data = [];
  response.forEach(function(station) {
    station.etd.forEach(function(dest){
      dest.estimate.forEach(function(train){

        var values = [];
        dataSchema.forEach(function(field) {

          switch(field.name) {
            case 'name':
              values.push(station.name);
              break;
            case 'abbr':
              values.push(station.abbr);
              break;
            case 'destination':
              values.push(dest.destination);
              break;
            case 'abbreviation':
              values.push(dest.abbreviation);
              break;
            case 'limited':
              values.push(dest.limited);
              break;
            case 'minutes':
              values.push(train.minutes);
              break;
            case 'platform':
              values.push(train.platform);
              break;
            case 'direction':
              values.push(train.direction);
              break;
            case 'length':
              values.push(train.length);
              break;
            case 'color':
              values.push(train.color);
              break;
            case 'hexcolor':
              values.push(train.hexcolor);
              break;
            case 'bikeflag':
              values.push(train.bikeflag);
              break;
            case 'delay':
              values.push(train.delay);
              break;
            case 'count':
              values.push(1);
              break;
            default:
              values.push('');
          }

          data.push({
            values: values
          });
        });
      });
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
