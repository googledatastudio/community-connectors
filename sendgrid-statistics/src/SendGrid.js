/**
 * 
 * @param {string} text 
 */
function throwUserException(text) {
  var cc = DataStudioApp.createCommunityConnector();
  cc.newUserError().setText(text).throwException();
}

function getSendGridConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();
  var firstRun = (request.configParams == undefined);

  if (firstRun) {
    config.setIsSteppedConfig(true);
  }

  config
    .newSelectSingle()
    .setName('Data Aggregation')
    .setId('aggregated_by')
    .setHelpText('How the statistics should be grouped on output. By day, week or month.')
    .addOption(config.newOptionBuilder().setLabel('By Day').setValue('day'))
    .addOption(config.newOptionBuilder().setLabel('By Week').setValue('week'))
    .addOption(config.newOptionBuilder().setLabel('By Month').setValue('month'));

  config
    .newSelectSingle()
    .setName('Statistics Type')
    .setId('stats_type')
    .setHelpText('Choose the email statistics type you would like to report on.')
    .setIsDynamic(true)
    .addOption(config.newOptionBuilder().setLabel('Global').setValue('global'))
    .addOption(config.newOptionBuilder().setLabel('Category').setValue('categories'))
    .addOption(config.newOptionBuilder().setLabel('Subuser').setValue('subusers'))
    .addOption(config.newOptionBuilder().setLabel('Mailbox Provider').setValue('mailbox_providers'))
    .addOption(config.newOptionBuilder().setLabel('Browser').setValue('browsers'))
    .addOption(config.newOptionBuilder().setLabel('Country and State/Province').setValue('geo'))
    .addOption(config.newOptionBuilder().setLabel('Device Type').setValue('devices'))
    .addOption(config.newOptionBuilder().setLabel('Client Type').setValue('clients'));

  if (!firstRun) {
    switch (request.configParams.stats_type) {
      case 'categories':
      case 'subusers':
      case 'mailbox_providers':
      case 'browsers': {
        //All of these items use named options
        config
          .newTextArea()
          .setId('filter')
          .setName('Filter Items')
          .setAllowOverride(true)
          .setHelpText('[Optional] Enter the items you would like to include - one line per item. Leave blank to return all items (see SendGrid API docs)')
          .setPlaceholder('(Optional - one item per line) ' + '\n' +
            request.configParams.stats_type + '-1\n' +
            request.configParams.stats_type + '-2\n' +
            request.configParams.stats_type + '-3');
        break;
      }
      case 'geo': {
        config
          .newSelectSingle()
          .setId('country')
          .setName('Country')
          .setAllowOverride(true)
          .setHelpText('[Optional] Select a country from the list or leave blank to return all values.')
          .addOption(config.newOptionBuilder().setLabel('USA').setValue('US'))
          .addOption(config.newOptionBuilder().setLabel('Canada').setValue('CA'));
        break;
      }
      default: {
        //Need a blank info area to force updates when a user selects a stats_type
        config
          .newInfo()
          .setId('info_req')
        break;
      }
    };
  }

  config.setDateRangeRequired(true);

  return config;
}

