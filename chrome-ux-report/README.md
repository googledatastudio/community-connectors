# Chrome UX Report Community Connector for Data Studio

![Screenshot of a dashboard using Chrome UX Report Community Connector][screenshot]
*This is not an official Google product*

This [Data Studio] [Community Connector] lets users query the [Chrome UX Dataset]
from [Chrome User Experience Report] for a defined URL/origin.

You can try out the managed deployment of the latest code: [Chrome UX Report Community Connector]

## How this connector fetches data

The [Chrome UX Dataset] is stored in [BigQuery]. Instead of fetching data from BigQuery for every `getData()` call, the connector uses multiple levels of caching. BigQuery query results are stored first in a [Firebase Realtime Database] cache and then in [Apps Script cache]. Next time a `getData()` call is made for the same URL, the data is fetched from the Apps Script cache. If the Apps Script cache has timed out, data is fetchef from Firebase and again cached in Apps Script cache. When the dataset in BigQuery is updated, admins of the connector can flush the entire cache in Firebase and Apps Script and force the connector to read from BigQuery again.

Here's a quick diagram of this flow:

![Data flow for the Chrome UX connector][data flow]

## Deploy the Community Connector yourself

1. To use this connector, you will need to create two service accounts in a Google Cloud Platfrom project. View the GCP guide on [Creating and Managing Service Accounts]. One service account should have [BigQuery] read and job creation role while the other one needs to have access to create and edit [Firebase Realtime Database].

1. Follow the [deployment guide].

1. Update the `init()` function in `utils.js` file to include the following values:
    - List of admin users
    - Last update date of the [Chrome UX Dataset] (usually current or last month)
    - Credentials and project Id for the BigQuery service account
    - Credentials and project Id for the Firebase service account

1. Run the `init()` function in Apps Script UI. (Run > Run Function > init)

## Examples and use cases covered in the connector

- Using service accounts to acceess APIs and services.
- Using Apps Script services including Lock Service and Cache service.
- Using `isAdminUser()` to provide additional config options to user.

[Data Studio]: https://datastudio.google.com
[Community Connector]: https://developers.google.com/datastudio/connector
[screenshot]: ./screenshot.png
[data flow]: ./chrome-ux-connector-data-flow.png
[Chrome UX Dataset]: https://bigquery.cloud.google.com/dataset/chrome-ux-report:all
[Chrome User Experience Report]: https://developers.google.com/web/tools/chrome-user-experience-report/
[Chrome UX Report Community Connector]: https://datastudio.google.com/datasources/create?connectorId=AKfycbwRgy2UDKRX3gIUi1EEDw5TlrhfcBtEEqJHqeJrd5F4uvezRsMKdBvs8ajAr7JfDWE
[Creating and Managing Service Accounts]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[deployment guide]: ../deploy.md
[BigQuery]: https://bigquery.cloud.google.com
[Firebase Realtime Database]: https://firebase.google.com/docs/database/
[Apps Script cache]: https://developers.google.com/apps-script/reference/cache/