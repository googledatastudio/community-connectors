/**
 * @fileoverview Provides an object to extract data from an ATOM 1.0 feed.
 * @author nickski15@gmail.com
 */

/**
 * New namespace.
 * @type {object}
 */
var Parser = Parser || {};

/**
 * Returns whether the document is in ATOM spec.
 * ATOM Spec: https://validator.w3.org/feed/docs/atom.html
 * @param {Document} document Apps scripts representation of an XML document.
 * @param {Namespace} namespace Apps scripts representation of an XML namespace.
 * @return {boolean} Whether the document is in ATOM spec.
 */
Parser.isAtomFeed = function(document) {
  if (document.getRootElement().getName() == 'feed' &&
      document.getRootElement().getNamespace() &&
      document.getRootElement().getNamespace().getURI() == ATOM_NAMESPACE) {
    return true;
  };
  return false;
};


/**
 * Returns a new object to parse an ATOM feed.
 * @param {Document} document Apps scripts representation of an XML document.
 * @param {Namespace} namespace Apps scripts representation of an XML namespace.
 * @return {object} The parser to get specific fields from an XML document.
 */
Parser.GetAtomParser = function(document, namespace) {
  var parser = {};
  var feedTitle;
  var feedUrl;

  parser.getEntries = function() {
    feedTitle = document.getRootElement().getChildren('title', namespace)[0].getValue();
    feedUrl = document.getRootElement().getChildren('link', namespace)[0].getValue();
    return document.getRootElement().getChildren('entry', namespace);
  };
  
  parser.get = function(entry, fieldName) {
    return access[fieldName](entry);
  };
  
  /**
   * Methods to access field values from entries in the feed. The object
   * keys are the field names.
   */
  var access = {};
  access[FEED_TITLE] = function(entry) {
    return feedTitle;
  };
  
  access[FEED_URL] = function(entry) {
    return feedUrl;
  };
  
  access[ENTRY_TITLE] = function(entry) {
    return entry.getChild('title', namespace).getText();
  };

  access[ENTRY_LINK] = function(entry) {
    var links = entry.getChildren('link', namespace);
    var href = '';
    links.forEach(function(link) {
      if (link.getAttribute('rel').getValue() == 'alternate') {
        href = link.getAttribute('href').getValue();
      }
    });
    return href;
  };
  
  access[ENTRY_UPDATED] = function(entry) {
    var updated = entry.getChild('updated', namespace).getText();
    var date = new Date(updated);
    var formattedDate = Utilities.formatDate(date, 'UTC', 'yyyyMMddHH');
    return formattedDate;
  };

  return parser;
};