function getSendGridSchema(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();

  fields.newDimension()
    .setId('row')
    .setName('Row Number')
    .setType(cc.FieldType.NUMBER);

  fields.newDimension()
    .setId('date')
    .setName('Event Date')
    .setDescription('Date of the event aggregation.')
    .setType(cc.FieldType.YEAR_MONTH_DAY);

  switch (request.configParams.stats_type) {
    //Type and name do not appear on global stats
    case 'global':
      fields.setDefaultDimension('date');
      break;
    default: {
      fields.newDimension()
        .setId('type')
        .setName('Segmentation Type')
        .setDescription('Type of the segmentation.')
        .setIsHidden(true) //Load the field but hide it as it's not really very helpful to anyone
        .setType(cc.FieldType.TEXT);

      fields.newDimension()
        .setId('name')
        .setName('Segmentation')
        .setDescription('The segmentation values based on the Statistics Type.')
        .setType(cc.FieldType.TEXT);

      fields.setDefaultDimension('name');
      break;
    }
  };

  switch (request.configParams.stats_type) {
    case 'global':
    case 'subusers':
    case 'categories': {
      fields.newMetric()
        .setId('requests')
        .setName('Requests')
        .setDescription('The number of emails that were requested to be delivered.')
        .setType(cc.FieldType.NUMBER)
        .setGroup('Send')
        .setAggregation(cc.AggregationType.SUM);

      fields.newMetric()
        .setId('processed')
        .setName('Processed')
        .setDescription('Requests from your website, application, or mail client via SMTP Relay or the API that SendGrid processed.')
        .setType(cc.FieldType.NUMBER)
        .setGroup('Send')
        .setAggregation(cc.AggregationType.SUM);

      fields.newMetric()
        .setId('unsubscribes')
        .setName('Unsubscribes')
        .setDescription('The number of recipients who unsubscribed from your emails.')
        .setType(cc.FieldType.NUMBER)
        .setGroup('Recipients')
        .setAggregation(cc.AggregationType.SUM);

      fields.newMetric()
        .setId('bounce_drops')
        .setName('Bounce Drops')
        .setDescription('The number of emails that were dropped because of a bounce.')
        .setType(cc.FieldType.NUMBER)
        .setGroup('Drops')
        .setAggregation(cc.AggregationType.SUM);

      fields.newMetric()
        .setId('spam_report_drops')
        .setName('Spam Report Drops')
        .setDescription('The number of emails that were dropped due to a recipient previously marking your emails as spam.')
        .setType(cc.FieldType.NUMBER)
        .setGroup('Drops')
        .setAggregation(cc.AggregationType.SUM);

      fields.newMetric()
        .setId('unsubscribe_drops')
        .setName('Unsubscribe Drops')
        .setDescription('The number of emails dropped due to a recipient unsubscribing from your emails.')
        .setType(cc.FieldType.NUMBER)
        .setGroup('Drops')
        .setAggregation(cc.AggregationType.SUM);

      fields.newMetric()
        .setId('invalid_emails')
        .setName('Invalid Emails')
        .setDescription('The number of recipients who had malformed email addresses or whose mail provider reported the address as invalid.')
        .setType(cc.FieldType.NUMBER)
        .setGroup('Recipients')
        .setAggregation(cc.AggregationType.SUM);

      fields.newMetric()
        .setId('delivery_rate')
        .setName('Delivery Rate')
        .setDescription('The percentage of send requests where the email was delivered to the recipients email provider.')
        .setFormula('SUM($delivered)/SUM($requests)')
        .setType(cc.FieldType.PERCENT)
        .setGroup('Interactions')
        .setAggregation(cc.AggregationType.AUTO)

      //Add Drops calculated field
      fields.newMetric()
        .setId('total_drops')
        .setName('Drops')
        .setDescription('The number of emails that were not delivered due to the recipient email address being on a suppression list.')
        .setType(cc.FieldType.NUMBER)
        .setFormula('$unsubscribe_drops + $spam_report_drops + $bounce_drops')
        .setGroup('Failures')
        .setAggregation(cc.AggregationType.AUTO);

      //No break - more fields coming
    }
    case 'mailbox_providers': {
      fields.newMetric()
        .setId('deferred')
        .setName('Deferred')
        .setDescription('The number of emails that temporarily could not be delivered.')
        .setType(cc.FieldType.NUMBER)
        .setGroup('Send')
        .setAggregation(cc.AggregationType.SUM);

      fields.newMetric()
        .setId('delivered')
        .setName('Delivered')
        .setDescription('The number of emails SendGrid was able to confirm were actually delivered to a recipient.')
        .setType(cc.FieldType.NUMBER)
        .setGroup('Send')
        .setAggregation(cc.AggregationType.SUM);

      fields.newMetric()
        .setId('spam_reports')
        .setName('Spam Reports')
        .setDescription('The number of recipients who marked your email as spam.')
        .setType(cc.FieldType.NUMBER)
        .setGroup('Recipients')
        .setAggregation(cc.AggregationType.SUM);

      fields.newMetric()
        .setId('blocks')
        .setName('Blocks')
        .setDescription('The number of emails that were not allowed to be delivered by ISPs.')
        .setType(cc.FieldType.NUMBER)
        .setGroup('Failures')
        .setAggregation(cc.AggregationType.SUM);

      fields.newMetric()
        .setId('bounces')
        .setName('Bounces')
        .setDescription('The number of emails that bounced instead of being delivered.')
        .setType(cc.FieldType.NUMBER)
        .setGroup('Failures')
        .setAggregation(cc.AggregationType.SUM);

      fields.newMetric()
        .setId('open_rate')
        .setName('Open Rate')
        .setDescription('The percentage of delivered emails where a recipient opened the email.')
        .setType(cc.FieldType.PERCENT)
        .setGroup('Interactions')
        .setFormula('SUM($unique_opens)/SUM($delivered)')
        .setAggregation(cc.AggregationType.AUTO)

      fields.newMetric()
        .setId('click_through_rate')
        .setName('Click Through Rate')
        .setDescription('The percentage of delivered emails where a recipient clicked a link in the email.')
        .setType(cc.FieldType.PERCENT)
        .setGroup('Interactions')
        .setFormula('SUM($unique_clicks)/SUM($delivered)')
        .setAggregation(cc.AggregationType.AUTO);

      fields.newMetric()
        .setId('click_to_open_rate')
        .setName('Click to Open Rate')
        .setDescription('The percentage of opened emails where a recipient clicked a link in the email.')
        .setType(cc.FieldType.PERCENT)
        .setGroup('Interactions')
        .setFormula('SUM($unique_clicks)/SUM($unique_opens)')
        .setAggregation(cc.AggregationType.AUTO);

      //Drops is a static field if we are doing mailbox_stats (calculated field for global)
      if (request.configParams.stats_type == 'mailbox_providers') {
        fields.newMetric()
          .setId('drops')
          .setName('Drops')
          .setDescription('The number of emails that were not delivered due to the recipient email address being on a suppression list.')
          .setType(cc.FieldType.NUMBER)
          .setGroup('Drops')
          .setAggregation(cc.AggregationType.SUM);
      }
    }
    case 'geo':
    case 'browsers': {
      fields.newMetric()
        .setId('clicks')
        .setName('Clicks')
        .setDescription('The number of links that were clicked in your emails.')
        .setType(cc.FieldType.NUMBER)
        .setGroup('Interactions')
        .setAggregation(cc.AggregationType.SUM);

      fields.newMetric()
        .setId('unique_clicks')
        .setName('Unique Clicks')
        .setDescription('The number of unique recipients who clicked links in your emails.')
        .setType(cc.FieldType.NUMBER)
        .setGroup('Interactions')
        .setAggregation(cc.AggregationType.SUM);

      //Browsers is done at this point - all others keep going
      if (request.configParams.stats_type == 'browsers') break;
    }
    case 'devices':
    case 'clients': {
      fields.newMetric()
        .setId('opens')
        .setName('Opens')
        .setDescription('The total number of times your emails were opened by recipients.')
        .setType(cc.FieldType.NUMBER)
        .setGroup('Interactions')
        .setAggregation(cc.AggregationType.SUM);

      fields.newMetric()
        .setId('unique_opens')
        .setName('Unique Opens')
        .setDescription('The number of unique recipients who opened your emails.')
        .setType(cc.FieldType.NUMBER)
        .setGroup('Interactions')
        .setAggregation(cc.AggregationType.SUM);

      break;
    }
    default: {
      cc.newDebugError().setText('Unhandled stats_type "' + request.configParams.stats_type + '".').throwException();
      break;
    }
  };

  return fields;
}

