# Google Fit Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio] [Community Connector] lets users query [Google Fit] for
fitness data.

This connector uses the [Google Fit REST API].

![An example report in Data Studo that shows fitness activity data from Google Fit][screenshot]

## Features

### Supported data

The Google Fit Community Connector supports the following types of Google Fit
data.

-   Activity (Walking, Running, Calisthenics, etc.)
-   Steps
-   Weight

## Set up the Community Connector for personal use

To use this Community Connector in Data Studio there is a one-time setup to
deploy your own personal instance of the connector using Apps Script.

### Deploy the connector

Follow the [deployment guide] to deploy the Community Connector.

## Using the connector in Data Studio

Once you've set up and deployed the connector, follow the
[Use a Community Connector] guide to use the connector in Data Studio.

**Note**: After using the connector in Data Studio, as long as you do not
[revoke access], it will remain listed in the [connector list] for easy access
when [creating a new data source].

## Troubleshooting

### This app isn't verified

When authorizing the community connector, if you are presented with an
"unverified" warning screen see [This app isn't verified] for details on how to
proceed.

## Developer examples covered in the connector

-   **Logging**  
    Example of using a global flag to toggle logging and also [logging method
    parameters and output to Stackdriver][_cc logging].
-   **Defining a namespace**  
    Example of [Defining a namespace][_js namespace] for your connector.
-   **Using the sampleExtraction property**  
    Example of returning pre-defined sample data-set for more efficient
    `getData()` queries when sampleExtraction is `true`. Learn more about
    [sampleExtraction][_sample extraction].

[Data Studio]: https://datastudio.google.com
[Community Connector]: https://developers.google.com/datastudio/connector
[Google Fit]: https://fit.google.com
[Google Fit REST API]: https://developers.google.com/fit/rest/
[screenshot]: ./screenshot.jpg?raw=true
[deployment guide]: ../deploy.md
[Use a Community Connector]: https://developers.google.com/datastudio/connector/use
[revoke access]: https://support.google.com/datastudio/answer/9053467
[connector list]: https://datastudio.google.com/c/datasources/create
[creating a new data source]: https://support.google.com/datastudio/answer/6300774
[This app isn't verified]: ../verification.md
[_cc logging]: https://developers.google.com/datastudio/connector/debug#apps_script_logging
[_js namespace]: https://stackoverflow.com/questions/881515/how-do-i-declare-a-namespace-in-javascript
[_sample extraction]: https://developers.google.com/datastudio/connector/reference#getdata
