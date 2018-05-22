// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/** Define namespace */
var fTbl = fTbl || {};

/**
 * This is a publicly shared Fusion table. Even if the user does not have access
 * to any Fusion Table on their account, this will still show up as an example
 * to try out the connector.
 * @const
 */
var exampleFusionTable = {
  value: '1g5pO21XASHlIUm3zBq0Od-e_Y-Q4ck_taKigktca',
  label: 'Example: 2017 Fuel Efficiency Data from fueleconomy.gov',
};

/**
 * Return the list of Fusion Tables that the user has direct access to. Also
 * adds `exampleFusionTable` to the list.
 *
 * @returns {Array} List of Fusion tables.
 */
fTbl.listTables = function() {
  var tables = FusionTables.Table.list();
  var tableList = [];
  if (tables.items) {
    for (var i = 0; i < tables.items.length; i++) {
      var table = tables.items[i];
      var tableInfo = {
        value: table.tableId,
        label: table.name,
      };
      tableList.push(tableInfo);
    }
  }
  tableList.push(exampleFusionTable);
  return tableList;
};

/**
 * Maps a column from Fusion Table into a proper schema entry.
 *
 * @param {Object} column A single column from a Fusion table.
 * @returns {Object} The schema for the passed column
 */
fTbl.mapColumn = function(column) {
  var field = {};
  field.name = 'c_' + column.columnId;
  field.label = column.name;
  if (column.type === 'NUMBER') {
    field.dataType = 'NUMBER';
    field.semantics = {};
    field.semantics.conceptType = 'METRIC';
    field.semantics.isReaggregatable = true;
  } else {
    field.dataType = 'STRING';
    field.semantics = {};
    field.semantics.conceptType = 'DIMENSION';
  }
  return field;
};

/**
 * Gets the list of columns in a Fusion Table and returns as the schema.
 *
 * @param {string} tableId ID for the table in Fusion Tables.
 * @returns {array} Schema for the table.
 */
fTbl.getColumns = function(tableId) {
  var columnList = FusionTables.Column.list(tableId).items;
  var schema = columnList.map(fTbl.mapColumn);
  return schema;
};

/**
 * Returns the user configurable options for the connector.
 *
 * @param {Object} request Config request parameters.
 * @returns {Object} Connector configuration to be displayed to the user.
 */
function getConfig(request) {
  var customConfig = [
    {
      type: 'INFO',
      name: 'Unique1',
      text:
        'In addition to all Fusion Tables in your account, the following list will include an example Fusion table with a fuel economy public dataset.',
    },
    {
      type: 'SELECT_SINGLE',
      name: 'tableId',
      displayName: 'Select your Fusion Table',
      options: fTbl.listTables(),
    },
  ];
  return {configParams: customConfig};
}

/**
 * Returns the schema for the given request.
 *
 * @param {Object} request Schema request parameters.
 * @returns {Object} Schema for the given request.
 */
function getSchema(request) {
  fTbl.Schema = fTbl.getColumns(request.configParams.tableId);
  return {schema: fTbl.Schema};
}

/**
 * Returns the tabular data for the given request.
 *
 * @param {Object} request Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */
function getData(request) {
  // Add a smaller limit if sampleExtration is `true`
  var limitSuffix =
    request.scriptParams && request.scriptParams.sampleExtraction
      ? ' LIMIT 50'
      : '';
  fTbl.Schema = fTbl.getColumns(request.configParams.tableId);
  var dataSchema = [];
  var fieldOriginalNames = [];
  request.fields.forEach(function(field) {
    for (var i = 0; i < fTbl.Schema.length; i++) {
      if (fTbl.Schema[i].name == field.name) {
        dataSchema.push(fTbl.Schema[i]);
        fieldOriginalNames.push(fTbl.Schema[i].label);
        break;
      }
    }
  });

  var sql =
    "SELECT '" +
    fieldOriginalNames.join("', '") +
    "' FROM " +
    request.configParams.tableId +
    limitSuffix;
  var result = FusionTables.Query.sqlGet(sql);

  return {
    schema: dataSchema,
    rows: result.rows.map(function(row) {
      return {values: row};
    }),
  };
}

/**
 * Returns the authentication method required by the connector to authorize the
 * third-party service.
 *
 * @returns {Object} `AuthType` used by the connector.
 */
function getAuthType() {
  return {type: 'NONE'};
}
