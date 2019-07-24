# Spotify Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio] [Community Connector] lets users query for popular tracks of
any music artist. The popularity of the tracks is given by Spotify and rated by Spotify users. 

![A Data Studio report showing Spotify data ratings][screenshot]

## Set up the Community Connector for personal use

To use this Community Connector in Data Studio there is a one-time setup to
deploy your own personal instance of the connector using Apps Script. The
connector also requires additional setup in Spotify to configure OAuth.

### 1. Deploy the connector

Follow the [deployment guide] to deploy the Community Connector.

Make a note of the Script ID for the connector, you'll need it for the next
step.

- To find your Script ID, Visit [Apps Script], then click on
  **File** -> **Project Properties**, and you'll see the id under the **Info**
  tab.

### 2. Spotify OAuth Configuration

The connector requires an OAuth 2.0 client. Follow the steps below to
complete the connector setup:

1. Visit the [Spotify developer dashboard].
1. Click **CREATE A CLIENT ID**.
1. Complete the form, use the following table for guidance:
   Text Field                     | Response
   -------------------------------|----------------------------
   **Application Name**           | Spotify Community Connector
   **Homepage URL**               | https://developers.google.com/datastudio/connector 
   **Application Description**    | This application...                                **Authorization callback URL** | https://script.google.com/macros/d/{YOUR_SCRIPT_ID}/usercallback |

  **Note: While you can choose your own values for "Application Name", "Homepage
  URL", and "Application Description", you must follow the pattern for the
  "Authorization callback URL" in the table above**.

1. Click **Register application**.
1. Visit [Apps Script] and open your Spotify connector Apps Script project.
   Click on **File** -> **Project Properties** -> **Script Properties**.
   Using the information obtained from Spotify, add the following key-value
   pairs as script properties:
   Key                   | Value
   ----------------------|----------------------
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

## Examples and use cases covered in the connector

- **OAUTH2 Authentication**  
  Example of how to authenticate with 3rd party OAUTH2, in this case, Spotify's
  OAUTH2 service.
- **Using Project Properties**  
  Example of how to use Project Properties (Specifically Script Properties) to
  save data needed for script execution. Script Properties are useful in
  situations where values are needed for script execution, but shouldn't be put
  into source files. In this case, we put an OAUTH2 "client id" and "client
  secret" into the Script Properties.

[Data Studio]: https://datastudio.google.com
[Community Connector]: https://developers.google.com/datastudio/connector
[screenshot]: ./Spotify.png?raw=true
[deployment guide]: ../deploy.md
[Spotify developer dashboard]:https://developer.spotify.com/dashboard/applications
[deployment guide]: ../deploy.md
[Apps Script]: https://script.google.com
[Use a Community Connector]: https://developers.google.com/datastudio/connector/use
[revoke access]: https://support.google.com/datastudio/answer/9053467
[connector list]: https://datastudio.google.com/c/datasources/create
[creating a new data source]: https://support.google.com/datastudio/answer/6300774
[This app isn't verified]: ../verification.md
