# Kaggle Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio] [Community Connector] lets users query datasets from
[kaggle].

This Community Connector uses the [Kaggle API].

![A report in Data Studio displaying a Kaggle dataset about FIFA players][screenshot]

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

### Authentication: Username and Token

The Kaggle connector requires a username and token to authenticate and connect
to your account. The following steps explain how to obtain the username and
token required to authenticate:

1. Sign in to your [kaggle] account or create a new account if you don't
already have one.
1. Go to the 'Account' tab of your user profile
(https://www.kaggle.com/{username}/account) and select
**Create New API Token**. This will trigger the download of kaggle.json,
a file containing your API credentials.
   - In Data Studio, when authenticating the connector use the value of
   `username` for the **Username** field and the value of `key` for
   the **Token** field.

## Troubleshooting

### This app isn't verified

When authorizing the community connector, if you are presented with an
"unverified" warning screen see [This app isn't verified] for details on how to
proceed.

### Limitations

- Currently, only CSV files up to 20MB size are supported.

[Data Studio]: https://datastudio.google.com
[Community Connector]: https://developers.google.com/datastudio/connector
[kaggle]: https://www.kaggle.com
[Kaggle API]: https://github.com/Kaggle/kaggle-api
[screenshot]: ./KaggleSampleDataset.png?raw=true
[deployment guide]: ../deploy.md
[Use a Community Connector]: https://developers.google.com/datastudio/connector/use
[revoke access]: https://support.google.com/datastudio/answer/9053467
[connector list]: https://datastudio.google.com/c/datasources/create
[creating a new data source]: https://support.google.com/datastudio/answer/6300774
[This app isn't verified]: ../verification.md
