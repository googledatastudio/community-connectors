function Connector() {
    this.cache = null;
}

/** @const */
Connector.OAUTH_CONST = 'OAUTH2';

/** @const */
Connector.logEnabled = true;

Connector.customConfig = [];

/**
 * Builds up the url needed for the request.
 *
 * @param {object} request - The request passed to `Connector.getData(request)`.
 * @return {string} The built url.
 */
Connector.prototype.buildURL = function(request, startTime, endTime) {
    var baseUrl = 'https://api.lyft.com/v1/rides';

    var urlParams = [
        'limit=50',
        'start_time=' + startTime,
        (endTime ? 'end_time=' + endTime : '')
    ].filter(function(s) {
        return s.length > 0;
    }).join('&');

    return baseUrl + '?' + urlParams;
};

Connector.prototype.pullOutMatches = function(time) {
    // "time":"2018-01-19T16:56:25+00:00"
    var timeRegex = /([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})/;
    var matches = time.match(timeRegex);
    return matches.splice(1);
};

Connector.prototype.parseHour = function(time) {
    var matches = this.pullOutMatches(time);
    var hour = matches[3];
    return hour;
};

Connector.prototype.parseMinute = function(time) {
    var matches = this.pullOutMatches(time);
    var minute = matches[4];
    return minute;
};

Connector.prototype.parseDate = function(time) {
    var matches = this.pullOutMatches(time);
    var year = matches[0];
    var month = matches[1];
    var day = matches[2];
    return year + month + day;
};

Connector.prototype.rowifyRides = function(apiResults, dataSchema) {
    var that = this;
    return apiResults["ride_history"]
        .filter(function(entry) {
            return entry["canceled_by"] === undefined;
        })
        .map(function(entry) {
            var values = [];
        dataSchema.forEach(function(field) {
            switch (field.name) {
            case 'pickup_latlong':
                var lat = entry['pickup']['lat'];
                var lng = entry['pickup']['lng'];
                return values.push('' + lat + ', ' + lng);
            case 'dropoff_latlong':
                var lat = entry['dropoff']['lat'];
                var lng = entry['dropoff']['lng'];
                return values.push('' + lat + ', ' + lng);
            case 'pickup_date': return values.push(that.parseDate(entry['pickup']['time']));
            case 'pickup_hour': return values.push(that.parseHour(entry['pickup']['time']));
            case 'pickup_minute': return values.push(that.parseMinute(entry['pickup']['time']));
            case 'dropoff_date': return values.push(that.parseDate(entry['dropoff']['time']));
            case 'dropoff_hour': return values.push(that.parseHour(entry['dropoff']['time']));
            case 'dropoff_minute': return values.push(that.parseMinute(entry['dropoff']['time']));

            case 'distance': return values.push(entry['distance_miles']);
            case 'price': return values.push(entry['price']['amount'] / 100);
            case 'ride_id': return values.push(entry['ride_id']);
            case 'ride_type': return values.push(entry['ride_type']);
            default:
                that.throwError(
                    'A field was requested that is not in the schema: ' + field.name,
                    true);
            }
        });
        return {values: values};
    });
};

/**
 * Builds the options for UrlFetchApp.
 *
 * @return {object} An object with all needed headers.
 */
Connector.prototype.getFetchOptions = function() {
    var options = {
        headers: {'Authorization': 'Bearer ' + getOAuthService().getAccessToken()}
    };
    return options;
};

/**
 * Returns the tabular data for the given request.
 *
 * @param {Object} request - Data request parameters.
 * @return {Object} Contains the schema and data for the given request.
 */
Connector.prototype.getData = function(request) {
    var startTime = '2015-12-01T21:04:22Z';
    var url = this.buildURL(request, startTime);
    var options = this.getFetchOptions();
    // TODO(mjhamrick) - this should pull all the rides instead of just the
    // first 50. This can be by making more requests using the last entry as the
    // new start time (if there are 50 results returned).
    // TODO(mjhamrick) - this should also use a persistent cache since this data
    // shouldn't change over time.
    var apiResults = JSON.parse(UrlFetchApp.fetch(url, options));
    var dataSchema = this.getDataSchema(request);
    var rows = this.rowifyRides(apiResults, dataSchema);
    var results = {schema: dataSchema, rows: rows};
    return results;
};

