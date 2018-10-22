# Strava Activities Connector

*This is not an official Google product*

This [Data Studio] [Community Connector] queries Strava activity data for an
authenticated user.

This connector uses the [Strava API].

## Deploy the Community Connector yourself

To deploy this community connector:

1. Add the OAUTH2 library to your script.
1. Configure a Strava OAUTH2 Application.
1. Follow common deployment steps for all connectors.

### Add the OAUTH2 library to your Script

1.  Follow setup as described in the [AppsScript OAUTH2 README]

    **Note: Only complete the steps under the "Setup" heading. The rest will be
    covered below.**

### Configure Meetup OAUTH App

1.  Create a [Strava API Application] 
1.  Set the `Authorization Callback Domain` to `script.google.com`
1.  Make note of your `Client ID` and `Client Secret`.
1.  Open this script in [Google Apps Script], then click **File** ->
    **Project Properties** -> **Script Properties**.
1.  Add the following key-value pairs.

    Key                   | Value
    --------------------- | --------------------
    `OAUTH_CLIENT_ID`     | {YOUR CLIENT ID}
    `OAUTH_CLIENT_SECRET` | {YOUR CLIENT SECRET}

### Follow [deployment guide]

Use the [deployment guide] to deploy the Community Connector yourself.


## Examples and use cases covered in the connector

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

[Data Studio]: 
[Data Studio]: https://datastudio.google.com
[Community Connector]: https://developers.google.com/datastudio/connector
[Strava API]: https://developers.strava.com/docs/reference/#api-Activities-getLoggedInAthleteActivities
[deployment guide]: ../deploy.md
[AppsScript OAUTH2 README]: https://github.com/googlesamples/apps-script-oauth2
[Strava API Application]: https://www.strava.com/settings/api
[Google Apps Script]: https://script.google.com
[CacheService]: https://developers.google.com/apps-script/reference/cache/cache-service
