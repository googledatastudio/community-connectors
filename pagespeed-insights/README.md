#  Page Speed Insights Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio](https://datastudio.google.com) [Community
Connector](https://developers.google.com/datastudio/connector) lets you see the Google  [PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/)
[npm](https://www.npmjs.com/) Score for a given page on your website. 

This Community
Connector uses the [Google PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v4/getting-started).

## Try the Community Connector in Data Studio

You can try out the managed deployment of the latest code: [Google PageSpeed Insights Connector](https://datastudio.google.com/datasources/create?connectorId=AKfycbw1pETrN_hM4lFV3z9pexkrWu9ZZppTxoC6hopYCo9zN_KR1a52HKM5Aws4RKJj4aKN)

# Deploy the Community Connector yourself

Use the [deployment guide](../deploy.md) to deploy the Community Connector
yourself. After completing the steps in the deployment guide, 

To use it -

1. you need a free api key from Google which you can get from this [Page Speed Insights tutorial post](https://developers.google.com/speed/docs/insights/v4/first-app)

2. Click `Get Key` button

3. Paste the key in once you hve added the [Google PageSpeed Insights Connector](https://datastudio.google.com/datasources/create?connectorId=AKfycbw1pETrN_hM4lFV3z9pexkrWu9ZZppTxoC6hopYCo9zN_KR1a52HKM5Aws4RKJj4aKN)



## Examples and use cases covered in the connector

- **3rd Party Key based authentication**  
  This community connector requires the use of a third-party 'key' based authentication.  I have also done some rudimentary validating of the key eg checking for blank/ null values.
- **Error handling and messaging**  
  Example of using [error handling methods and providing useful error messages
  to users](https://developers.google.com/datastudio/connector/error-handling).
- **Using a 3rd party Api which returns the configuration as part of the Data Studio results**  
  The connector uses a 3rd Party api to get the page speed score, but also returns the configuration which was set by the user as a custom dimension. 

##Roadmap 
Since this is a Google owned product- I assume (and hope) others in Google/ the web performance / analytics community would like to add more features to it - such as : 
1. breaking out mobile and desktop score into seperate metrics
2. Listing the rules that are not complied with as a separate set of dimensions to be displayed in a table.  
3. Other cool ideas to help improve speed of websites. 

Any feedback - feel free to add issue or tweet me on [@ukdatageek](https://twitter.com/ukdatageek)