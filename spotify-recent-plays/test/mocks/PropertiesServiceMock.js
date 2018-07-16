/**
 * Google PropertiesService mock
 *
 * @return {object}
 */
function PropertiesServiceMock() {
  this.userProperties = new InternalPropertiesService({});
  this.scriptProperties = new InternalPropertiesService({
    OAUTH_CLIENT_ID: 'cid',
    OAUTH_CLIENT_SECRET: 'cs'
  });

  return this;
}

PropertiesServiceMock.prototype.getUserProperties = function() {
  return this.userProperties;
};

PropertiesServiceMock.prototype.getScriptProperties = function() {
  return this.scriptProperties;
};

/**
 * Internal properties service
 *
 * @return {object}
 */
function InternalPropertiesService(props) {
  this.props = props;

  return this;
}

InternalPropertiesService.prototype.getProperty = function(name) {
  return this.props[name];
};

export default PropertiesServiceMock;
