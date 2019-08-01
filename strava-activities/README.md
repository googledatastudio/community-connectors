# Strava Activities Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio] [Community Connector] queries Strava activity data for an
authenticated user.

This connector uses the [Strava API].

## Set up the Community Connector for personal use

To use this Community Connector in Data Studio there is a one-time setup to
deploy your own personal instance of the connector using Apps Script. The
connector also requires additional setup in Strava to configure OAuth.

### 1. Deploy the connector

Follow the [deployment guide] to deploy the Community Connector.

### 2. Strava OAuth Configuration

1.  Create a [Strava API Application] 
1.  Set the `Authorization Callback Domain` to `script.google.com`
1.  Make note of your `Client ID` and `Client Secret`.
1.  Visit [Google Apps Script] and open your Strava connector Apps Script
    project. Click **File** -> **Project Properties** -> **Script Properties**.
    Using the information obtained from Strava, add the following key-value
    pairs as script properties:

    Key                   | Value
    --------------------- | --------------------
    `OAUTH_CLIENT_ID`     | {YOUR CLIENT ID}
    `OAUTH_CLIENT_SECRET` | {YOUR CLIENT SECRET}

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

## Developer examples and use cases covered in the connector

-   **DataStudioApp** Example of using the DataStudioApp Service in Apps
    Scripts.
-   **Caching** Example of using the Apps Scripts [CacheService] to improve the
    average performance of the connector.
-   **OAUTH2 Authentication** Example of using OAUTH2 for authentication.
-   **Using Project Properties** Example of how to use Project Properties
    (Specifically Script Properties) to save data needed for script execution.
    Script Properties are useful in situations where values are needed for
    script execution, but shouldn't be put into source files. In this case, we
    put an OAUTH2 "client id" and "client secret" into the Script Properties.
-   **Testing Your Connector** Example of how you can use simple Apps Script
    functions for testing behavior.

[Data Studio]: https://datastudio.google.com
[Community Connector]: https://developers.google.com/datastudio/connector
[Strava API]: https://developers.strava.com/docs/reference/#api-Activities-getLoggedInAthleteActivities
[deployment guide]: ../deploy.md
[Strava API Application]: https://www.strava.com/settings/api
[Google Apps Script]: https://script.google.com
[Use a Community Connector]: https://developers.google.com/datastudio/connector/use
[revoke access]: https://support.google.com/datastudio/answer/9053467
[connector list]: https://datastudio.google.com/c/datasources/create
[creating a new data source]: https://support.google.com/datastudio/answer/6300774
[This app isn't verified]: ../verification.md
[CacheService]: https://developers.google.com/apps-script/reference/cache/cache-service