Connector.prototype.validateConfig = function(request) {
    request.configParams = request.configParams || {};
    return request.configParams;
};

/**
 * Returns a dynamic schema that only contains fields that were in the request.
 *
 * @param {object} request - The request passed to `Connector.getData(request)`.
 *
 * @return {obj} The schema keyed by `schemaEntry.name`.
 */
Connector.prototype.getDataSchema = function(request) {
    var that = this;
    var schemaByName =
        this.getSchema(request).schema.reduce(function(acc, schemaEntry) {
            var name = schemaEntry.name;
            acc[name] = schemaEntry;
            return acc;
        }, {});

    var dataSchema = [];
    request.fields.forEach(function(field) {
        if (field.name in schemaByName) {
            dataSchema.push(schemaByName[field.name]);
        } else {
            that.throwError(
                'A field was requested that was not in the schema: ' + field.name,
                false);
        }
    });

    return dataSchema;
};

/**
 * Stringifies parameters and responses for a given function and logs them to
 * Stackdriver.
 *
 * @param {string} functionName - Function to be logged and executed.
 * @param {Object} parameter - Parameter for the `functionName` function.
 * @return {any} Returns the response of `functionName` function.
 */
Connector.prototype.logAndExecute = function(functionName, parameter) {
    if (this[functionName] === undefined) {
        this.throwError(
            'The function you are trying to log is not defined: ' + functionName,
            false);
    } else {
        if (this.logEnabled && this.isAdminUser()) {
            var paramString = JSON.stringify(parameter, null, 2);
            console.log([functionName, 'request', paramString]);
        }

        var returnObject = this[functionName](parameter);

        if (this.logEnabled && this.isAdminUser()) {
            var returnString = JSON.stringify(returnObject, null, 2);
            console.log([functionName, 'response', returnString]);
        }

        return returnObject;
    }
};

/**
 * This checks whether the current user is an admin user of the Connector.
 *
 * @return {boolean} Returns true if the current authenticated user at the time
 * of function execution is an admin user of the Connector. If the function is
 * omitted or if it returns false, then the current user will not be considered
 * an admin user of the Connector.
 */
Connector.prototype.isAdminUser = function() {
    return false;
};

/**
 * Returns the authentication method required by the Connector to authorize the
 * third-party service.
 *
 * Required function for Community Connector.
 *
 * @return {Object} `AuthType` used by the Connector.
 */
Connector.prototype.getAuthType = function() {
    var response = {'type': Connector.OAUTH_CONST};
    return response;
};

/**
 * Returns the user configurable options for the Connector.
 *
 * Required function for Community Connector.
 *
 * @param {Object} request - Config request parameters.
 * @return {Object} Connector configuration to be displayed to the user.
 */
Connector.prototype.getConfig = function(request) {
    var config = {configParams: Connector.customConfig};
    return config;
};

/**
 * Returns the schema for the given request.
 *
 * @param {Object} request - Schema request parameters.
 * @return {Object} Schema for the given request.
 */
Connector.prototype.getSchema = function(request) {
    return {schema: new Schema().getSchema()};
};

/**
 * Throws errors messages with the correct prefix to be shown to users.
 *
 * @param {string} message - Error message to be shown in UI.
 * @param {boolean} userSafe - Indicates whether the error message can be shown to
 *      regular users (as opposed to debug error messages meant for admin users
 *      only.)
 */
Connector.prototype.throwError = function(message, userSafe) {
    if (userSafe) {
        message = 'DS_USER:' + message;
    }
    throw new Error(message);
};

// Needed for testing
var module = module || {};
module.exports = Connector;