/**
 * 
 * @param {string} key - SendGrid API key with permissions to perform stats requests
 */
function validateAPIKey(key) {
  if (key == '' || key == null) {
    return false;
  } else {
    var today = new Date().toISOString().split('T')[0];

    var URL = buildURL('global', 'day', today, today);

    var options = {
      'method': 'GET',
      "muteHttpExceptions": true,
      'headers': {
        Authorization: "Bearer " + key,
        'contentType': 'application/json'
      }
    }

    var result = UrlFetchApp.fetch(URL, options);

    if (result.getResponseCode() == 200) {
      return true;
    } else {
      return false;
    }
  }
}

function getSendGridData(request) {
  var userProperties = PropertiesService.getUserProperties();
  var key = userProperties.getProperty('dscc.key');
  var filters = (request.configParams.filter !== undefined) ? request.configParams.filter.split('\n') : undefined;

  var json_result = getStatsJSON(
    buildURL(
      request.configParams.stats_type,
      request.configParams.aggregated_by,
      request.dateRange.startDate,
      request.dateRange.endDate,
      filters
    ),
    key
  )

  var requestedFieldIds = request.fields.map(function (field) {
    return field.name;
  });
  var requestedFields = getSendGridSchema(request).forIds(requestedFieldIds);

  Logger.log('Get SendGrid data');

  var data = [];
  var row = 1;
  json_result.forEach(function (date_entry) {

    date_entry.stats.forEach(function (stats_entry) {
      var values = [];
      requestedFields.asArray().forEach(function (field) {
        var curr_field = field.getId()
        switch (curr_field) {
          case "row":
            values.push(row);
            row++;
            break;
          case 'date':
            values.push(date_entry.date);
            break;
          case 'type':
            values.push(stats_entry.type);
            break;
          case 'name':
            values.push(stats_entry.name);
            break;
          default:
            values.push(stats_entry.metrics[curr_field])
            break;
        }
      })
      data.push({
        values: values
      });
    })
  })
  return {
    schema: requestedFields.build(),
    rows: data
  }
}

