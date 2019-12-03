// vim: ft=javascript:ts=2:sw=2
/*
Copyright 2017 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * Returns a configuration object for the connector. DataStudio uses this to set up the connector.
 *
 * @param {Object} request - the schema request
 * @return {Object} A JavaScript object representing the schema for the given request.
 */
function getSchema(request) {
  if (request.configParams.googleFitDataType === 'activity') {
    var schema = createActivityField();
  } else if (request.configParams.googleFitDataType === 'steps') {
    var schema = createStepsField();
  } else if (request.configParams.googleFitDataType === 'weight') {
    var schema = createWeightField();
  } else if (request.configParams.googleFitDataType === 'heart_rate') {
    var schema = createHeartRateField();
  } else if (request.configParams.googleFitDataType === 'heart_rate_daily') {
    var schema = createHeartRateDailyField();
  }
  return {schema: schema};
}

/** Functions to create schema for slected config params data type
 *
 * @return {Object} A JavaScript object representing the schema
 */
function createActivityField() {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;

  fields
    .newMetric()
    .setId('ActiveSeconds')
    .setName('ActiveSeconds')
    .setType(types.NUMBER);
  fields
    .newDimension()
    .setId('StartTime')
    .setName('StartTime')
    .setType(types.YEAR_MONTH_DAY);
  fields
    .newDimension()
    .setId('EndTime')
    .setName('EndTime')
    .setType(types.YEAR_MONTH_DAY);
  fields
    .newDimension()
    .setId('ActivityCode')
    .setName('ActivityCode')
    .setType(types.NUMBER);
  fields
    .newDimension()
    .setId('ActivityDescription')
    .setName('ActivityDescription')
    .setType(types.TEXT);
  return fields.build();
}

/** Functions to create schema for slected config params data type
 *
 * @return {Object} A JavaScript object representing the schema
 */
function createStepsField() {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;

  fields
    .newDimension()
    .setId('StartTime')
    .setName('StartTime')
    .setDescription('Start Time')
    .setType(types.YEAR_MONTH_DAY);
  fields
    .newDimension()
    .setId('EndTime')
    .setName('EndTime')
    .setDescription('EndTime')
    .setType(types.YEAR_MONTH_DAY);
  fields
    .newMetric()
    .setId('Steps')
    .setName('Steps')
    .setDescription('Steps')
    .setType(types.NUMBER);
  return fields.build();
}

/** Functions to create schema for slected config params data type
 *
 * @return {Object} A JavaScript object representing the schema
 */
function createWeightField() {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  fields
    .newDimension()
    .setId('StartTime')
    .setName('StartTime')
    .setDescription('Start Time')
    .setType(types.YEAR_MONTH_DAY);
  fields
    .newDimension()
    .setId('EndTime')
    .setName('EndTime')
    .setDescription('EndTime')
    .setType(types.YEAR_MONTH_DAY);
  fields
    .newMetric()
    .setId('Weight')
    .setName('Weight')
    .setDescription('Weight')
    .setType(types.NUMBER);
  return fields.build();
}

/** Functions to create schema for slected config params data type
 *
 * @return {Object} A JavaScript object representing the schema
 */
function createHeartRateField() {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  fields
    .newDimension()
    .setId('StartTime')
    .setName('StartTime')
    .setDescription('Start Time')
    .setType(types.YEAR_MONTH_DAY);
  fields
    .newDimension()
    .setId('EndTime')
    .setName('EndTime')
    .setDescription('EndTime')
    .setType(types.YEAR_MONTH_DAY);
  fields
    .newMetric()
    .setId('HeartRate')
    .setName('HeartRate')
    .setDescription('HeartRate')
    .setType(types.NUMBER);
  return fields.build();
}

/** Functions to create schema for slected config params data type
 *
 * @return {Object} A JavaScript object representing the schema
 */
