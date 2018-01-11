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
Schema.prototype.getSchema = function(apiType) {
  if (this.schema !== undefined) {
    var result = this.schema[apiType];
    if (result === undefined) {
      new Connector().throwError(
          'The apiType: ' + apiType + ' has no corresponding schema.', false);
    }
    return {schema: result};
  }
  this.schema = {};
  this.schema[Connector.API_TYPE_PRO_GROUPS] = [
    {
      'name': 'id',
      'label': 'Id',
      'description': 'The id of the Group.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'TEXT',
        'semanticGroup': 'TEXT'
      }
    },
    {
      'name': 'name',
      'label': 'Name',
      'description': 'The name of the group.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'TEXT',
        'semanticGroup': 'TEXT'
      }
    },
    {
      'name': 'latlong',
      'label': 'Latitude & Longitude.',
      'description': 'Lat & Long of group.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'LATITUDE_LONGITUDE',
        'semanticGroup': 'GEO'
      }
    },
    {
      'name': 'city',
      'label': 'City.',
      'description': 'City of member.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'CITY',
        'semanticGroup': 'GEO'
      }
    },
    {
      'name': 'country',
      'label': 'Country.',
      'description': 'Country of member.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'COUNTRY',
        'semanticGroup': 'GEO'
      }
    },
    {
      'name': 'member_count',
      'label': 'Member Count',
      'description': 'The number of members of the group.',
      'dataType': 'NUMBER',
      'semantics': {
        'conceptType': 'METRIC',
        'semanticType': 'NUMBER',
        'semanticGroup': 'NUMBER'
      }
    },
    {
      'name': 'average_age',
      'label': 'Average Age',
      'description': 'The average age of the members.',
      'dataType': 'NUMBER',
      'semantics': {
        'conceptType': 'METRIC',
        'semanticType': 'NUMBER',
        'semanticGroup': 'NUMBER',
        'isReaggregatable': false
      }
    },
    {
      'name': 'founded_date',
      'label': 'Founded Date',
      'description': 'The date the group was founded.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'YEAR_MONTH_DAY',
        'semanticGroup': 'DATETIME'
      }
    },
    {
      'name': 'past_events',
      'label': 'Past Events',
      'description': 'Number of events from the past.',
      'dataType': 'NUMBER',
      'semantics': {
        'conceptType': 'METRIC',
        'semanticType': 'NUMBER',
        'semanticGroup': 'NUMBER'
      }
    },
    {
      'name': 'upcoming_events',
      'label': 'Upcoming Events',
      'description': 'Number of upcoming events.',
      'dataType': 'NUMBER',
      'semantics': {
        'conceptType': 'METRIC',
        'semanticType': 'NUMBER',
        'semanticGroup': 'NUMBER'
      }
    },
    {
      'name': 'past_rsvps',
      'label': 'Past Rsvps',
      'description': 'Number of rsvps from the past.',
      'dataType': 'NUMBER',
      'semantics': {
        'conceptType': 'METRIC',
        'semanticType': 'NUMBER',
        'semanticGroup': 'NUMBER'
      }
    },
    {
      'name': 'rsvps_per_event',
      'label': 'RSVPs Per Event',
      'description': 'The number of RSVPs per event.',
      'dataType': 'NUMBER',
      'semantics': {
        'conceptType': 'METRIC',
        'semanticType': 'NUMBER',
        'semanticGroup': 'NUMBER',
        'isReaggregatable': false
      }
    },
    {
      'name': 'repeat_rsvpers',
      'label': 'Repeat RSVPers',
      'description': 'Number of repeat RSVPers',
      'dataType': 'NUMBER',
      'semantics': {
        'conceptType': 'METRIC',
        'semanticType': 'NUMBER',
        'semanticGroup': 'NUMBER'
      }
    },
    {
      'name': 'gender_unknown',
      'label': 'Gender Unknown Count',
      'description': 'The count of unknown gender members.',
      'dataType': 'NUMBER',
      'semantics': {
        'conceptType': 'METRIC',
        'semanticType': 'NUMBER',
        'semanticGroup': 'NUMBER'
      }
    },
    {
      'name': 'gender_female',
      'label': 'Gender Female Count',
      'description': 'The count of female gender members.',
      'dataType': 'NUMBER',
      'semantics': {
        'conceptType': 'METRIC',
        'semanticType': 'NUMBER',
        'semanticGroup': 'NUMBER'
      }
    },
    {
      'name': 'gender_male',
      'label': 'Gender Male Count',
      'description': 'The count of male gender members.',
      'dataType': 'NUMBER',
      'semantics': {
        'conceptType': 'METRIC',
        'semanticType': 'NUMBER',
        'semanticGroup': 'NUMBER'
      }
    },
    {
      'name': 'gender_other',
      'label': 'Gender Other Count',
      'description': 'The count of other gender members.',
      'dataType': 'NUMBER',
      'semantics': {
        'conceptType': 'METRIC',
        'semanticType': 'NUMBER',
        'semanticGroup': 'NUMBER'
      }
    }
  ];

  this.schema[Connector.API_TYPE_GENERAL_INFO] = [
    {
      'name': 'category',
      'label': 'Category',
      'description': 'The category the group belongs to.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'TEXT',
        'semanticGroup': 'TEXT'
      }
    },
    {
      'name': 'category_photo_url',
      'label': 'Category Photo URL',
      'description':
          'The url of the photo of the category the group belongs to.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'URL',
        'semanticGroup': 'URL'
      }
    },
    {
      'name': 'category_photo',
      'label': 'Category Photo',
      'description': 'The photo of the category the group belongs to.',
      'dataType': 'STRING',
      'formula': 'IMAGE(category_photo_url, "Category the group belongs to.")',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'IMAGE',
        'semanticGroup': 'IMAGE'
      }
    },
    {
      'name': 'group_photo_url',
      'label': 'Group Photo URL',
      'description': 'The url of the group photo of the group.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'URL',
        'semanticGroup': 'URL'
      }
    },
    {
      'name': 'group_photo',
      'label': 'Group Photo',
      'description': 'The photo of the group.',
      'dataType': 'STRING',
      'formula': 'IMAGE(group_photo_url, "Photo of the group.")',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'IMAGE',
        'semanticGroup': 'IMAGE'
      }
    },
    {
      'name': 'members_count',
      'label': 'Members Count',
      'description': 'The Count of Members.',
      'dataType': 'NUMBER',
      'semantics': {
        'conceptType': 'METRIC',
        'semanticType': 'NUMBER',
        'semanticGroup': 'NUMERIC'
      }
    },
    {
      'name': 'group_link',
      'label': 'Group Link',
      'description': 'A link to the group\'s page.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'NUMBER',
        'semanticGroup': 'NUMERIC'
      }
    },
    {
      'name': 'group_name',
      'label': 'Group Name',
      'description': 'The full name of the group.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'TEXT',
        'semanticGroup': 'TEXT'
      }
    }
  ];

  this.schema[Connector.API_TYPE_EVENTS] = [
    {
      'name': 'name',
      'label': 'Event Name',
      'description': 'The name of the event.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'TEXT',
        'semanticGroup': 'TEXT'
      }
    },
    {
      'name': 'event_date',
      'label': 'Event Date',
      'description': 'The day that the event will be held.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'YEAR_MONTH_DAY',
        'semanticGroup': 'DATETIME'
      }
    },
    {
      'name': 'event_time',
      'label': 'Event Time',
      'description': 'The time that the event will be held.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'TEXT',
        'semanticGroup': 'TEXT'
      }
    },
    {
      'name': 'waitlist_count',
      'label': 'Waitlist Count',
      'description': 'The number of people on the waitlist.',
      'dataType': 'NUMBER',
      'semantics': {
        'conceptType': 'METRIC',
        'semanticType': 'NUMBER',
        'semanticGroup': 'NUMERIC'
      }
    },
    {
      'name': 'yes_rsvp_count',
      'label': 'RSVP Count',
      'description': 'The number of yes RSVPs.',
      'dataType': 'NUMBER',
      'semantics': {
        'conceptType': 'METRIC',
        'semanticType': 'NUMBER',
        'semanticGroup': 'NUMERIC'
      }
    },
    {
      'name': 'link',
      'label': 'Event URL',
      'description': 'The URL to the event page.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'URL',
        'semanticGroup': 'URL'
      }
    },
    {
      'name': 'fee',
      'label': 'Event Fee',
      'description': 'The cost of the event.',
      'dataType': 'NUMBER',
      'semantics': {
        'conceptType': 'METRIC',
        'semanticType': 'CURRENCY_USD',
        'semanticGroup': 'CURRENCY'
      }
    },
  ];

  this.schema[Connector.API_TYPE_MEMBERS] = [
    {
      'name': 'joined',
      'label': 'Joined Date',
      'description': 'Membership joined date.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'YEAR_MONTH_DAY',
        'semanticGroup': 'DATETIME'
      }
    },
    {
      'name': 'year_month',
      'label': 'Year & Month',
      'dataType': 'STRING',
      'formula': 'TODATE(joined, "DEFAULT_DECIMAL", "%Y%m")',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'YEAR_MONTH',
        'semanticGroup': 'DATETIME'
      }
    },
    {
      'name': 'quarter',
      'label': 'Quarter',
      'dataType': 'STRING',
      'formula': 'QUARTER(joined)',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'QUARTER',
        'semanticGroup': 'DATETIME'
      }
    },
    {
      'name': 'year',
      'label': 'Year',
      'dataType': 'STRING',
      'formula': 'YEAR(joined)',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'YEAR',
        'semanticGroup': 'DATETIME'
      }
    },
    {
      'name': 'month_day',
      'label': 'Month & Day',
      'dataType': 'STRING',
      'formula': 'TODATE(joined, "DEFAULT_DECIMAL", "%m%d")',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'MONTH_DAY',
        'semanticGroup': 'DATETIME'
      }
    },
    {
      'name': 'id',
      'label': 'Meetup Id',
      'description': 'The Id of the group member.',
      'dataType': 'NUMBER',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'NUMBER',
        'semanticGroup': 'NUMERIC'
      }
    },
    {
      'name': 'status',
      'label': 'Status',
      'description': 'Member status.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'TEXT',
        'semanticGroup': 'TEXT'
      }
    },
    {
      'name': 'latlong',
      'label': 'Latitude & Longitude.',
      'description': 'Lat & Long of member.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'LATITUDE_LONGITUDE',
        'semanticGroup': 'GEO'
      }
    },
    {
      'name': 'city',
      'label': 'City.',
      'description': 'City of member.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'CITY',
        'semanticGroup': 'GEO'
      }
    },
    {
      'name': 'state',
      'label': 'State.',
      'description': 'State of member.',
      'dataType': 'STRING',
      'semantics': {
        'conceptType': 'DIMENSION',
        'semanticType': 'REGION',
        'semanticGroup': 'GEO'
      }
    },
    {
      'name': 'member_count',
      'label': 'Member Count',
      'description': 'Number of members.',
      'dataType': 'NUMBER',
      'formula': 'COUNT_DISTINCT(id)',
      'semantics': {
        'conceptType': 'METRIC',
        'semanticType': 'NUMBER',
        'semanticGroup': 'NUMERIC'
      }
    }
  ];
  return this.getSchema(apiType);
};


// Needed for testing
var module = module || {};
module.exports = Schema;
