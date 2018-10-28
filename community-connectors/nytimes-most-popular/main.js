function getConfig(request) {
  var config = {
    configParams: [
      {
        "type": 'TEXTINPUT',
        "name": 'apiKey',
        "displayName": 'API Key',
        "helpText": 'Enter your API key. You can register for an API key at https://developer.nytimes.com/',
        "placeholder": 'Enter API Key'
      }
    ]
  };
  return config;
};

var fixedSchema = [
  {
    name: 'section',
    label: 'Section',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'title',
    label: 'Title',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'abstract',
    label: 'Abstract',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'url',
    label: 'URL',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'byline',
    label: 'Byline',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'source',
    label: 'Source',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'published_date',
    label: 'Published Date',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'count',
    label: 'Count of Articles',
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
    'https://api.nytimes.com/svc/mostpopular/v2/mostviewed/all-sections/1.json?api-key=',
    request.configParams.apiKey
  ];
  var response = JSON.parse(UrlFetchApp.fetch(url.join(''))).results;

  var data = [];
  response.forEach(function(item) {
    var values = [];
    dataSchema.forEach(function(field) {
      switch(field.name) {
        case 'section':
          values.push(item.section);
          break;
        case 'title':
          values.push(item.title);
          break;
        case 'abstract':
          values.push(item.abstract);
          break;
        case 'url':
          values.push(item.url);
          break;
        case 'byline':
          values.push(item.byline);
          break;
        case 'source':
          values.push(item.source);
          break;
        case 'published_date':
          values.push(item.published_date);
          break;
        case 'count':
          values.push(1);
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
};

function isAdminUser() {
  return false;
};