function createHeartRateDailyField() {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;
  fields
    .newDimension()
    .setId('StartTime')
    .setName('StartTime')
    .setDescription('Start Time')
    .setType(types.YEAR_MONTH_DAY);
  fields
    .newDimension()
    .setId('EndTime')
    .setName('EndTime')
    .setDescription('EndTime')
    .setType(types.YEAR_MONTH_DAY);
  fields
    .newMetric()
    .setId('HeartRateAvg')
    .setName('HeartRateAvg')
    .setDescription('Heart Rate Average')
    .setType(types.NUMBER)
    .setAggregation(aggregations.AVG);
  fields
    .newMetric()
    .setId('HeartRateMax')
    .setName('HeartRateMax')
    .setDescription('Heart Rate Max')
    .setType(types.NUMBER)
    .setAggregation(aggregations.MAX);
  fields
    .newMetric()
    .setId('HeartRateMin')
    .setName('HeartRateMin')
    .setDescription('Heart Rate Min')
    .setType(types.NUMBER)
    .setAggregation(aggregations.MIN);
  return fields.build();
}

/**
 * Returns a configuration object for the connector. DataStudio uses this to set up the connector.
 *
 * @param {Object} request - the configuration request
 * @return {Object} A JavaScript object representing the connector configuration that should be displayed to the user.
 * @see {@link https://developers.google.com/datastudio/connector/reference#getconfig|getConfig reference}
 */
function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();
  config
    .newSelectSingle()
    .setId('googleFitDataType')
    .setName('Google Fit Data')
    .setHelpText('Enter the type of data you want to get from Google Fit.')
    .setAllowOverride(true)
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Activity')
        .setValue('activity')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Steps')
        .setValue('steps')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Weight')
        .setValue('weight')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Heart Rate')
        .setValue('heart_rate')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Heart Rate Daily')
        .setValue('heart_rate_daily')
    );
  config.setDateRangeRequired(true);
  return config.build();
}

/**
 * Used by DataStudio to perform a data request.
 *
 * @param {Request} request - a JavaScript object containing the data request parameters.
 * @param {Response} response - A JavaScript object that contains the schema and data for the given request.
 */
function getData(request) {
  var fit = new GoogleFit();
  var dataType = request.configParams.googleFitDataType;

  var startDate = new Date(0);
  if (request.dateRange.startDate) {
    startDate = new Date(request.dateRange.startDate);
  }
  var endDate = new Date();
  if (request.dateRange.endDate) {
    endDate = new Date(request.dateRange.endDate);
  }
  if (dataType == 'activity') {
    return getDataActivity(request, fit, startDate, endDate);
  } else if (dataType == 'steps') {
    return getDataSteps(request, fit, startDate, endDate);
  } else if (dataType == 'weight') {
    return getDataWeight(request, fit, startDate, endDate);
  } else if (dataType == 'heart_rate') {
    return getDataHeartRate(request, fit, startDate, endDate);
  } else if (dataType == 'heart_rate_daily') {
    return getDataDailyHeartRate(request, fit, startDate, endDate);
  }
}

/** Data functions implement getData for that specific data type. All functions take a request, GoogleFit instance, start date, and end date.
 *
 * @param {Request} request - a JavaScript object containing the data request parameters.
 * @param {!object} instance of GoogleFit()
 * @param {String} Date variable
 * @param {String} Date variable
 * @return {!object} Data for the given request.
 */
function getDataActivity(request, fit, startDate, endDate) {
  var data = [];
  var schemaData = createActivityField();
  // Prepare the schema for the fields requested.
  var dataSchema = request.fields.map(function(field) {
    for (var i = 0; i < schemaData.length; i++) {
      if (schemaData[i].name == field.name) {
        return schemaData[i];
      }
    }
  });
  // TODO: Get the data from the Apps Script Cache service if it exists otherwise get the data from the Google Fit API.
  // See: https://developers.google.com/datastudio/connector/build#fetch_and_return_data_with_getdata
  var activity = fit.getActivity(startDate, endDate);
  for (var i = 0; i < activity.point.length; i++) {
    var values = [];
    var segment = activity.point[i];
    // Provide values in the order defined by the schema.
    dataSchema.forEach(function(field) {
      switch (field.name) {
        case 'ActivityCode':
          values.push(segment.value[0].intVal);
          break;
        case 'ActivityDescription':
          values.push(fit.getActivityDescription(segment.value[0].intVal));
          break;
        case 'StartTime':
          values.push(parseInt(segment.startTimeNanos, 10));
          break;
        case 'EndTime':
          values.push(parseInt(segment.endTimeNanos, 10));
          break;
        case 'ActiveSeconds':
          var nanos = segment.endTimeNanos - segment.startTimeNanos;
          values.push(nanos / 1000000.0 / 1000.0);
          break;
        default:
          values.push('');
      }
    });
    data.push({
      values: values
    });
  }
  return {
    schema: dataSchema,
    rows: data
  };
}

