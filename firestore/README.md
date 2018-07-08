# Google Cloud Firestore Connector for Data Studio

*This is not an official Google product*

This [Data Studio][_datastudio] [Community Connector][_cc] allows users to query
arbitrary data from a [Google Cloud Firestore][_firestore] collection. This 
connector uses the Cloud Firestore [REST API][_firestore_rest].

## Auth

In the Firebase Console, go to the Settings > Service Accounts page and "Generate new private key". The username is client_email and the password is the private_key.

## Known Issues

This connector currently handles only simple cases. Potential future features include
the following:

-   Add support for additional field types. There is currently support for string, 
number, boolean, and timestamp. There is no support for nested collections.
-   Improve efficiency. We're generally fetching more data than we need.


[_datastudio]: https://datastudio.google.com
[_cc]: https://developers.google.com/datastudio/connector
[_firestore]: https://firebase.google.com/docs/firestore/
[_firestore_rest]: https://firebase.google.com/docs/firestore/use-rest-api
