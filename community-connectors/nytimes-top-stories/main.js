function getConfig(request) {
  var config = {
    configParams: [
      {
        "type": 'TEXTINPUT',
        "name": 'apiKey',
        "displayName": 'API Key',
        "helpText": 'Enter your API key. You can register for an API key at https://developer.nytimes.com/',
        "placeholder": 'Enter API Key'
      },
      {
        "type": "SELECT_SINGLE",
        "name": "select_section",
        "displayName": "Select Section",
        "helpText": "The connector will retrieve top stories for the selected section.",
        "options": [
          {
            "label": "Home",
            "value": "home"
          },
          {
            "label": "Arts",
            "value": "arts"
          },
          {
            "label": "Automobiles",
            "value": "automobiles"
          },
          {
            "label": "Books",
            "value": "books"
          },
          {
            "label": "Business",
            "value": "business"
          },
          {
            "label": "Fashion",
            "value": "fashion"
          },
          {
            "label": "Food",
            "value": "food"
          },
          {
            "label": "Health",
            "value": "health"
          },
          {
            "label": "Insider",
            "value": "insider"
          },
          {
            "label": "Magazine",
            "value": "magazine"
          },
          {
            "label": "Movies",
            "value": "movies"
          },
          {
            "label": "National",
            "value": "national"
          },
          {
            "label": "Opinion",
            "value": "opinion"
          },
          {
            "label": "Politics",
            "value": "politics"
          },
          {
            "label": "Science",
            "value": "science"
          },
          {
            "label": "Sports",
            "value": "sports"
          },
          {
            "label": "Technology",
            "value": "technology"
          },
          {
            "label": "Travel",
            "value": "travel"
          },
          {
            "label": "World",
            "value": "world"
          },
        ]
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
    name: 'subsection',
    label: 'Sub-Section',
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
    name: 'item_type',
    label: 'Item Type',
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
    name: 'thumb_standard',
    label: 'Standard Thumbnail URL',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'thumb_large',
    label: 'Large Thumbnail URL',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'img_normal',
    label: 'Normal Image URL',
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
    'https://api.nytimes.com/svc/topstories/v2/',
    request.configParams.select_section,
    '.json?api-key=',
    request.configParams.apiKey
  ];
  var response = JSON.parse(UrlFetchApp.fetch(url.join(''))).results;

  var data = [];
  response.forEach(function(item) {
    var values = [];

    var images = [];
    var multimedia = item.multimedia;
    multimedia.forEach(function(img) {
      switch(img.format) {
        case 'Standard Thumbnail':
          images['thumb_standard'] = img.url;
          break;
        case 'thumbLarge':
          images['thumb_large'] = img.url;
          break;
        case 'Normal':
          images['img_normal'] = img.url;
          break;
      }
    });

    dataSchema.forEach(function(field) {
      switch(field.name) {
        case 'section':
          values.push(item.section);
          break;
        case 'subsection':
          values.push(item.subsection);
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
        case 'item_type':
          values.push(item.item_type);
          break;
        case 'published_date':
          values.push(item.published_date);
          break;
        case 'thumb_standard':
        case 'thumb_large':
        case 'img_normal':
          values.push(images[field.name]);
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
