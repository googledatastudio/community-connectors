# Chrome UX Report Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio][Community Connector] lets users query the [Chrome UX Dataset]
from [Chrome User Experience Report] for a defined URL/origin.

Visit [Chrome UX Report Community Connector] to try the connector. *Note that this example code may not necessarily reflect the version used by the connector in production.*

![Screenshot of a dashboard using Chrome UX Report Community Connector][screenshot]

## How this connector fetches data

The [Chrome UX Dataset] is stored in [BigQuery]. Instead of fetching data from
BigQuery for every `getData()` call, the connector uses multiple levels of
caching. BigQuery query results are stored first in a
[Firebase Realtime Database] cache and then in [Apps Script cache]. Next time a
`getData()` call is made for the same URL, the data is fetched from the Apps
Script cache. If the Apps Script cache has timed out, data is fetchef from
Firebase and again cached in Apps Script cache. When the dataset in BigQuery is
updated, admins of the connector can flush the entire cache in Firebase and Apps
Script and force the connector to read from BigQuery again.

The following diagram illustrates the data fetch flow:

![Data flow for the Chrome UX connector][data flow]

## Set up the Community Connector for personal use

To use this Community Connector in Data Studio there is a one-time setup to
deploy your own personal instance of the connector using Apps Script. The Chrome
UX Report connector also requires additional setup in Google Cloud Platform and
Apps Script to configure authentication.

### 1. Deploy the connector

Follow the [deployment guide] to deploy the Community Connector.

### 2. Configure a Google Cloud Platform project

Create two service accounts in a Google Cloud Platfrom project. View the GCP
guide on [Creating and Managing Service Accounts]. One service account should
have [BigQuery] read and job creation role while the other one needs to have
access to create and edit [Firebase Realtime Database].

### 2. Configure the connector Apps Script project

1.  Update the `init()` function in `utils.js` file to include the following
    values:

    -   List of admin users
    -   Last update date of the
        [Chrome UX Dataset](usually current or last month)
    -   Credentials and project Id for the BigQuery service account
    -   Credentials and project Id for the Firebase service account

1.  Run the `init()` function in Apps Script UI. (Run > Run Function > init)

## Using the connector in Data Studio

Once you've set up and deployed the connector, follow the
[Use a Community Connector] guide to use the connector in Data Studio.

**Note**: After using the connector in Data Studio, as long as you do not
[revoke access], it will remain listed in the [connector list] for easy access
when [creating a new data source].

## Troubleshooting

### This app isn't verified

When authorizing the community connector, if you are presented with an
"unverified" warning screen see [This app isn't verified] for details on how to
proceed.

## Developer examples covered in the connector

-   Using service accounts to acceess APIs and services.
-   Using Apps Script services including Lock Service and Cache service.
-   Using `isAdminUser()` to provide additional config options to user.

[Data Studio]: https://datastudio.google.com
[Community Connector]: https://developers.google.com/datastudio/connector
[Chrome UX Dataset]: https://bigquery.cloud.google.com/dataset/chrome-ux-report:all
[Chrome User Experience Report]: https://developers.google.com/web/tools/chrome-user-experience-report/
[screenshot]: ./screenshot.png
[data flow]: ./chrome-ux-connector-data-flow.png
[Chrome UX Report Community Connector]: https://g.co/chromeuxdash
[BigQuery]: https://bigquery.cloud.google.com
[Firebase Realtime Database]: https://firebase.google.com/docs/database/
[Apps Script cache]: https://developers.google.com/apps-script/reference/cache/
[deployment guide]: ../deploy.md
[Creating and Managing Service Accounts]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[Use a Community Connector]: https://developers.google.com/datastudio/connector/use
[revoke access]: https://support.google.com/datastudio/answer/9053467
[connector list]: https://datastudio.google.com/c/datasources/create
[creating a new data source]: https://support.google.com/datastudio/answer/6300774
[This app isn't verified]: ../verification.md
