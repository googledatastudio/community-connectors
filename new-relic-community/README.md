# New Relic - Community Connector for Data Studio

*This is not an official New Relic product*

This [Data Studio] [Community Connector] lets you query data from some end points directly from New Relic REST API.

##⚠️ Only some GET end points is implemented at this moment

  - Violations
  - Incidents
  - Application Deployments

 - Fell free to take a look at the code and submit your PR with new end points or code improvements ;)

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

### Usage example with sample data

The following steps walk through an example of using the connector.

#### 1. Create New Relic API KEY

Before you can use New Relic's REST API or the API Explorer, you must have a REST API key for your New Relic account.

[New Relic REST API KEY]

Note the user's access key and secret; you'll need it later.

### 2. Create a data source using the connector

Use the connector to create a new data source in Data Studio. Configure the
connector as follows:

Key                      | Value
------------------------ | -----
`New Relic REST API Key` | {KEY} - From step #1.
`New Relic - End Point`  | {SELECT}

Depending on the end point selected you maybe asked for more parameters.

Click **CONNECT** and then create a report to query on thet data retrived.

## Troubleshooting

### This app isn't verified

When authorizing the community connector, if you are presented with an
"unverified" warning screen see [This app isn't verified] for details on how to
proceed.

[Data Studio]: https://datastudio.google.com
[Community Connector]: https://developers.google.com/datastudio/connector
[New Relic REST API KEY]: https://docs.newrelic.com/docs/apis/get-started/intro-apis/types-new-relic-api-keys#rest-api-key
[deployment guide]: ../deploy.md
[Use a Community Connector]: https://developers.google.com/datastudio/connector/use
[revoke access]: https://support.google.com/datastudio/answer/9053467
[connector list]: https://datastudio.google.com/c/datasources/create
[creating a new data source]: https://support.google.com/datastudio/answer/6300774
[This app isn't verified]: ../verification.md