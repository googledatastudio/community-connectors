# Meetup Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio](https://datastudio.google.com) [Community
Connector](https://developers.google.com/datastudio/connector) lets users query
data for Meetups from the [Meetup API](https://secure.meetup.com/meetup_api).

## Deploy the Community Connector yourself

Use the [deployment guide](../deploy.md) to deploy the Community Connector
yourself. After following these steps, you will need to add the OAUTH library to
your script and create an OAUTH consumer through Meetup.com.

### Add the OAUTH2 library to your Script

1.  Follow setup as described in the [AppsScript OAUTH2
    README](https://github.com/googlesamples/apps-script-oauth2)

    **Note: You should only do the steps under the "Setup" heading. The rest
    will be covered in "Meetup OAUTH App" below.**

### Configure Meetup OAUTH App

1.  Go to the [Your OAuth Consumers
    page](https://secure.meetup.com/meetup_api/oauth_consumers/#).
1.  Click on *Create New Consumer*.
1.  Complete the form...

    Text Field              | Response
    ----------------------- | --------
    **Consumer Name**       | Meetup Community Connector
    **Application Website** | https://github.com/google/datastudio
    **Redirect URI**        | https://script.google.com/macros/d/{YOUR_SCRIPT_ID}/usercallback

    **Note: While you can choose your own values for "Consumer Name" and
    "Application Website", you must follow the pattern for the "Redirect URI" in
    the table above**.

    To find your script_id, Visit [Apps Script](https://script.google.com), then
    click on **File** -> **Project Properties**, and you'll see the id under the
    **Info** tab.

1.  Agree to the Platform terms of service and click `Register Consumer`.

1.  Visit [Apps Script](https://script.google.com), then click on **File** ->
    **Project Properties** -> **Script Properties**.

1.  Add the following key-value pairs.

    Key                   | Value
    --------------------- | --------------------
    `OAUTH_CLIENT_ID`     | {YOUR CLIENT ID}
    `OAUTH_CLIENT_SECRET` | {YOUR CLIENT SECRET}

## Examples and use cases covered in the connector

-   **Manual Defined Semantics** Example of how you can manually define the
    semantics for your schema fields.
-   **Caching Through Google Sheets** Example of how you can use Google Sheets
    as a caching mechanism.
-   **OAUTH2 Authentication** Example of how to authenticate with 3rd party
    OAUTH2, in this case, GitHub's OAUTH2 service.
-   **Using Project Properties** Example of how to use Project Properties
    (Specifically Script Properties) to save data needed for script execution.
    Script Properties are useful in situations where values are needed for
    script execution, but shouldn't be put into source files. In this case, we
    put an OAUTH2 "client id" and "client secret" into the Script Properties.
-   **Testing Your Connector** Example of how you can use regular javascript
    testing strategies for Community Connectors.

## Testing

To test the connector run `yarn install && yarn test`
