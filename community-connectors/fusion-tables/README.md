# Fusion Tables Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio](https://datastudio.google.com) [Community
Connector](https://developers.google.com/datastudio/connector) lets users query
[Fusion Tables](https://fusiontables.google.com) that they have access to. This
Community Connector uses the [Fusion Tables
Service](https://developers.google.com/apps-script/advanced/fusion-tables) in
Apps Script.

## Try the Community Connector in Data Studio

You can try out the managed deployment of the latest code: [Fusion Tables
Community
Connector](https://datastudio.google.com/datasources/create?connectorId=AKfycbz-CKzYQ8FWpAzHtJBT1SlVBH0cnEiQBclqyrxfU8sgdrmaPnk0iWLbRA)

## Deploy the Community Connector yourself

Use the [deployment guide](../deploy.md) to deploy the Community Connector
yourself.

Since *Fusion Tables Service* is an Advanced Service in Apps Script, you must
enable the service before use. To enable the *Fusion Tables Service*, follow the
[Apps Script Enabling Advanced Services
Guide](https://developers.google.com/apps-script/guides/services/advanced#enabling_advanced_services).


## Examples and use cases covered in the connector

- **Apps Script Services**  
  *Fusion Tables Service* is an Advanced Service in Apps Script. You can use
  this Community Connector as an example to implement other [Advanced Google
  Services](https://developers.google.com/apps-script/advanced/) in Apps Script
  to fetch data.
- **Dynamic schemas**  
  Example of dynamically generating schemas for connectors that do not have a
  fixed schema.
- **Using the sampleExtraction property**  
  Example of returning sample data for more efficient getData queries when
  sampleExtraction is `true`. Learn more about
  [sampleExtraction](https://developers.google.com/datastudio/connector/reference#getdata).
