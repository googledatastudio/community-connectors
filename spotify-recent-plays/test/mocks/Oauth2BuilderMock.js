import OAuth2Mock from './OAuth2Mock';

/**
 * Mocked service for building OAuth2 service instance
 *
 * @return {object}
 */
function Oauth2BuilderMock() {
  this.oauth2Mock = new OAuth2Mock();

  return this;
}

Oauth2BuilderMock.prototype.build = function() {
  return this.oauth2Mock;
};

export default Oauth2BuilderMock;
