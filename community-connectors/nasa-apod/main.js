var API_KEY = "DEMO_KEY";

function getConfig(request) {
  var config = {
    configParams: [
      {
        type: "INFO",
        name: "connect",
        text: "This connector does not require any configuration. Click CONNECT at the top right to get started."
      }
    ],
    'dateRangeRequired': true
  };
  return config;
};

var fixedSchema = [

  {
    name: 'date',
    label: 'Date',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'explanation',
    label: 'Explanation',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'media_type',
    label: 'Media Type',
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
    name: 'url',
    label: 'URL',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'hdurl',
    label: 'High Definition URL',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'copyright',
    label: 'Copyright',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
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
    'https://api.nasa.gov/planetary/apod?api_key=',
    API_KEY,
    '&date=',
    request.dateRange.endDate,
    '&hd=true'
  ];
  var response = UrlFetchApp.fetch(url.join(''));
  var item = JSON.parse(response.getContentText());

  var data = [];
  var values = [];
  dataSchema.forEach(function(field) {
    switch(field.name) {
      case 'date':
        values.push(item.date);
        break;
      case 'explanation':
        values.push(item.explanation);
        break;
      case 'copyright':
        values.push(item.copyright);
        break;
      case 'hdurl':
        values.push(item.hdurl);
        break;
      case 'media_type':
        values.push(item.media_type);
        break;
      case 'title':
        values.push(item.title);
        break;
      case 'url':
        values.push(item.url);
        break;
      default:
        values.push('');
    }
  });
  data.push({
    values: values
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
