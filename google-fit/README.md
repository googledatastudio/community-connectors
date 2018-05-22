# Google Fit Community Connector for Data Studio

![Screenshot](./screenshot.jpg?raw=true "Screenshot")

*This is not an official Google product*

This [Data Studio][_datastudio] [Community Connector][_cc] allows users to query
[Google Fit][_gf] for fitness data. This connector uses the Google Fit [REST
API][_gf rest].

## Supported data

The Google Fit Community Connector supports the following types of Google Fit
data.

-   Activity (Walking, Running, Calisthenics, etc.)
-   Steps
-   Weight

## Try out the connector

You can use the latest version of the Google Fit Community Connector using this
link: [Google Fit Community Connector][_latest deployment]

## Deploy the connector

You can deploy the connector yourself in your own project.

-   Follow the [deployment guide](../deploy.md) for Datastudio Community
    Connectors. Be sure to copy all files.

## Use cases

-   **Logging** \
    Example of using a global flag to toggle logging and also [logging method
    parameters and output to Stackdriver][_cc logging].
-   **Defining a namespace** \
    Example of [Defining a namespace][_js namespace] for your connector.
-   **Using the sampleExtraction property** \
    Example of returning pre-defined sample data-set for more efficient
    `getData()` queries when sampleExtraction is `true`. Learn more about
    [sampleExtraction][_sample extraction].

[_datastudio]: https://datastudio.google.com
[_cc]: https://developers.google.com/datastudio/connector
[_gf]: https://fit.google.com
[_gf rest]: https://developers.google.com/fit/rest/
[_cc logging]: https://developers.google.com/datastudio/connector/debug#apps_script_logging
[_js namespace]: https://stackoverflow.com/questions/881515/how-do-i-declare-a-namespace-in-javascript
[_sample extraction]: https://developers.google.com/datastudio/connector/reference#getdata
[_latest deployment]: https://datastudio.google.com/datasources/create?connectorId=AKfycbyNIbNwRwLwSAPttlVuXPogT4p-1zM_aNEPdliRfZ8H4NpPtr8D6VSg4m2hghLaKuMezw
