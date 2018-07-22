/* istanbul ignore next */
if (typeof(require) !== 'undefined') {
  var DataBuilder = require('./DataBuilder.js')['default'];
  var Oauth2Builder = require('./Oauth2Builder.js')['default'];
  var OauthService = require('./OauthService.js')['default'];
  var SpotifyClient = require('./SpotifyClient.js')['default'];
}

/**
 * Constructor for Connector - a wrapper for GDS connector methods

 * @param {object} services - an object containing required Google services
 *
 * @return {object} a Connector object.
 */
function Connector(services) {
  this.services = services;

  return this;
}

/**
 * @return {object} Object containing field definitions
 */
Connector.prototype.getSchema = function() {
  return {
    schema: [
      {
        name: 'track_name',
        label: 'Track Name',
        dataType: 'STRING',
        semantics: {
          conceptType: 'DIMENSION'
        }
      },
      {
        name: 'artist',
        label: 'Artist',
        dataType: 'STRING',
        semantics: {
          conceptType: 'DIMENSION'
        }
      },
      {
        name: 'played_at_hour',
        label: 'Played at (date + hour)',
        dataType: 'STRING',
        semantics: {
          conceptType: 'DIMENSION',
          semanticGroup: 'DATETIME',
          semanticType: 'YEAR_MONTH_DAY_HOUR'
        }
      },
      {
        name: 'played_at_date',
        label: 'Played at (date)',
        dataType: 'STRING',
        semantics: {
          conceptType: 'DIMENSION',
          semanticGroup: 'DATETIME',
          semanticType: 'YEAR_MONTH_DAY'
        }
      },
      {
        name: 'plays',
        label: 'Plays',
        dataType: 'NUMBER',
        formula: 'COUNT(track_name)',
        semantics: {
          conceptType: 'METRIC',
          isReaggregatable: false
        }
      },
      {
        name: 'tracks_count',
        label: 'Played Tracks',
        dataType: 'NUMBER',
        formula: 'COUNT(track_name)',
        semantics: {
          conceptType: 'METRIC',
          isReaggregatable: false
        }
      },
      {
        name: 'popularity',
        label: 'Popularity',
        dataType: 'NUMBER',
        semantics: {
          conceptType: 'METRIC'
        }
      }
    ]
  };
};

/**
 * @return {object} Object containing connector configuration
 */
Connector.prototype.getConfig = function() {
  return {
    dateRangeRequired: true
  };
};

/**
 * @return {object} Object containing auth config
 */
Connector.prototype.getAuthType = function() {
  return { type: 'OAUTH2' };
};

/**
 * @return {boolean}
 */
Connector.prototype.isAdminUser = function() {
  return true;
};

/**
 * @param request {object} GDS request object
 *
 * @return {object} Object with response schema and rows
 */
Connector.prototype.getData = function(request) {
  var dataSchema = this.prepareSchema(request);

  var startDate = new Date(request.dateRange.startDate);
  var endDate = new Date(request.dateRange.endDate);
  endDate.setUTCHours(23, 59, 59, 999);
  var apiKey = this.getOAuthService().getAccessToken();
  var spotifyClient = new SpotifyClient(this.services.CacheService, this.services.UrlFetchApp, apiKey);

  var plays = spotifyClient.getRecentPlays(startDate, endDate);

  return this.buildTabularData(plays, dataSchema);
};

/**
 * The callback that is invoked after a successful or failed authentication
 * attempt.
 *
 * @param request {object} GDS request
 * @return {HTMLOutput}
 */
Connector.prototype.authCallback = function(request) {
  return this.getOAuthService().authCallback(request);
};

/**
 * @return {boolean} `true` if the user has successfully authenticated and false
 * otherwise.
 */
Connector.prototype.isAuthValid = function() {
  return this.getOAuthService().isAuthValid();
};

/**
 * Used as a part of the OAuth2 flow.
 *
 * @return {string} The authorization url if service is defined.
 */
Connector.prototype.get3PAuthorizationUrls = function() {
  return this.getOAuthService().get3PAuthorizationUrls();
};

/**
 * Resets the OAuth2 service. This will allow the user to reauthenticate with
 * the external OAuth2 provider.
 */
Connector.prototype.resetAuth = function() {
  this.getOAuthService().resetAuth();
};

// private

Connector.prototype.prepareSchema = function(request) {
  // Prepare the schema for the fields requested.
  var dataSchema = [];
  var fixedSchema = this.getSchema().schema;
  request.fields.forEach(function(field) {
    for (var i = 0; i < fixedSchema.length; i++) {
      if (fixedSchema[i].name == field.name) {
        dataSchema.push(fixedSchema[i]);
        break;
      }
    }
  });

  return dataSchema;
};

Connector.prototype.buildTabularData = function(plays, dataSchema) {
  var data = [];
  var dataBuilder = new DataBuilder(dataSchema);

  plays.forEach(function(play) {
    data.push({
      values: dataBuilder.build(play)
    });
  });

  return {
    schema: dataSchema,
    rows: data
  };
};

Connector.prototype.getOAuthService = function() {
  var builder = new Oauth2Builder(this.services.PropertiesService, this.services.OAuth2);
  return new OauthService(builder, this.services.HtmlService);
};

/* global exports */
/* istanbul ignore next */
if (typeof(exports) !== 'undefined') {
  exports['__esModule'] = true;
  exports['default'] = Connector;
}
