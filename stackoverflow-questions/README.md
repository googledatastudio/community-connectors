# Stack Overflow Questions Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio](https://datastudio.google.com) [Community
Connector](https://developers.google.com/datastudio/connector) lets users query
[Stack Overflow](https://stackoverflow.com) questions for a specific tag. This
Community Connector uses the `questions` end point of [Stack Exchange
API](https://api.stackexchange.com/docs/questions).

## Try the Community Connector in Data Studio

You can try out the managed deployment of the latest code: [Stack Overflow
Questions Community
Connector](https://datastudio.google.com/datasources/create?connectorId=AKfycbwGMj-oe532y-NEbMHo-KLUCEz0EEGOZj-3lhEgw7q65-hs-T_F9B3Qjw)

## Deploy the Community Connector yourself

Use the [deployment guide](../deploy.md) to deploy the Community Connector
yourself.

## Examples and use cases covered in the connector

- **API key based authentication (shared API Key)**  
  You can use this Community Connector as an example to implement API key based
  authentication or quota management for shared API keys(i.e. instances where a
  single API key can be used for all users of the Community Connector.).
- **Logging**  
  Example of using a global flag to toggle logging and also [logging method
  parameters and output to
  Stackdriver](https://developers.google.com/datastudio/connector/debug#apps_script_logging).
- **Defining a namespace**  
  Example of [Defining a
  namespace](https://stackoverflow.com/questions/881515/how-do-i-declare-a-namespace-in-javascript)
  for your connector.
- **Using the sampleExtraction property**  
  Example of returning pre-defined sample data-set for more efficient
  `getData()` queries when sampleExtraction is `true`. Learn more about
  [sampleExtraction](https://developers.google.com/datastudio/connector/reference#getdata).
- **Caching data**  
  Example of [Using Apps Script Cache
  Service](https://developers.google.com/apps-script/reference/cache/) to store
  UrlFetch results.
