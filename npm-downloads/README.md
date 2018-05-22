# npm Downloads Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio](https://datastudio.google.com) [Community
Connector](https://developers.google.com/datastudio/connector) lets users query
[npm](https://www.npmjs.com/) downloads for specific packages. This Community
Connector uses the [package download counts
api](https://github.com/npm/registry/blob/master/docs/download-counts.md).

## Try the Community Connector in Data Studio

You can try out the managed deployment of the latest code: [npm Downloads
Community
Connector](https://datastudio.google.com/datasources/create?connectorId=AKfycbzRfJ2ofuhRGSEcnvItW8YXY9AClE6TqDNDqyk6_510kSJK8n32Q9LeFA)

## Deploy the Community Connector yourself

Use the [deployment guide](../deploy.md) to deploy the Community Connector
yourself.

## Examples and use cases covered in the connector

- **No third-party authentication**  
  This community connector does not require any third-party authentication. This
  lean example is good for beginners to try out.
- **Error handling and messaging**  
  Example of using [error handling methods and providing useful error messages
  to users](https://developers.google.com/datastudio/connector/error-handling).
- **Using the sampleExtraction property**  
  Example of returning pre-defined sample data-set for more efficient
  `getData()` queries when sampleExtraction is `true`. Learn more about
  [sampleExtraction](https://developers.google.com/datastudio/connector/reference#getdata).
