function getConfig(request) {
  var config = {
    configParams: [
      {
        type: 'SELECT_SINGLE',
        name: 'resource',
        displayName: 'Select Data Type',
        helpText: 'The connector will retrieve data for the selected type.',
        options: [
          {
            label: 'Films',
            value: 'films',
          },
          {
            label: 'People',
            value: 'people',
          },
          {
            label: 'Planets',
            value: 'planets',
          },
          {
            label: 'Species',
            value: 'species',
          },
          {
            label: 'Starships',
            value: 'starships',
          },
          {
            label: 'Vehicles',
            value: 'vehicles',
          },
        ],
      },
    ],
  };
  return config;
}

var fixedSchema = {
  films: [
    {
      name: 'title',
      label: 'Title',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'episode_id',
      label: 'Episode ID',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'opening_crawl',
      label: 'Opening Crawl',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'director',
      label: 'Director',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'producer',
      label: 'Producer',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'release_date',
      label: 'Release Date',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
  ],
  people: [
    {
      name: 'name',
      label: 'Name',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'birth_year',
      label: 'Birth Year',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'eye_color',
      label: 'Eye Color',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'gender',
      label: 'Gender',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'hair_color',
      label: 'Hair Color',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'height',
      label: 'Height',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'mass',
      label: 'Mass',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'skin_color',
      label: 'Skin Color',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
  ],
  planets: [
    {
      name: 'name',
      label: 'Name',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'diameter',
      label: 'Diameter',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'rotation_period',
      label: 'Rotation Period',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'orbital_period',
      label: 'Orbital Period',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'gravity',
      label: 'Gravity',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'population',
      label: 'Population',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'climate',
      label: 'Climate',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'terrain',
      label: 'Terrain',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'surface_water',
      label: 'Surface Water',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
  ],
  species: [
    {
      name: 'name',
      label: 'Name',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'classification',
      label: 'Classification',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'designation',
      label: 'Designation',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'average_height',
      label: 'Average Height',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'average_lifespan',
      label: 'Average Lifespan',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'eye_colors',
      label: 'Eye Colors',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'hair_colors',
      label: 'Hair Colors',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'skin_colors',
      label: 'Skin Colors',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'language',
      label: 'Language',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
  ],
  starships: [
    {
      name: 'name',
      label: 'Name',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'model',
      label: 'Model',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'starship_class',
      label: 'Starship Class',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'manufacturer',
      label: 'Manufacturer',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'cost_in_credits',
      label: 'Cost in Credits',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'length',
      label: 'Length',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'crew',
      label: 'Crew',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'passengers',
      label: 'Passengers',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'max_atmosphering_speed',
      label: 'Max Atmosphering Speed',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'hyperdrive_rating',
      label: 'Hyperdrive Rating',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'MGLT',
      label: 'Max Megalights per hour',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'cargo_capacity',
      label: 'Cargo Capacity',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'consumables',
      label: 'Consumables Capacity',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
  ],
  vehicles: [
    {
      name: 'name',
      label: 'Name',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'model',
      label: 'Model',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'vehicle_class',
      label: 'Vehicle Class',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'manufacturer',
      label: 'Manufacturer',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'cost_in_credits',
      label: 'Cost in Credits',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'length',
      label: 'Length',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'crew',
      label: 'Crew',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'passengers',
      label: 'Passengers',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'max_atmosphering_speed',
      label: 'Max Atmosphering Speed',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'cargo_capacity',
      label: 'Cargo Capacity',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
        isReaggregatable: true,
      },
    },
    {
      name: 'consumables',
      label: 'Consumables Capacity',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
  ],
};

function getSchema(request) {
  return {schema: fixedSchema[request.configParams.resource]};
}

function getData(request) {
  var dataSchema = [];
  var schema = fixedSchema[request.configParams.resource];
  request.fields.forEach(function(field) {
    for (var i = 0; i < schema.length; i++) {
      if (schema[i].name === field.name) {
        dataSchema.push(schema[i]);
        break;
      }
    }
  });

  var fullResponse = [];
  var next;
  var pageNum = 1;

  do {
    var url = [
      'https://swapi.co/api/',
      request.configParams.resource,
      '/?page=',
      pageNum,
    ];

    var response = JSON.parse(UrlFetchApp.fetch(url.join('')));
    var results = response.results;
    fullResponse = fullResponse.concat(results);

    next = !!response.next;
    pageNum++;
  } while (next);

  var data = [];
  fullResponse.forEach(function(item) {
    var values = [];
    dataSchema.forEach(function(field) {
      if (!!item[field.name]) {
        values.push(item[field.name]);
      } else {
        values.push('');
      }
    });
    data.push({
      values: values,
    });
  });

  return {
    schema: dataSchema,
    rows: data,
  };
}

function getAuthType() {
  var response = {
    type: 'NONE',
  };
  return response;
}

function isAdminUser() {
  return false;
}
