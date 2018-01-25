/**
 * @fileoverview Provides an object to extract data from an RSS 2.0 feed.
 * @author nickski15@gmail.com
 */

/** @const */
var RSS_VERSION = '2.0';

/**
 * New namespace.
 * @type {object}
 */
var Parser = Parser || {};


/**
 * Checks whether the document is RSS 2.0 compatible.
 * RSS 2.0: https://validator.w3.org/feed/docs/rss2.html 
 * @param {Document} document Apps scripts representation of an XML document.
 */
Parser.isRssFeed = function(document) {
  if (document.getRootElement().getName() == 'rss' &&
      document.getRootElement().getAttribute('version') &&
      document.getRootElement().getAttribute('version').getValue() == RSS_VERSION) {
    return true;  
  }
  return false;
};

/**
 * Returns a new object to parse an RSS 2.0 feed.
 * @param {Document} document Apps scripts representation of an XML document.
 * @return {object} The parser to get specific fields from an XML document.
 */
Parser.GetRssParser = function(document) {
  var parser = {};
  var feedTitle;
  var feedUrl;
  
  parser.getEntries = function() {
    feedTitle = document.getRootElement().getChild('channel').getChildren('title')[0].getValue();
    feedUrl = document.getRootElement().getChild('channel').getChildren('link')[0].getValue();
    return document.getRootElement().getChild('channel').getChildren('item');
  }
  
  parser.get = function(entry, fieldName) {
    return access[fieldName](entry);
  };
  
  
  /**
   * Methods to access field values from entries in the feed. The object
   * keys are the field names.
   */
  var access = {};
  access[FEED_TITLE] = function(item) {
    return feedTitle;     
  };
  
  access[FEED_URL] = function(entry) {
    return feedUrl;
  };
  
  access[ENTRY_TITLE] = function(item) {
    return item.getChild('title').getValue();
  };
  
  access[ENTRY_LINK] = function(item) {
    return item.getChild('link').getValue();
  };
  
  access[ENTRY_UPDATED] = function(item) {
    var pubDate = item.getChild('pubDate').getValue();
    var date = new Date(pubDate);
    var formattedDate = Utilities.formatDate(date, 'UTC', 'yyyyMMddHH');
    return formattedDate;
  };

  return parser;
};