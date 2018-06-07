var connector = null;

function initConnector() {
  if (connector === null) {
    connector = new Connector(); 
  }
  return connector;
}

function getConfig(request) {
  return initConnector().logAndExecute('getConfig', request);
}

function getSchema(request) {
  return initConnector().logAndExecute('getSchema', request);
}

function getAuthType() {
  return initConnector().logAndExecute('getAuthType');
}

function getData(request) {
  return initConnector().logAndExecute('getData', request);
}