/** Data functions implement getData for that specific data type. All functions take a request, GoogleFit instance, start date, and end date.
 *
 * @param {Request} request - a JavaScript object containing the data request parameters.
 * @param {!object} instance of GoogleFit()
 * @param {String} Date variable
 * @param {String} Date variable
 * @return {!object} Data for the given request.
 */
function getDataSteps(request, fit, startDate, endDate) {
  var data = [];
  var schemaData = createStepsField();
  // Prepare the schema for the fields requested.
  var dataSchema = request.fields.map(function(field) {
    for (var i = 0; i < schemaData.length; i++) {
      if (schemaData[i].name == field.name) {
        return schemaData[i];
      }
    }
  });
  // TODO: Get the data from the Apps Script Cache service if it exists otherwise get the data from the Google Fit API.
  // See: https://developers.google.com/datastudio/connector/build#fetch_and_return_data_with_getdata
  var steps = fit.getSteps(startDate, endDate);
  for (var i = 0; i < steps.point.length; i++) {
    var values = [];
    var segment = steps.point[i];
    // Provide values in the order defined by the schema.
    dataSchema.forEach(function(field) {
      switch (field.name) {
        case 'StartTime':
          values.push(parseInt(segment.startTimeNanos, 10));
          break;
        case 'EndTime':
          values.push(parseInt(segment.endTimeNanos, 10));
          break;
        case 'Steps':
          values.push(segment.value[0].intVal);
          break;
        default:
          values.push('');
      }
    });
    data.push({
      values: values
    });
  }
  return {
    schema: dataSchema,
    rows: data
  };
}

/** Data functions implement getData for that specific data type. All functions take a request, GoogleFit instance, start date, and end date.
 *
 * @param {Request} request - a JavaScript object containing the data request parameters.
 * @param {!object} instance of GoogleFit()
 * @param {String} Date variable
 * @param {String} Date variable
 * @return {!object} Data for the given request.
 */
function getDataWeight(request, fit, startDate, endDate) {
  var data = [];
  var schemaData = createWeightField();
  // Prepare the schema for the fields requested.
  var dataSchema = request.fields.map(function(field) {
    for (var i = 0; i < schemaData.length; i++) {
      if (schemaData[i].name == field.name) {
        return schemaData[i];
      }
    }
  });
  // TODO: Get the data from the Apps Script Cache service if it exists otherwise get the data from the Google Fit API.
  // See: https://developers.google.com/datastudio/connector/build#fetch_and_return_data_with_getdata
  var weight = fit.getWeight(startDate, endDate);
  for (var i = 0; i < weight.point.length; i++) {
    var values = [];
    var segment = weight.point[i];
    // Provide values in the order defined by the schema.
    dataSchema.forEach(function(field) {
      switch (field.name) {
        case 'StartTime':
          values.push(parseInt(segment.startTimeNanos, 10));
          break;
        case 'EndTime':
          values.push(parseInt(segment.endTimeNanos, 10));
          break;
        case 'Weight':
          values.push(segment.value[0].fpVal);
          break;
        default:
          values.push('');
      }
    });
    data.push({
      values: values
    });
  }
  return {
    schema: dataSchema,
    rows: data
  };
}

/** Data functions implement getData for that specific data type. All functions take a request, GoogleFit instance, start date, and end date.
 *
 * @param {Request} request - a JavaScript object containing the data request parameters.
 * @param {!object} instance of GoogleFit()
 * @param {String} Date variable
 * @param {String} Date variable
 * @return {!object} Data for the given request.
 */
