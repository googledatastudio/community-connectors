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
 * Returns the schema.
 *
 * @param {string} apiType The apiType for the request.
 * @return {object} The schema for the apiType.
 */
Schema.prototype.getSchema = function() {
  return {
    schema: [
      {
        name: 'activity_period',
        label: 'Activity Month',
        dataType: 'STRING',
        semantics: {
          conceptType: 'DIMENSION',
          semanticType: 'YEAR_MONTH',
          semanticGroup: 'DATETIME',
        },
      },
      {
        name: 'activity_type_code',
        label: 'Activity Type',
        dataType: 'STRING',
        semantics: {
          conceptType: 'DIMENSION',
        },
      },
      {
        name: 'boarding_area',
        label: 'Boarding Area',
        dataType: 'STRING',
        semantics: {
          conceptType: 'DIMENSION',
        },
      },
      {
        name: 'geo_region',
        label: 'Geographic Region',
        dataType: 'STRING',
        semantics: {
          conceptType: 'DIMENSION',
        },
      },
      {
        name: 'geo_summary',
        label: 'Geographic Summary',
        dataType: 'STRING',
        semantics: {
          conceptType: 'DIMENSION',
        },
      },
      {
        name: 'operating_airline',
        label: 'Operating Airline',
        dataType: 'STRING',
        semantics: {
          conceptType: 'DIMENSION',
        },
      },
      {
        name: 'operating_airline_iata_code',
        label: 'Operating Airline IATA code',
        dataType: 'STRING',
        semantics: {
          conceptType: 'DIMENSION',
        },
      },
      {
        name: 'passenger_count',
        label: 'Passenger Count',
        dataType: 'NUMBER',
        semantics: {
          conceptType: 'METRIC',
          isReaggregatable: true,
        },
      },
      {
        name: 'price_category_code',
        label: 'Price Category',
        dataType: 'STRING',
        semantics: {
          conceptType: 'DIMENSION',
        },
      },
      {
        name: 'published_airline',
        label: 'Published Airline',
        dataType: 'STRING',
        semantics: {
          conceptType: 'DIMENSION',
        },
      },
      {
        name: 'published_airline_iata_code',
        label: 'Published Airline IATA Code',
        dataType: 'STRING',
        semantics: {
          conceptType: 'DIMENSION',
        },
      },
      {
        name: 'terminal',
        label: 'Terminal',
        dataType: 'STRING',
        semantics: {
          conceptType: 'DIMENSION',
        },
      },
    ],
  };
};

// Needed for testing
var module = module || {};
module.exports = Schema;
