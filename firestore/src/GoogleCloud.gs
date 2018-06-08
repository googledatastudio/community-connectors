/*
Copyright 2018 Google LLC

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

/** Handles fetching data from Google Cloud Platform. */
function GoogleCloud() {}


/**
 * Fetches the list of all Google Cloud projects managed by the user.
 *
 * @return {Array} List of Cloud projects.
 */
GoogleCloud.prototype.listCloudProjects = function() {
  var url = 'https://cloudresourcemanager.googleapis.com/v1beta1/projects';
  var response = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
    }
  });
  var projects = JSON.parse(response.getContentText()).projects;
  return projects;
}
