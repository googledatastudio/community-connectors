# Google Cloud Firestore Connector for Data Studio

*This is not an official Google product*

This [Data Studio] [Community Connector] lets you query data from a
[Google Cloud Firestore] collection.

This connector uses the Cloud Firestore [REST API].

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

### Authentication

In the Firebase Console, go to the Settings > Service Accounts page and
"Generate new private key". The username is `client_email` and the password is
the `private_key`.

## Troubleshooting

### This app isn't verified

When authorizing the community connector, if you are presented with an
"unverified" warning screen see [This app isn't verified] for details on how to
proceed.

### Known Issues

This connector currently handles only simple cases. Potential future features
include the following:

-   Add support for additional field types. There is currently support for
string, number, boolean, and timestamp. There is no support for nested
collections.
-   Improve efficiency. We're generally fetching more data than we need.

[Data Studio]: https://datastudio.google.com
[Community Connector]: https://developers.google.com/datastudio/connector
[Google Cloud Firestore]: https://firebase.google.com/docs/firestore/
[REST API]: https://firebase.google.com/docs/firestore/use-rest-api
[deployment guide]: ../deploy.md
[Use a Community Connector]: https://developers.google.com/datastudio/connector/use
[revoke access]: https://support.google.com/datastudio/answer/9053467
[connector list]: https://datastudio.google.com/c/datasources/create
[creating a new data source]: https://support.google.com/datastudio/answer/6300774
[This app isn't verified]: ../verification.md
