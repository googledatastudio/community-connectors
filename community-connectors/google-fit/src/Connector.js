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

var connector = connector || {};
connector.config = connector.config || {};

var scriptProps = PropertiesService.getScriptProperties();

/** @const */
connector.logEnabled = true;

// The DataStudio schema for Google Fit Activity data
connector.SCHEMA = {
  activity: [
    {
      name: 'ActivityCode',
      label: 'Activity Code',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'ActivityDescription',
      label: 'Activity Description',
      dataType: 'STRING',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'StartTime',
      label: 'Start Time',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'EndTime',
      label: 'End Time',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'ActiveSeconds',
      label: 'Active Time (s)',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
      },
    },
  ],
  steps: [
    {
      name: 'StartTime',
      label: 'Start Time',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'EndTime',
      label: 'End Time',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'Steps',
      label: 'Steps',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
      },
    },
  ],
  weight: [
    {
      name: 'StartTime',
      label: 'Start Time',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'EndTime',
      label: 'End Time',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'DIMENSION',
      },
    },
    {
      name: 'Weight',
      label: 'Weight',
      dataType: 'NUMBER',
      semantics: {
        conceptType: 'METRIC',
      },
    },
  ],
};

/**
 * Sample data for use when DataStudio does automatic semantic type detection.
 * @see {@link https://developers.google.com/datastudio/connector/semantics#semantic-type-detection|Automatic semantic type detection}
 */
connector.SAMPLE_DATA = {
  activity: {
    point: [
      {
        // 1200 seconds
        startTimeNanos: 1509207120000000000,
        endTimeNanos: 1509208320000000000,
        // WALKING
        value: [{intVal: 7}],
      },
      {
        // 2100 seconds
        startTimeNanos: 1509204420000000000,
        endTimeNanos: 1509206520000000000,
        // RUNNING
        value: [{intVal: 8}],
      },
      {
        // 64560 seconds
        startTimeNanos: 1509393360000000000,
        endTimeNanos: 1509457920000000000,
        // MOUNTAIN BIKING
        value: [{intVal: 15}],
      },
    ],
  },
  steps: {
    point: [
      {
        // 1200 seconds
        startTimeNanos: 1509207120000000000,
        endTimeNanos: 1509208320000000000,
        value: [{intVal: 150}],
      },
      {
        // 2100 seconds
        startTimeNanos: 1509204420000000000,
        endTimeNanos: 1509206520000000000,
        value: [{intVal: 99}],
      },
      {
        // 64560 seconds
        startTimeNanos: 1509393360000000000,
        endTimeNanos: 1509457920000000000,
        value: [{intVal: 230}],
      },
    ],
  },
  weight: {
    point: [
      {
        startTimeNanos: 1509207120000000000,
        endTimeNanos: 1509207120000000000,
        value: [{fpVal: 85.2}],
      },
      {
        startTimeNanos: 1509204420000000000,
        endTimeNanos: 1509204420000000000,
        value: [{fpVal: 88.8}],
      },
      {
        startTimeNanos: 1509393360000000000,
        endTimeNanos: 1509393360000000000,
        value: [{fpVal: 87.3}],
      },
    ],
  },
};

/**
 * Returns a configuration object for the connector. DataStudio uses this to set up the connector.
 *
 * @param {Object} request - the configuration request
 * @return {Object} A JavaScript object representing the connector configuration that should be displayed to the user.
 * @see {@link https://developers.google.com/datastudio/connector/reference#getconfig|getConfig reference}
 */
connector.getConfig = function(request) {
  var config = {
    configParams: [
      {
        name: 'googleFitDataType',
        type: 'SELECT_SINGLE',
        displayName: 'Google Fit Data',
        helpText: 'Enter the type of data you want to get from Google Fit.',
        options: [
          {
            label: 'Activity',
            value: 'activity',
          },
          {
            label: 'Steps',
            value: 'steps',
          },
          {
            label: 'Weight',
            value: 'weight',
          },
        ],
      },
    ],
    dateRangeRequired: true,
  };
  return config;
};

