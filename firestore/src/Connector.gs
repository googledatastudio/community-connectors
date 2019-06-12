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

/** 
 * Contains core functionality for Data Studio connector. 
 *
 * @constructor
 */
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
  this.OPERATOR_TYPES = [
    'LESS_THAN',
    'LESS_THAN_OR_EQUAL',
    'GREATER_THAN',
    'GREATER_THAN_OR_EQUAL',
	'EQUAL',
	'ARRAY_CONTAINS'
  ];
  
  /** @const */
  this.cloud = new GoogleCloud();
  
  /** @const */
  this.enableLogging = enableLogging;
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
  if (this.enableLogging) {
    const paramString = JSON.stringify(parameter, null, 2);
    console.log([functionName, 'request', paramString]);
  }

  const returnObject = this[functionName](parameter);

  if (this.enableLogging) {
    const returnString = JSON.stringify(returnObject, null, 2);
    console.log([functionName, 'response', returnString]);
  }

  return returnObject;
};


/** 
 * Predefined Data Studio function for specifying connector configuration.
 *
 * @param {Object} request Config request parameters.
 * @return {Object} Connector configuration to be displayed to the user.
 */
Connector.prototype.getConfig = function(request) {
  const projects = this.cloud.listCloudProjects();
  const options = projects.map(function(project) {
    return {
      label: project.name + ' (' + project.projectId + ')',
      value: project.projectId
    };
  });
  const optionsSorted = options.sort(function(x, y) {
    const xId = x.label.toLowerCase();
    const yId = y.label.toLowerCase();
    return xId === yId ? 0 : (xId < yId ? -1 : 1);
  });
    
  return {
    configParams: [
      {
        name: 'project',
        type: 'SELECT_SINGLE',
        displayName: 'Firebase Project',
        helpText: 'Select a Google Cloud/Firebase project that uses Firestore.',
        options: options
      },
      {
        name: 'useCollectionGroups',
        type: 'SELECT_SINGLE',
        displayName: 'Collection or Collection Groups',
        helpText: 'Specifies whether only a single collection should be used or a whole collection group.',
        options: [
          {label: 'Single Collection', value: 'no'},
          {label: 'Collection Group', value: 'yes'}
        ]        
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
               NUMBER, BOOLEAN, or TIMESTAMP. Note: "name" is a reserved field.'
      },
      {
        name: 'schema',
        type: 'TEXTAREA',
        displayName: 'Firestore "Schema"',
        placeholder: 'field1:STRING\nfield2:STRING\nfield3:NUMBER\nfield4:BOOLEAN'
      },
      {
        type: 'INFO',
        text: 'If you only need to use a part of documents in Data Studio you can provider filters,\
               to not fetch these documents from Firestore. Use the following format: \
			   <field_name1>;<operator1>;<value1>, where operator is one of EQUAL, LESS_THAN, ARRAY_CONTAINS, ... \
			   (complete list: https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery#Operator_1). \
			   And for value provide the value as a Value JSON \
			   (https://firebase.google.com/docs/firestore/reference/rest/v1beta1/Value), \
			   for example: {"stringValue":"video"}. \ Complete example for one filter: type;EQUAL;{"stringValue":"video"}'
      },
      {
        name: 'filters',
        type: 'TEXTAREA',
        displayName: 'Firestore "Filters"',
        placeholder: 'type;EQUAL;{"stringValue":"video"}\ntimestamp;GREATER_THAN;{"timestampValue":"2014-10-02T15:01:23.045123456Z"}'
      },
      {
        name: 'numResults',
        type: 'SELECT_SINGLE',
        displayName: 'Max Documents',
        helpText: 'Specifies the number of documents to read on each request. Note that each page \
                   load will fetch *all* the documents, so setting this too high may be expensive. \
                   Consider pre-processing in Firestore if there are many documents. Defaults to 1000.',
        options: [
          {label: '100', value: '100'},
          {label: '1000', value: '1000'},
          {label: '10000', value: '10000'},
          {label: '100000', value: '100000'},
        ]        
      }
    ]
  };
}


/** 
 * Predefined Data Studio function for generating schema from user input. 
 * 
 * @param {Object} request Schema request parameters.
 * @return {Object} Schema for the given request.
 */