/**
 * 
 * @param {string} stats_type - the sendgrid stats type to return
 * @param {string} aggregated_by - how the data should be aggregated
 * @param {string} start_date - start date for results in YYYY-MM-DD format
 * @param {string} end_date - end date for results in YYYY-MM-DD format
 */
function buildURL(stats_type, aggregated_by, start_date, end_date) {
  return buildURL(stats_type, aggregated_by, start_date, end_date, undefined)
}

/**
 * 
 * @param {string} stats_type - the sendgrid stats type to return
 * @param {string} aggregated_by - how the data should be aggregated
 * @param {string} start_date - start date for results in YYYY-MM-DD format
 * @param {string} end_date - end date for results in YYYY-MM-DD format
 * @param {string[]} filters - array of filters to use if appropriate
 */
function buildURL(stats_type, aggregated_by, start_date, end_date, filters) {
  var url = [
    'https://api.sendgrid.com',
    'v3'
  ]

  if (stats_type != 'global') {
    url.push(stats_type);
  }
  url.push('stats');

  var params = [
    'start_date=' + start_date,
    'end_date=' + end_date,
    'aggregated_by=' + aggregated_by
  ]

  //Setup filters if passed
  if (Array.isArray(filters) && filters.length) {
    var filter_name = stats_type;
    switch (stats_type) {
      case 'global':
      case 'devices':
      case 'clients':
        //filters not supported
        break;
      case 'geo':
        //geo is the only filter that doesn't use the same name for the filter and api URL
        filter_name = 'country';
      default:
        filters.forEach(function (item) {
          params.push(filter_name + '=' + item);
        });
        break;
    }
  }

  return url.join('/') + '?' + params.join('&');
}

/**
 * 
 * @param {string} url 
 * @param {string} apikey 
 */
function getStatsJSON(url, apikey) {
  var options = {
    'method': 'GET',
    "muteHttpExceptions": true,
    'headers': {
      Authorization: "Bearer " + apikey,
      'contentType': 'application/json'
    }
  }

  var result = UrlFetchApp.fetch(url, options);

  if (result.getResponseCode() == 200) {
    return JSON.parse(result);
  } else {
    throwUserException('Failed to retrieve SendGrid data. HTTP Error ' + result.getResponseCode());
  }
}