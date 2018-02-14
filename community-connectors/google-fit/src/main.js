// vim: ft=javascript:ts=2:sw=2
/*
Copyright 2017 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

function getConfig(request) {
  return connector.logAndExecute('getConfig', request);
}

function getSchema(request) {
  return connector.logAndExecute('getSchema', request);
}

function getAuthType() {
  return connector.logAndExecute('getAuthType');
}

function isAuthValid() {
  return connector.logAndExecute('isAuthValid');
}

function get3PAuthorizationUrls() {
  return connector.logAndExecute('get3PAuthorizationUrls');
}

function authCallback(request) {
  return connector.logAndExecute('authCallback', request);
}

function resetAuth() {
  return connector.logAndExecute('resetAuth');
}

function getData(request) {
  return connector.logAndExecute('getData', request);
}
