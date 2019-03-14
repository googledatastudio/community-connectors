function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config
    .newSelectSingle()
    .setId('select_section')
    .setName('Select Section')
    .setHelpText(
      'The connector will retrieve top stories for the selected section.'
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Home')
        .setValue('home')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Arts')
        .setValue('arts')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Automobiles')
        .setValue('automobiles')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Books')
        .setValue('books')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Business')
        .setValue('business')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Fashion')
        .setValue('fashion')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Food')
        .setValue('food')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Health')
        .setValue('health')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Insider')
        .setValue('insider')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Magazine')
        .setValue('magazine')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('National')
        .setValue('national')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Opinion')
        .setValue('opinion')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Politics')
        .setValue('politics')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Science')
        .setValue('science')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Sports')
        .setValue('sports')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Technology')
        .setValue('technology')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Travel')
        .setValue('travel')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('World')
        .setValue('world')
    );

  return config.build();
}

function getFields() {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
    .newDimension()
    .setId('section')
    .setName('Section')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('subsection')
    .setName('Sub-Section')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('title')
    .setName('Title')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('abstract')
    .setName('Abstract')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('url')
    .setName('URL')
    .setType(types.URL);

  fields
    .newDimension()
    .setId('byline')
    .setName('Byline')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('item_type')
    .setName('Item Type')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('published_date')
    .setName('Published Date')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('thumb_standard')
    .setName('Standard Thumbnail URL')
    .setType(types.URL);

  fields
    .newDimension()
    .setId('thumb_large')
    .setName('Large Thumbnail URL')
    .setType(types.URL);

  fields
    .newDimension()
    .setId('img_normal')
    .setName('Normal Image URL')
    .setType(types.URL);

  fields
    .newMetric()
    .setId('count')
    .setName('Count of Articles')
    .setType(types.NUMBER);

  return fields;
}

function getSchema(request) {
  return {schema: getFields().build()};
}

function getData(request) {
  var userProperties = PropertiesService.getUserProperties();
  var key = userProperties.getProperty('dscc.key');

  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  var requestedFields = getFields().forIds(requestedFieldIds);

  var url = [
    'https://api.nytimes.com/svc/topstories/v2/',
    request.configParams.select_section,
    '.json?api-key=',
    key
  ];
  var response = JSON.parse(UrlFetchApp.fetch(url.join(''))).results;

  var data = [];
  response.forEach(function(item) {
    var values = [];

    var images = [];
    var multimedia = item.multimedia;
    multimedia.forEach(function(img) {
      switch (img.format) {
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

    requestedFields.asArray().forEach(function(field) {
      switch (field.getId()) {
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
          values.push(images[field.getId()]);
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
    schema: requestedFields.build(),
    rows: data
  };
}

function getAuthType() {
  return {
    type: 'KEY'
  };
}

function validateKey(key) {
  var url = [
    'https://api.nytimes.com/svc/topstories/v2/home.json?api-key=',
    key
  ];
  var response = JSON.parse(
    UrlFetchApp.fetch(url.join(''), {muteHttpExceptions: true})
  );

  return response.status == 'OK';
}

function isAuthValid() {
  var userProperties = PropertiesService.getUserProperties();
  var key = userProperties.getProperty('dscc.key');

  return validateKey(key);
}

function resetAuth() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('dscc.key');
}

function setCredentials(request) {
  var key = request.key;

  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('dscc.key', key);
  return {
    errorCode: 'NONE'
  };
}

function isAdminUser() {
  return false;
}
