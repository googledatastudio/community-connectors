//  Copyright notice
//
//  (c) 2019 Gabriël Ramaker <gabriel@lingewoud.nl>, Lingewoud
//
//  All rights reserved
//
//  This script is free software; you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation; either version 3 of the License, or
//  (at your option) any later version.
//
//  The GNU General Public License can be found at
//  http://www.gnu.org/copyleft/gpl.html.
//
//  This script is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  This copyright notice MUST APPEAR in all copies of the script!

/**
 * Throws and logs script exceptions.
 *
 * @param {String} message The exception message
 */
function sendUserError( message ) {
  var cc = DataStudioApp.createCommunityConnector();
      cc.newUserError()
        .setText( message )
        .throwException();

  console.log(message);
}

/**
 * function  `getAuthType()`
 *
 * @returns {Object} `AuthType` used by the connector.
 */
function getAuthType() {
  return { type: 'NONE' };
}

/**
 * function  `isAdminUser()`
 *
 * @returns {Boolean} Currently just returns false. Should return true if the current authenticated user at the time
 *                    of function execution is an admin user of the connector.
 */
function isAdminUser() {
  return false;
}

/**
 * Returns the user configurable options for the connector.
 *
 * Required function for Community Connector.
 *
 * @param   {Object} request  Config request parameters.
 * @returns {Object}          Connector configuration to be displayed to the user.
 */
function getConfig( request ) {
  var cc      = DataStudioApp.createCommunityConnector();
  var config  = cc.getConfig();

  config.newInfo()
    .setId( 'instructions' )
    .setText( 'Fill out the form to connect to a JSON data source.' );

  config.newTextInput()
    .setId( 'url' )
    .setName( 'Enter the URL of a JSON data source' )
    .setHelpText( 'e.g. https://my-url.org/json')
    .setPlaceholder( 'https://my-url.org/json' );

  config.newCheckbox()
    .setId( 'cache' )
    .setName( 'Cache response' )
    .setHelpText( 'Usefull with big datasets. Response is cached for 10 minutes')
    .setAllowOverride(true);

  config.setDateRangeRequired( false );

  return config.build();
}

/**
 * Gets UrlFetch response and parses JSON
 *
 * @param   {string} url  The URL to get the data from
 * @returns {Object}      The response object
 */
function fetchJSON( url ) {
  try {
    var response = UrlFetchApp.fetch( url );
  } catch ( e ) {
    sendUserError( '"' + url + '" returned an error:' + e );
  }

  try {
    var content   = JSON.parse( response )
  } catch( e ) {
    sendUserError( 'Invalid JSON format. ' + e );
  }

  return content;
}

/**
 * Gets cached response. If the response has not been cached, make
 * the fetchJSON call, then cache and return the response.
 *
 * @param   {string} url  The URL to get the data from
 * @returns {Object}      The response object
 */
function getCachedData( url ) {
  var cacheExpTime    = 600;
  var cache           = CacheService.getUserCache();
  var cacheKey        = url.replace(/[^a-zA-Z0-9]+/g, '');
  var cacheKeyString  = cache.get( cacheKey + '.keys' );
  var cacheKeys       = ( cacheKeyString !== null ) ? cacheKeyString.split( ',' ) : [];
  var cacheData       = {};
  var content         = [];


  if( cacheKeyString !== null && cacheKeys.length > 0 ) {
    cacheData = cache.getAll( cacheKeys );

    for ( var key  in cacheKeys ) {
      if( cacheData[ cacheKeys[ key ] ] != undefined ) content.push( JSON.parse( cacheData[ cacheKeys[ key ] ] ) );
    }
  } else {
    content    = fetchJSON( url );

    for ( var key  in content ) {
      cacheData[ cacheKey + '.' + key ] = JSON.stringify( content[ key ] );
    }

    cache.putAll( cacheData );
    cache.put( cacheKey + '.keys', Object.keys( cacheData ), cacheExpTime );
  }

  return content;
}

/**
 * Fetches data. Either by calling getCachedData or fetchJSON, depending on the cache configuration parameter.
 *
 * @param   {String}  url   The URL to get the data from
 * @param   {Boolean} cache Parameter to determine whether the request should be cached
 * @returns {Object}        The response object
 */
function fetchData( url, cache ) {
  if ( !url || !url.match( /^https?:\/\/.+$/g ) ) sendUserError( '"' + url + '" is not a valid url.' );

  var content  = ( cache ) ? getCachedData( url ) : fetchJSON( url );

  if ( !content ) sendUserError( '"' + url + '" returned no content.' );

  return content;
}

/**
 * Parses first line of content to determine the data schema
 *
 * @param   {Object}  request getSchema/getData request parameter.
 * @param   {Object}  content The content object
 * @return  {Object}           An object with the connector configuration
 */

function getFields( request, content ) {
  var cc            = DataStudioApp.createCommunityConnector();
  var fields        = cc.getFields();
  var types         = cc.FieldType;
  var aggregations  = cc.AggregationType;
  
  if( !Array.isArray( content ) ) content = [ content ];
  
  if( typeof content[ 0 ] !== "object" || content[ 0 ] === null ) sendUserError( 'Invalid JSON format' );

  Object.keys( content[ 0 ] ).forEach( function( key ) {
      var isNumeric   = !isNaN( parseFloat( content[ 0 ][ key ] ) ) && isFinite( content[ 0 ][ key ] );
      var field       = ( isNumeric ) ? fields.newMetric() : fields.newDimension();

      field.setType( ( isNumeric ) ? types.NUMBER : types.TEXT );
      field.setId( key.replace(/\s/g, '_' ).toLowerCase() );
      field.setName( key );
  } );

  return fields;
}

/**
 * Returns the schema for the given request.
 *
 * @param {Object} request Schema request parameters.
 * @returns {Object} Schema for the given request.
 */
function getSchema( request ) {
  var content   = fetchData( request.configParams.url, request.configParams.cache );
  var fields    = getFields( request, content ).build();
  return { schema: fields };
}

/**
 * Validates the row values. Only numbers and strings are allowed
 *
 * @param   {Mixed} val   The value to validate
 * @returns {Mixed}       Either a string or number
 */
function validateValue( val ) {
  switch ( typeof val ) {
    case "string":
    case "number":
      return val;
    case "object":
      return JSON.stringify( val );
  }
  return "";
}

/**
 * Returns an object containing only the requested columns
 *
 * @param   {Object} content          The content object
 * @param   {Object} requestedFields  Fields requested in the getData request.
 * @returns {Object}                  An object only containing the requested columns.
 */
function getColumns(  content, requestedFields ) {
  if( !Array.isArray( content ) ) content = [ content ];
  
  return content.map(function( row ) {
    var rowValues = [];

    requestedFields.asArray().forEach( function ( field ) {
      rowValues.push( validateValue( row[ field.getId() ] ) );
    });


    return { values: rowValues };
  });
}

/**
 * Returns the tabular data for the given request.
 *
 * @param   {Object} request  Data request parameters.
 * @returns {Object}          Contains the schema and data for the given request.
 */
function getData( request ) {
  var content           = fetchData( request.configParams.url, request.configParams.cache  );
  var fields            = getFields( request, content );
  var requestedFieldIds = request.fields.map( function( field ) { return field.name; } );
  var requestedFields   = fields.forIds( requestedFieldIds );

  return {
    schema: requestedFields.build(),
    rows: getColumns(  content, requestedFields)
  };
}