Connector.prototype.getSchema = function(request) {
  // Convert the user input to a Data Studio schema
  const configCsv = request.configParams.schema;
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
  const project = request.configParams.project;
  if (!project) {
    throw 'Missing project ID'; 
  }
  
  const collection = request.configParams.collection;
  if (!collection) {
    throw 'Missing collection name'; 
  }
  
  var numResultsValue = request.configParams.numResults;
  if (!numResultsValue) {
     numResultsValue = '1000';
  }
  const numResults = parseInt(numResultsValue, 10);
  
  var useCollectionGroupsValue = request.configParams.useCollectionGroups;
  if (!useCollectionGroupsValue) {
    useCollectionGroupsValue = 'no';
  }
  const useCollectionGroups = useCollectionGroupsValue === 'yes';
  const filters = this.parseFiltersCsv(request.configParams.filters);
  
  // Prepare the schema for the fields requested.
  const requestedSchema = this.getFilteredSchema(request);
  
  // Fetch and filter the requested data from firestore
  const firestore = new Firestore();
  const data = firestore.getData(
    project, collection, requestedSchema, numResults, useCollectionGroups, filters);
  
  return {schema: requestedSchema, rows: data};
}


/**
 * Filters the base schema by the requested fields.
 *
 * @param {Object} request Data request parameters.
 * @return {Object} The schema filtered by the current request parameters.
 */
Connector.prototype.getFilteredSchema = function(request) {
  const schema = this.getSchema(request).schema;
  var requestedSchema = [];
  request.fields.forEach(function(field) {
    for (var i=0; i < schema.length; i++) {
      if (schema[i].name === field.name) {
        requestedSchema.push(schema[i]);
        break;
      }
    }
  });
  return requestedSchema;
}


/**
 * Converts the user-specified schema into a Data Studio schema.
 *
 * @param {string} configCsv The user-specified database schema.
 * @return {Object} The user-specified portion of the connector schema.
 */
Connector.prototype.parseSchemaCsv = function(configCsv) {
  const parsed = Utilities.parseCsv(configCsv, ':')
  
  if (parsed.length === 0) {
    throw 'Invalid schema: no schema supplied'; 
  }

  var schema = [];
  const instance = this;
  parsed.forEach(function(row) {
    if (row.length != 2) {
      throw 'Invalid schema: row should have format "<name>:<type>", instead got "' + row + '"';
    }
    const name = row[0].trim();
    const type = row[1].trim().toUpperCase();
    
    if (name.length === 0) {
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
    if (type === 'TIMESTAMP') {
      field.dataType = 'STRING';
      field.semantics = instance.TIMESTAMP_SEMANTICS
    }
    
    schema.push(field);
  });
  
  return schema;
}

/**
 * Converts the user-specified filters into Firestore filters.
 *
 * @param {string} filtersCsv The user-specified database filters.
 * @return {Object} The user-specified portion of the Firestore filters.
 */
Connector.prototype.parseFiltersCsv = function(filtersCsv) {
  const parsed = Utilities.parseCsv(filtersCsv, ';');
  var filters = [];
  const instance = this;
  parsed.forEach(function(row) {
    if (row.length != 3) {
      throw 'Invalid filters: row should have format "<field>;<operator>;<value>", instead got "' + row + '"';
    }
    const fieldPath = row[0].trim();
    const operator = row[1].trim().toUpperCase();
    const valueString = row[2].trim();
    
    if (fieldPath.length === 0) {
      throw 'Invalid filter: empty field in row "' + row + '"'; 
    }
    
    if (instance.OPERATOR_TYPES.indexOf(operator) < 0) {
      throw 'Invalid filter: operator must be one of: ' + instance.OPERATOR_TYPES.toString(); 
    }

    var value;
    // Try parsing value to JSON
    try {
      value = JSON.parse(valueString);
    } catch(e) {
    throw 'Invalid filter: value must be a valid JSON in this form: \
      https://firebase.google.com/docs/firestore/reference/rest/v1beta1/Value';
    }
    
    var filter = {
      fieldFilter: {
        field: {
          fieldPath: fieldPath
        },
        op: operator,
        value: value
      }
    };
    
    filters.push(filter);
  });
  if (filters.length == 0) {
    return undefined;
  } else {
    return {
      compositeFilter: {
        op: "AND",
        filters: filters
      }
    };
  }
}

/** Predefined Data Studio function for defining auth. */
Connector.prototype.getAuthType = function() {
  return {
    "type": "USER_PASS"
  };
}

/** Predefined Data Studio function for resetting auth creds. */
Connector.prototype.resetAuth = function() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('dscc.email');
  userProperties.deleteProperty('dscc.key');
}

/** Predefined Data Studio function for validating auth creds. */
Connector.prototype.isAuthValid = function() {
  var userProperties = PropertiesService.getUserProperties();
  var userName = userProperties.getProperty('dscc.email');
  var password = userProperties.getProperty('dscc.key');
  return (userName !== null && userName !== '') && (password !== null && password !== '');
}

/** Predefined Data Studio function for setting auth creds. */
Connector.prototype.setCredentials = function(request) {
  var creds = request.userPass;
  var username = creds.username;
  var password = creds.password.replace(/\\n/g, '\n');

  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('dscc.email', username);
  userProperties.setProperty('dscc.key', password);
  return {
    errorCode: "NONE"
  };
}
