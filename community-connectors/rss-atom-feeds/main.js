/**
 * @fileoverview This is a RSS 2.0 and Atom 1.0 Data Studio Community Connector.
 * The FIELDS object lists the data this connector returns.
 * 
 * Conforms to both:
 * - Atom 1.0 spec: https://validator.w3.org/feed/docs/atom.html
 * - RSS 2.0: https://validator.w3.org/feed/docs/rss2.html
 * - Spec differences: http://www.intertwingly.net/wiki/pie/Rss20AndAtom10Compared
 * @author nickski15@gmail.com
 */


/** @const */
var ATOM_NAMESPACE = 'http://www.w3.org/2005/Atom';


/**
 * Main fields this connector returns indexed by id for sanity.
 * @const
 */
var DIMENSION = 'DIMENSION';
var METRIC = 'METRIC';
var STRING = 'STRING';
var NUMBER = 'NUMBER';
var URL = 'URL';
var TEXT = 'TEXT';
var YEAR_MONTH_DAY_HOUR = 'YEAR_MONTH_DAY_HOUR';

var ENTRY = 'entry';
var ENTRY_TITLE = 'entryTitle';
var ENTRY_LINK = 'entryLink';
var ENTRY_UPDATED = 'entryUpdated';
var ENTRIES = 'entries';
var FEED_TITLE = 'feedTitle';
var FEED_URL = 'feedUrl';
var FEED = 'feed';
var FIELDS = {};

FIELDS[FEED_TITLE] = {
  name: FEED_TITLE,
  label: 'Feed Title',
  description: 'Title of the feed.',
  dataType: STRING,
  semantics: {
    conceptType: DIMENSION,
    semanticType: TEXT
  }
};

FIELDS[FEED_URL] = {
  name: FEED_URL,
  label: 'Feed URL',
  description: 'Url of the feed.',
  dataType: STRING,
  semantics: {
    conceptType: DIMENSION,
    semanticType: TEXT
  }
};

FIELDS[ENTRY_TITLE] = {
  name: ENTRY_TITLE,
  label: 'Entry Title',
  description: 'Title of the entry.',
  dataType: STRING,
  semantics: {
    conceptType: DIMENSION,
    semanticType: TEXT
  }
};
  
FIELDS[ENTRY_LINK] = {
  name: ENTRY_LINK,
  label: 'Entry URL',
  description: 'URL of the entry.',
  dataType: STRING,
  semantics: {
    conceptType: DIMENSION,
    semanticType: TEXT
  }
};

FIELDS[ENTRY_UPDATED] = {
  name: ENTRY_UPDATED,
  label: 'Date',
  description: 'Last updated date of the entry.',
  dataType: STRING,
  semantics: {
    conceptType: DIMENSION,
    semanticType: YEAR_MONTH_DAY_HOUR
  }
};

/**
 * Synthetic fields that are derived from the fields above.
 * Data Studio will derived these on the fly and should be
 * ignored when extracting data from a feed.
 */ 

// HYPERLINK(URL, Link Label)
FIELDS[ENTRY] = {
  name: ENTRY,
  label: 'Entry',
  description: 'URL of the entry by entry name.',
  dataType: STRING,
  formula: 'HYPERLINK(' + ENTRY_LINK + ',' + ENTRY_TITLE + ')',
  semantics: {
    conceptType: DIMENSION,
    semanticType: 'HYPERLINK'
  }
};

// HYPERLINK(URL, Link Label)
FIELDS[FEED] = {
  name: FEED,
  label: 'Feed',
  description: 'URL of the feed by feed name.',
  dataType: STRING,
  formula: 'HYPERLINK(' + FEED_URL + ',' + FEED_TITLE + ')',
  semantics: {
    conceptType: DIMENSION,
    semanticType: 'HYPERLINK'
  }
};

// COUNT_DISTINCT(X)
FIELDS[ENTRIES] = {
  name: ENTRIES,
  label: 'Entries',
  description: 'The number of unique feed entries.',
  dataType: NUMBER,
  formula: 'COUNT_DISTINCT(' + ENTRY_LINK + ')',
  semantics: {
    conceptType: METRIC,
    semanticType: NUMBER,
    isReaggregatable: false
  }
};

/**
 * Main method to return the user specified configuration for this connector.
 * @param {Object} request A JavaScript object containing the config request
 *     parameters.
 * @return {object} A JavaScript object representing the connector
 *     configuration that should be displayed to the user.
 */
function getConfig(request) {
  var config = {
    configParams: [
      {
        type: 'TEXTINPUT',
        name: 'feedUrl',
        displayName: 'Feed URL',
        helpText: 'Enter the full URL of the RSS 2.0 or Atom 1.0 feed.',
        placeholder: 'https://www.blog.google/rss/'
      }
    ],
    scriptParams: {}
  };
  return config;
}


