# Kaggle Community Connector for Data Studio

![Screenshot](./KaggleSampleDataset.png?raw=true "Screenshot")

*This is not an official Google product*

This [Data Studio][datastudio] [Community Connector][community-connector] lets
users import any dataset from [kaggle][kaggle]. This Community Connector uses
the [Kaggle API][kaggle-api].

## Try This Connector

Click [here][managed-deployment] to try the managed deployment.

### Kaggle authentication.
1. Sign up for a [Kaggle][kaggle] account.
1. Go to the 'Account' tab of your user profile
  (https://www.kaggle.com/{username}/account) and select 'Create API Token'. This will trigger the download of kaggle.json, a file containing your API credentials.
1. Kaggle requires username and password for authentication which can be found in the downloaded kaggle.json file. The username should be used as it is whereas the "key" should be used as password for authentication. 

## Examples and use cases covered in the connector

- **Error handling and messaging** Example of using [error handling methods and
  providing useful error messages to users][error-handling].
- **Using the USER_PASS auth type** Learn more about
  [getAuthType()][getAuthType]

## Limitations

- **File types supported**</br> 
   Currently, only CSV datasets are supported.

[datastudio]: https://datastudio.google.com
[community-connector]: https://developers.google.com/datastudio/connector
[kaggle]: https://www.kaggle.com
[kaggle-api]: https://github.com/Kaggle/kaggle-api
[managed-deployment]: https://datastudio.google.com/datasources/create?connectorId=AKfycbz8WVuZI1FRHJM3g_ucqP-L7B9EIIPDsC9RofvZk1Xw-bD6p55SNjs7JudEsOYK1o2t
[error-handling]: https://developers.google.com/datastudio/connector/error-handling
[getAuthType]: https://devsite.googleplex.com/datastudio/connector/oauth2
