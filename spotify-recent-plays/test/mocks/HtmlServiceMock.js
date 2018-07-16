/**
 * Google htmlService mock
 *
 * @return {object}
 */
function HtmlServiceMock() {
  return this;
}

HtmlServiceMock.prototype.createHtmlOutput = function(htmlContent) {
  this.lastHtmlContent = htmlContent;
};

export default HtmlServiceMock;
