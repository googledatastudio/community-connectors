# SENUTO Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio](https://datastudio.google.com) [Community
Connector](https://developers.google.com/datastudio/connector) lets read about
[senuto](https://www.senuto.com/en/). This Community
Connector uses the [example keywords domain statistic
api](example.md).

## Try the Community Connector in Data Studio

You can try out the managed deployment of the latest code: [Downloads
Community
Connector](https://datastudio.google.com/datasources/create?connectorId=AKfycbxnwxQtoPTGgfcYr7hBqvc5YUTv0J6KRZ3EHmaE2oU)

## Params required to start use Senuto Connector

 **SecurityID**, **Domain**  - 
Enter the security code and domain for which you want to get the data.
SecurityID - you can find in your application app.senuto.com. 
 

## Support

[Integration of Data with Data Studio – a step-by-step manual](https://wiki.senuto.com/l/en/additional-functions/integration-of-data-with-data-studio-a-step-by-step-manual)

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