/**
 * Main method to return all the fields supported by this connector.
 * Spcific field details are in the FIELDS object.
 * @param {object} request A JavaScript object containing the schema
 *     request parameters.
 * @return {object} A JavaScript object representing the schema for the
 *     given request.
 */
function getSchema(request) {
  var schema = [];
  for (var name in FIELDS) {
    schema.push(FIELDS[name]);
  }
  return {
    schema: schema
  };
}


/**
 * Main method to return data from the connector. Fetches the XML document
 * based on the user configured url. Then identifies and parses the XML doc.
 * @param {object} request A JavaScript object containing the data request
 *     parameters.
 * @return {object} A JavaScript object that contains the schema and data
 *     for the given request.
 */
function getData(request) {
  var url = request.configParams.feedUrl;
  var document = fetchXmlDocument(url);
  
  var feedParser;
  if (Parser.isAtomFeed(document)) {
    feedParser = Parser.GetAtomParser(document,
        XmlService.getNamespace(ATOM_NAMESPACE));
    
  } else if (Parser.isRssFeed(document)) {
    feedParser = Parser.GetRssParser(document);
  
  } else {
    throw new UserError([
      'The configured URL doesn\'t look like a compatible feed:', url,
      'Currently only RSS 2.0 or ATOM 1.0 feeds are supported.']);
  }
  
  var data = {
    schema: getRequestedFields(request.fields, FIELDS),
    rows: getReturnRows(request.fields, feedParser)
  };
  
  //throw new Error(JSON.stringify(data)); // For debugging ;)
  return data;
}


/**
 * Fetches a URL and returns the parsed XML document.
 * Throws {UserError} if there was an issue fetching or parsing the
 * file.
 * @param {string} url The URL of the current document.
 * @return {Document} Apps Scripts representation of an XML document.
 */
function fetchXmlDocument(url) 
{
  // Catch any http fetching errors.
  try {
    var httpResponse = UrlFetchApp.fetch(url).getContentText();
  } catch(error) {
    throw new UserError(['There was a problem accessing the following URL:',
                         url]);
  }
  // Catch any XML parsing errors.
  try {
    var xml = XmlService.parse(httpResponse);
  } catch (error) {
    throw new UserError(['Only valid XML files are supported. The following'
                         + ' file doesn\'t seem to be XML:', url]);
  }
  return xml;
}


/**
 * Utility function to convert a list of Field objects that only have
 * their name set, to the same list of Field objects with all properties set.
 * The allFields parameter specifies the fully confgured Field objects.
 * @param {Array.<Field>} requestFields An array of Field objects that
 *     only have the Field.name property set.
 * @param {object} allFields An object that has all properties of the Field
 *     object set. The keys of the object are Field.names and the values of
 *     the object are the entire Field objects.
 * @return {Array.<Field>} An array of Field objects.
 */
function getRequestedFields(requestFields, allFields) {
  var fields = [];
  for (var i = 0, requestField; requestField = requestFields[i]; ++i) {
    fields.push(allFields[requestField.name]);    
  }
  return fields;
}

/**
 * Returns the data in the feed in a tabular form. Accepts a list of fields
 * in the data request along and a parser. The parser object has a get method
 * to return the value of each field. Only fields that do not have a formula
 * are retrieved.
 * @param {Array.<Fields>} fields A list of field objects for which to extract
 *     data.
 * @param {object} parser Parser object to access data based on the feed type. 
 * @return {Array.<object>} An array of objects where each entry represents
 *     a row in the result table.
 */
function getReturnRows(fields, parser) {
  var rows = [];
  var entries = parser.getEntries();

  entries.forEach(function(entry) {
    var row = [];
    fields.forEach(function(field) {
      if (!field.formula) {
        row.push(parser.get(entry, field.name));
      }
    });
    rows.push({values: row});
  });

  return rows;
}

/**
 * Specify this connector does not access an authorized API.
 * @return {object} An object defining no auth type.
 */
function getAuthType() {
  return {type: 'NONE'}; 
}


/**
 * Inform the script whether the user executing the script should
 * be treated as an admin.
 * @return {bool} Wheter to run in admin mode.
 */
function isAdminUser() {
  return false;
}


/**
 * Provides custom error messages to users / non-Admins. Messages are formatted
 * and can have multiple lines.
 * @param {Array.<string>} messageList An array of strings to message the user
 *    where each message is formatted on a seperate line.
 */
function UserError(messageList) {
  this.message = 'DS_USER:\n\n' + messageList.join('\n') + '\n\n';
}
UserError.prototype = new Error;