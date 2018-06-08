/*
Copyright 2018 Google LLC

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

/** Contains core functionality for Data Studio connector. */
function Connector(enableLogging) {

  /** @const */
  this.FIELD_TYPES = [
    'STRING',
    'NUMBER',
    'BOOLEAN',
    'TIMESTAMP'
  ];

  /** @const */
  this.TIMESTAMP_SEMANTICS = {
    conceptType: 'DIMENSION',
    semanticGroup: 'DATE_AND_TIME',
    semanticType: 'YEAR_MONTH_DAY_HOUR'
  };
  
  /** @const */
  this.firestore = new Firestore();
  
  /** @const */
  this.cloud = new GoogleCloud();
}


/**
 * Stringifies parameters and responses for a given function and logs them to
 * Stackdriver.
 *
 * @param {string} functionName Function to be logged and executed.
 * @param {Object} parameter Parameter for the `functionName` function.
 * @returns {any} Returns the response of `functionName` function.
 */
Connector.prototype.logAndExecute = function(functionName, parameter) {
  var paramString = JSON.stringify(parameter, null, 2);
  console.log([functionName, 'request', paramString]);

  var returnObject = this[functionName](parameter);

  var returnString = JSON.stringify(returnObject, null, 2);
  console.log([functionName, 'response', returnString]);

  return returnObject;
};


/** 
 * Predefined Data Studio function for specifying connector configuration.
 *
 * @param {Object} request Config request parameters.
 * @return {Object} Connector configuration to be displayed to the user.
 */
Connector.prototype.getConfig = function(request) {
  var projects = this.cloud.listCloudProjects();
  var options = [];
  projects.forEach(function(project) {
    options.push({label: project.projectId, value: project.projectId});
  });
  var optionsSorted = options.sort(function(x, y) {
    var xId = x.label;
    var yId = y.label;
    return xId == yId ? 0 : (xId < yId ? -1 : 1);
  });
    
  var config = {
    configParams: [
      {
        name: 'project',
        type: 'SELECT_SINGLE',
        displayName: 'Firebase Project',
        helpText: 'Select a Google Cloud/Firebase project that uses Firestore.',
        options: options
      },
      {
        name: 'collection',
        type: 'TEXTINPUT',
        displayName: 'Collection',
        helpText: 'Select the Firestore collection to use for this Data Source. To use multiple \
                   collections, create additional Data Sources.'
      },
      {
        type: 'INFO',
        text: 'Firestore is a schema-less database. In order to use Firestore with Data Studio, \
               you must supply a set of fields in the collection you want to use. \
               Use the following format: <field_name1>:<type1>, where type is one of STRING, \
               NUMBER, BOOLEAN, or TIMESTAMP'
      },
      {
        name: 'schema',
        type: 'TEXTAREA',
        displayName: 'Firestore "Schema"',
        placeholder: 'field1:STRING\nfield2:STRING\nfield3:NUMBER\nfield4:BOOLEAN'
      },
      {
        name: 'numResults',
        type: 'SELECT_SINGLE',
        displayName: 'Max Documents',
        helpText: 'Specifies the number of documents to read on each request. Note that each page \
                   load will fetch *all* the documents, so setting this too high may be expensive. \
                   Consider pre-processing in Firestore if there are many documents.',
        options: [
          {label: '100', value: '100'},
          {label: '1000', value: '1000'},
          {label: '10000', value: '10000'},
          {label: '100000', value: '100000'},
        ]        
      }
    ]
  };
  return config;
}


/** 
 * Predefined Data Studio function for generating schema from user input. 
 * 
 * @param {Object} request Schema request parameters.
 * @return {Object} Schema for the given request.
 */
Connector.prototype.getSchema = function(request) {
  // Convert the user input to a Data Studio schema
  var configCsv = request.configParams.schema;
  var schema = this.parseSchemaCsv(configCsv);
  
  // Add predefined fields
  schema.push({name: 'name', label: 'id', dataType: 'STRING'});
  schema.push({name: 'createTime', label: 'created', dataType: 'STRING', semantics: this.TIMESTAMP_SEMANTICS});
  schema.push({name: 'updateTime', label: 'updated', dataType: 'STRING', semantics: this.TIMESTAMP_SEMANTICS});
  
  return {schema: schema};
}


/** 
 * Predefined Data Studio function for fetching user-defined data. 
 *
 * @param {Object} request Data request parameters.
 * @return {Object} Contains the schema and data for the given request.
 */
Connector.prototype.getData = function(request) {
  var project = request.configParams.project;
  if (!project) {
    throw 'Missing project ID'; 
  }
  
  var collection = request.configParams.collection;
  if (!collection) {
    throw 'Missing collection name'; 
  }
  
  var numResults = parseInt(request.configParams.numResults);
  
  // Prepare the schema for the fields requested.
  var requestedSchema = this.getFilteredSchema(request);
  
  // Fetch and filter the requested data from firestore
  var data = this.firestore.getData(project, collection, requestedSchema, numResults);
  
  return {schema: requestedSchema, rows: data};
}


/**
 * Filters the base schema by the requested fields.
 *
 * @param {Object} request Data request parameters.
 * @return {Object} The schema filtered by the current request parameters.
 */
Connector.prototype.getFilteredSchema = function(request) {
  var schema = this.getSchema(request).schema;
  var requestedSchema = [];
  request.fields.forEach(function(field) {
    for (var i=0; i < schema.length; i++) {
      if (schema[i].name == field.name) {
        requestedSchema.push(schema[i]);
        break;
      }
    }
  });
  return requestedSchema;
}


/**
 *
 *
 * @param {string} configCsv The user-specified database schema.
 * @return {Object} The user-specified portion of the connector schema.
 */
Connector.prototype.parseSchemaCsv = function(configCsv) {
  var parsed = Utilities.parseCsv(configCsv, ':')
  
  if (parsed.length == 0) {
    throw 'Invalid schema: no schema supplied'; 
  }

  var schema = [];
  var instance = this;
  parsed.forEach(function(row) {
    if (row.length != 2) {
      throw 'Invalid schema: row should have format "<name>:<type>", instead got "' + row + '"';
    }
    var name = row[0].trim();
    var type = row[1].trim().toUpperCase();
    
    if (name.length == 0) {
      throw 'Invalid schema: empty name in row "' + row + '"'; 
    }
    
    if (instance.FIELD_TYPES.indexOf(type) < 0) {
      throw 'Invalid schema: field type must be one of: ' + instance.FIELD_TYPES.toString(); 
    }
    
    var field = {
      name: name,
      label: name,
      dataType: type
    };
    if (type == 'TIMESTAMP') {
      field.dataType = 'STRING';
      field.semantics = instance.TIMESTAMP_SEMANTICS
    }
    
    schema.push(field);
  });
  
  return schema;
}


/** Predefined Data Studio function for defining auth. */
Connector.prototype.getAuthType = function() {
  var response = {
    "type": "NONE"
  };
  return response;
}
