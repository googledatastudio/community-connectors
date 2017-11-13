# Google Fit Community Connector for Data Studio

![Screenshot](./screenshot.jpg?raw=true "Screenshot")

*This is not an official Google product*

This [Data Studio](https://datastudio.google.com) [Community
Connector](https://developers.google.com/datastudio/connector) allows users to query
[Google Fit](https://fit.google.com) for fitness data.
This connector uses the Google Fit [REST API](https://developers.google.com/fit/rest/).

## Supported data

The Google Fit Community Connector supports the following types of Google Fit data.

- Activity (Walking, Running, Calisthenics, etc.)
- Steps
- Weight

## Try out the connector

You can use the latest version of the Google Fit Community Connector using this link: [Google Fit Community Connector](https://datastudio.google.com/datasources/create?connectorId=AKfycbxlNBvs3B1qMjPdXJzhmg0WrtPw_rakGnRdC2ImgAMUx-FX60HXHut0)

## Deploy the connector

You can deploy the connector yourself in your own project.

- Follow the [Google Fit getting started guide](https://developers.google.com/fit/rest/v1/get-started) to create a project in the [Google API Console](https://console.developers.google.com/).
- Following the [deployment guide](../deploy.md) for Datastudio Community Connectors. Be sure to copy all files.

## Use cases

- **OAuth based authentication**  
  You can use this Community Connector as an example to implement OAuth2 based
  authentication. This type of authentication is tied to the user authenticating with
  the API and is not shared.
- **Logging**  
  Example of using a global flag to toggle logging and also [logging method
  parameters and output to
  Stackdriver](https://developers.google.com/datastudio/connector/debug#apps_script_logging).
- **Defining a namespace**
  Example of [Defining a
  namespace](https://stackoverflow.com/questions/881515/how-do-i-declare-a-namespace-in-javascript)
  for your connector.
- **Using multiple files**
  Example of using [multiple files](https://developers.google.com/apps-script/guides/import-export#features_and_limitations) in a Google Apps Script project.
- **Using the sampleExtraction property**  
  Example of returning pre-defined sample data-set for more efficient
  `getData()` queries when sampleExtraction is `true`. Learn more about
  [sampleExtraction](https://developers.google.com/datastudio/connector/reference#getdata).