/**
 * Returns a configuration object for the connector. DataStudio uses this to set up the connector.
 *
 * @param {Object} request - the schema request
 * @return {Object} A JavaScript object representing the schema for the given request.
 */
connector.getSchema = function(request) {
  return {
    schema:
      connector.SCHEMA[request.configParams.googleFitDataType || 'activity'],
  };
};

/**
 * A DataStudio data field
 * @typedef {Object} Field
 * @property {string} name - The name of the field. This will be used as a unique identifier. Only alphanumeric characters and underscores are allowed.
 * @property {string} label - The display name for the field. This is used as a "friendly" name in the UI.
 * @property {string} dataType - The data type for the field.
 * @property {Object} semantics - Additional properties to provide semantic information about the field. If omitted then the host application may attempt to automatically detect semantics for the field.
 * @property {string} semantics.conceptType - Indicates whether the field is a dimension or metric.
 * @property {boolean} semantics.isReaggregatable - true indicates that Aggregation can be applied to this field; In Data Studio Aggregation will be set to SUM by default and the user will be allowed to change the Aggregation.  false indicates Aggregation should not be applied to this field; In Data Studio Aggregation will be set to Auto by default and the user will not be able to change the Aggregation. Default value is true. Note: This property only affects metric fields.
 * @see {@link https://developers.google.com/datastudio/connector/reference#field|Field reference}
 *

 /**
 * A DataStudio data request object
 * @typedef {Object} Request
 * @property {Object} configParams - A JavaScript object containing the user provided values for the config parameters defined by the connector.
 * @property {Object} scriptParams - A JavaScript object containing information relevant to connector execution.
 * @property {boolean} scriptParams.sampleExtraction - If value is true, the getData request is for the purpose of automatic semantic type detection. Value is omitted or false otherwise.
 * @property {Object} dateRange - By default, the date range provided will be last 28 days excluding today. If a user applies a date range filter for a report then the date range provided will reflect the user selection. When sampleExtraction is set to true, the date two days earlier than today is given as both the start and end date.
 * @property {string} dateRange.startDate - Applies only if dateRangeRequired is set to true. The start date for filtering the data. It will be in YYYY-MM-DD format.
 * @property {string} dateRange.endDate - Applies only if dateRangeRequired is set to true. The end date for filtering the data. It will be in YYYY-MM-DD format.
 * @property {Field[]} fields - The list of fields for which data has been requested. This is typically a subset of the schema. The only Field data guaranteed to be provided for the request will be Field.name.
 * @see {@link https://developers.google.com/datastudio/connector/reference#getdata|Request reference}
 */

/**
 * A Datastudio data response object
 * @typedef {Object} Response
 * @property {Field[]} schema - The schema for the requested field(s). The Field.name and Field.dataType are required. The order of the Field objects determines the expected order of values for each row.
 * @property {Object[]} rows - The rows of values for the requested field(s).
 * @property {string[]} rows.values	- The values for the requested field(s). The order of values must correspond to order of the Fields defined in schema.
 * @property {boolean} cachedData	- If true, this means the data response was from a cache. If false or omitted, this means the data response was fetched directly from the source. Note that parameter is not currently used, you should set this value as it will become effective in an upcoming release. For now, setting this value will have no effect.
 */

/**
 * Used by DataStudio to perform a data request.
 *
 * @param {Request} request - a JavaScript object containing the data request parameters.
 * @param {Response} response - A JavaScript object that contains the schema and data for the given request.
 */
connector.getData = function(request) {
  var fit = new GoogleFit();

  var dataType = request.configParams.googleFitDataType || 'activity';

  var startDate = new Date(0);
  if (request.dateRange.startDate) {
    startDate = new Date(request.dateRange.startDate);
  }
  var endDate = new Date();
  if (request.dateRange.endDate) {
    endDate = new Date(request.dateRange.endDate);
  }

  var dataFunc = connector.dataFuncs[dataType];
  return dataFunc(request, fit, startDate, endDate);
};

