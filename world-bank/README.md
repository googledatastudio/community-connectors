# World Bank Health Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio] [Community Connector] lets users query global health data
from the [World Bank BigQuery public dataset].

## Set up the Community Connector for personal use

To use this Community Connector in Data Studio there is a one-time setup to
deploy your own personal instance of the connector using Apps Script. The
connector also requires additional setup in Google Cloud Platform and
Apps Script to configure authentication.

### 1. Deploy the connector

Follow the [deployment guide] to deploy the Community Connector.

### 2. Configure a Google Cloud Platform project

1. Create a service account in a Google Cloud Platfrom project. View the GCP
guide on [Creating and Managing Service Accounts]. The service account should
have [BigQuery] read and job creation role permissions.
2. [Create a Service Account Key] and download the JSON file that is generated.
[stringify] the contents of this file, which consists of a JSON object, and
copy and the output, it will be used in the next step.

### 3. Configure the connector Apps Script project

1.  Visit [Apps Script] and open your World Bank connector Apps Script project.
    Click on **File** -> **Project Properties** -> **Script Properties**.
    Using the stringified value of the Service Account Key JSON object, add the following key-value pair as a script property:
    Key                     | Value
    ---------------------   | --------------------
    `SERVICE_ACCOUNT_CREDS` | {STRINGIFIED JSON SERVICE ACCOUNT OBJECT}

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

[Data Studio]: https://datastudio.google.com
[Community Connector]: https://developers.google.com/datastudio/connector
[World Bank BigQuery public dataset]: https://console.cloud.google.com/marketplace/details/the-world-bank/global-health
[deployment guide]: ../deploy.md
[Creating and Managing Service Accounts]: https://cloud.google.com/iam/docs/creating-managing-service-accounts
[BigQuery]: https://bigquery.cloud.google.com
[Create a Service Account Key]: https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys
[stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify]]
[Apps Script]: https://script.google.com

[Use a Community Connector]: https://developers.google.com/datastudio/connector/use
[revoke access]: https://support.google.com/datastudio/answer/9053467
[connector list]: https://datastudio.google.com/c/datasources/create
[creating a new data source]: https://support.google.com/datastudio/answer/6300774
[This app isn't verified]: ../verification.md
