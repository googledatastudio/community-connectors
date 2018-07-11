# Kaggle Community Connector for Data Studio
![Screenshot](./KaggleSampleDataset.png?raw=true "Screenshot")
*This is not an official Google product*

This [Data Studio](https://datastudio.google.com) [Community
Connector](https://developers.google.com/datastudio/connector) lets users import any dataset from
[kaggle](https://www.kaggle.com). This Community
Connector uses the [Kaggle API](https://github.com/Kaggle/kaggle-api). Currently supports datasets in CSV format.

## Deploy the Community Connector yourself

Use the [deployment guide](../deploy.md) to deploy the Community Connector
yourself.

## Examples and use cases covered in the connector

- **Kaggle authentication required**  
  This community connector requires third-party authentication. To use the Kaggle API, sign up for a [Kaggle](https://www.kaggle.com) account. Then go to the 'Account' tab of your user profile (https://www.kaggle.com/{username}/account) and select 'Create API Token'. This will trigger the download of kaggle.json, a file containing your API credentials. 
Note: The API key obtained should be used as the password for authentication. 
- **Error handling and messaging**  
  Example of using [error handling methods and providing useful error messages
  to users](https://developers.google.com/datastudio/connector/error-handling).
- **Using the USER_PASS auth type**  
  Learn more about [getAuthType()](https://devsite.googleplex.com/datastudio/connector/oauth2)