// Data functions implement getData for that specific data type. All functions take a request, GoogleFit instance, start date, and end date.
connector.dataFuncs = {};
connector.dataFuncs.activity = function(request, fit, startDate, endDate) {
  // Prepare the schema for the fields requested.
  var dataSchema = request.fields.map(function(field) {
    for (var i = 0; i < connector.SCHEMA.activity.length; i++) {
      if (connector.SCHEMA.activity[i].name == field.name) {
        return connector.SCHEMA.activity[i];
      }
    }
  });

  if (request.scriptParams && request.scriptParams.sampleExtraction) {
    var activity = connector.SAMPLE_DATA.activity;
  } else {
    // TODO: Get the data from the Apps Script Cache service if it exists otherwise get the data from the Google Fit API.
    // See: https://developers.google.com/datastudio/connector/build#fetch_and_return_data_with_getdata
    var activity = fit.getActivity(startDate, endDate);
  }

  var data = [];
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
      values: values,
    });
  }

  return {
    schema: dataSchema,
    rows: data,
  };
};

connector.dataFuncs.steps = function(request, fit, startDate, endDate) {
  // Prepare the schema for the fields requested.
  var dataSchema = request.fields.map(function(field) {
    for (var i = 0; i < connector.SCHEMA.steps.length; i++) {
      if (connector.SCHEMA.steps[i].name == field.name) {
        return connector.SCHEMA.steps[i];
      }
    }
  });

  if (request.scriptParams && request.scriptParams.sampleExtraction) {
    var steps = connector.SAMPLE_DATA.steps;
  } else {
    // TODO: Get the data from the Apps Script Cache service if it exists otherwise get the data from the Google Fit API.
    // See: https://developers.google.com/datastudio/connector/build#fetch_and_return_data_with_getdata
    var steps = fit.getSteps(startDate, endDate);
  }

  var data = [];
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
      values: values,
    });
  }

  return {
    schema: dataSchema,
    rows: data,
  };
};

connector.dataFuncs.weight = function(request, fit, startDate, endDate) {
  // Prepare the schema for the fields requested.
  var dataSchema = request.fields.map(function(field) {
    for (var i = 0; i < connector.SCHEMA.weight.length; i++) {
      if (connector.SCHEMA.weight[i].name == field.name) {
        return connector.SCHEMA.weight[i];
      }
    }
  });

  if (request.scriptParams && request.scriptParams.sampleExtraction) {
    var weight = connector.SAMPLE_DATA.weight;
  } else {
    // TODO: Get the data from the Apps Script Cache service if it exists otherwise get the data from the Google Fit API.
    // See: https://developers.google.com/datastudio/connector/build#fetch_and_return_data_with_getdata
    var weight = fit.getWeight(startDate, endDate);
  }

  var data = [];
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
      values: values,
    });
  }

  return {
    schema: dataSchema,
    rows: data,
  };
};

/**
 * Used by DataStudio to get the authorization type used by this connector.
 *
 * @return {AuthType} an object representing the auth type.
 */
connector.getAuthType = function() {
  var response = {
    type: 'NONE',
  };
  return response;
};
/**
 * Stringifies parameters and responses for a given function and logs them to
 * Stackdriver.
 *
 * @param {string} functionName Function to be logged and executed.
 * @param {Object} parameter Parameter for the `functionName` function.
 * @returns {any} Returns the response of `functionName` function.
 */
connector.logAndExecute = function(functionName, parameter) {
  if (connector.logEnabled) {
    var paramString = JSON.stringify(parameter, null, 2);
    console.log([functionName, 'request', paramString]);
  }

  var returnObject = connector[functionName](parameter);

  if (connector.logEnabled) {
    var returnString = JSON.stringify(returnObject, null, 2);
    console.log([functionName, 'response', returnString]);
  }

  return returnObject;
};
