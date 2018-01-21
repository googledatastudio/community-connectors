/**
 * Constructor for Schema.
 *
 * @return {object} Schema.
 */
function Schema() {
  this.schema = undefined;
  return this;
}

/**
 * Returns the schema for an apiType.
 *
 * @param {string} apiType The apiType for the request.
 * @return {object} The schema for the apiType.
 */
Schema.prototype.getSchema = function() {
    return [
        {
            name: 'pickup_latlong',
            label: 'Pickup (lat long)',
            dataType: 'STRING',
            semantics: {
                conceptType: 'DIMENSION',
                semanticType: 'LATITUDE_LONGITUDE',
                semanticGroup: 'GEO'
            }
        },
        {
            name: 'pickup_date',
            label: 'Pickup Date',
            dataType: 'STRING',
            semantics: {
                conceptType: 'DIMENSION',
                semanticType: 'YEAR_MONTH_DAY',
                semanticGroup: 'DATETime'
            }
        },
        {
            name: 'pickup_hour',
            label: 'Pickup Hour',
            dataType: 'STRING',
            semantics: {
                conceptType: 'DIMENSION',
                semanticType: 'HOUR',
                semanticGroup: 'DATETIME'
            }
        },
        {
            name: 'pickup_minute',
            label: 'Pickup Minute',
            dataType: 'STRING',
            semantics: {
                conceptType: 'DIMENSION',
                semanticType: 'MINUTE',
                semanticGroup: 'DATETIME'
            }
        },
        {
            name: 'dropoff_latlong',
            label: 'Dropoff (lat long)',
            dataType: 'STRING',
            semantics: {
                conceptType: 'DIMENSION',
                semanticType: 'LATITUDE_LONGITUDE',
                semanticGroup: 'GEO'
            }
        },
        {
            name: 'dropoff_date',
            label: 'Dropoff Date',
            dataType: 'STRING',
            semantics: {
                conceptType: 'DIMENSION',
                semanticType: 'YEAR_MONTH_DAY',
                semanticGroup: 'DATETIME'
            }
        },
        {
            name: 'dropoff_hour',
            label: 'Dropoff Hour',
            dataType: 'STRING',
            semantics: {
                conceptType: 'DIMENSION',
                semanticType: 'HOUR',
                semanticGroup: 'DATETIME'
            }
        },
        {
            name: 'dropoff_minute',
            label: 'Dropoff Minute',
            dataType: 'STRING',
            semantics: {
                conceptType: 'DIMENSION',
                semanticType: 'MINUTE',
                semanticGroup: 'DATETIME'
            }
        },
        {
            name: 'distance',
            label: 'Distance (mi)',
            dataType: 'NUMBER',
            semantics: {
                conceptType: 'METRIC',
                semanticType: 'NUMBER',
                semanticGroup: 'NUMERIC'
            }
        },
        {
            name: 'price',
            label: 'Price',
            dataType: 'NUMBER',
            semantics: {
                conceptType: 'METRIC',
                semanticType: 'CURRENCY_USD',
                semanticGroup: 'CURRENCY'
            }
        },
        {
            name: 'ride_id',
            label: 'Ride Id',
            dataType: 'NUMBER',
            semantics: {
                conceptType: 'DIMENSION',
                semanticType: 'NUMBER',
                semanticGroup: 'NUMERIC'
            }
        },
        {
            name: 'ride_type',
            label: 'Ride Type',
            dataType: 'STRING',
            semantics: {
                conceptType: 'DIMENSION',
                semanticType: 'TEXT',
                semanticGroup: 'TEXT'
            }
        }
    ];
};


// Needed for testing
var module = module || {};
module.exports = Schema;