function getDataHeartRate(request, fit, startDate, endDate) {
  var data = [];
  var schemaData = createHeartRateField();
  // Prepare the schema for the fields requested.
  var dataSchema = request.fields.map(function(field) {
    for (var i = 0; i < schemaData.length; i++) {
      if (schemaData[i].name == field.name) {
        return schemaData[i];
      }
    }
  });
  // TODO: Get the data from the Apps Script Cache service if it exists otherwise get the data from the Google Fit API.
  // See: https://developers.google.com/datastudio/connector/build#fetch_and_return_data_with_getdata
  var heart_rate = fit.getHeartRate(startDate, endDate);
  for (var i = 0; i < heart_rate.point.length; i++) {
    var values = [];
    var segment = heart_rate.point[i];
    // Provide values in the order defined by the schema.
    dataSchema.forEach(function(field) {
      switch (field.name) {
        case 'StartTime':
          values.push(parseInt(segment.startTimeNanos, 10));
          break;
        case 'EndTime':
          values.push(parseInt(segment.endTimeNanos, 10));
          break;
        case 'HeartRate':
          values.push(segment.value[0].fpVal);
          break;
        default:
          values.push('');
      }
    });
    data.push({
      values: values
    });
  }
  return {
    schema: dataSchema,
    rows: data
  };
}

/** Data functions implement getData for that specific data type. All functions take a request, GoogleFit instance, start date, and end date.
 *
 * @param {Request} request - a JavaScript object containing the data request parameters.
 * @param {!object} instance of GoogleFit()
 * @param {String} Date variable
 * @param {String} Date variable
 * @return {!object} Data for the given request.
 */
function getDataDailyHeartRate(request, fit, startDate, endDate) {
  var data = [];
  var schemaData = createHeartRateDailyField();
  // Prepare the schema for the fields requested.
  var dataSchema = request.fields.map(function(field) {
    for (var i = 0; i < schemaData.length; i++) {
      if (schemaData[i].name == field.name) {
        return schemaData[i];
      }
    }
  });
  // TODO: Get the data from the Apps Script Cache service if it exists otherwise get the data from the Google Fit API.
  // See: https://developers.google.com/datastudio/connector/build#fetch_and_return_data_with_getdata
  var buckets = fit.getHeartRateDaily(startDate, endDate);
  if (!buckets) return {schema: dataSchema, rows: data};
  for (var i = 0; i < buckets.length; i++) {
    var values = [];
    var segment = buckets[i].dataset[0].point[0];

    if (segment) {
      // Provide values in the order defined by the schema.
      dataSchema.forEach(function(field) {
        switch (field.name) {
          case 'StartTime':
            values.push(parseInt(segment.startTimeNanos, 10));
            break;
          case 'EndTime':
            values.push(parseInt(segment.endTimeNanos, 10));
            break;
          case 'HeartRateAvg':
            values.push(segment.value[0].fpVal);
            break;
          case 'HeartRateMax':
            values.push(segment.value[1].fpVal);
            break;
          case 'HeartRateMin':
            values.push(segment.value[2].fpVal);
            break;
          default:
            values.push('');
        }
      });
      data.push({
        values: values
      });
    }
  }
  return {
    schema: dataSchema,
    rows: data
  };
}

/**
 * An authentication type object.
 * @typedef {Object} AuthType
 * @property {string} type - One of "NONE" or "OAUTH2"
 * @see {@link https://developers.google.com/datastudio/connector/reference#authtype|AuthType reference}
 */

/**
 * Used by DataStudio to get the authorization type used by this connector.
 *
 * @return {AuthType} an object representing the auth type.
 */
function getAuthType() {
  var response = {
    type: 'NONE'
  };
  return response;
}

/**
 * Stringifies parameters and responses for a given function and logs them to
 * Stackdriver.
 *
 * @param {string} functionName Function to be logged and executed.
 * @param {Object} parameter Parameter for the `functionName` function.
 * @returns {any} Returns the response of `functionName` function.
 */
function logAndExecute(functionName, parameter) {
  var paramString = JSON.stringify(parameter, null, 2);

  var returnObject = connector[functionName](parameter);

  var returnString = JSON.stringify(returnObject, null, 2);

  return returnObject;
}
