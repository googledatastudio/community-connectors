/**
 * Mock for Google HTTPResponse object
 *
 * @param responseText {String} stringified JSON
*/
function HTTPResponseMock(responseText) {
  this.responseText = responseText;

  return this;
}

HTTPResponseMock.prototype.getContentText = function() {
  return this.responseText;
};

/**
 * Mock for Google UrlFetchApp service
 *
 * @param stubbedResponses {Object} Hash in which key -> url string, value -> Response object
*/
function UrlFetchAppMock(stubbedResponses) {
  this.stubbedResponses = stubbedResponses;
  this.calls = {};

  return this;
}

UrlFetchAppMock.prototype.fetch = function(url, options = {}) {
  var json = this.stubbedResponses[url];
  if (!json) {
    throw `Response for url ${url} not found! Available urls: ${Object.keys(this.stubbedResponses)}`;
  }

  this.passedHeaders = options['headers'];

  var text = JSON.stringify(json);
  if (!this.calls[url]) {
    this.calls[url] = 0;
  }

  this.calls[url] += 1;

  return new HTTPResponseMock(text);
};

export default UrlFetchAppMock;
