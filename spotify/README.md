# Spotify Community Connector for Data Studio
![Screenshot](./Spotify.png?raw=true "Screenshot")

*This is not an official Google product*

This [Data Studio][data studio] [Community Connector][community connector] lets
users search for popular tracks of any artists. The popularity of the tracks is given by Spotify and rated by Spotify users. 


## Deploy the Community Connector yourself

Use the [deployment guide][deployment guide] to deploy the Community Connector
yourself. After following these steps, you will need to additionally create an
OAUTH app through Spotify.

### Spotify OAUTH App
1. Go to [Spotify developer dashboard][spotify dashboard].
1. Click on *CREATE A CLIENT ID*.
1. Complete the form...

  | Text Field                     | Response                                                         |
  |  ------------------------------|------------------------------------------------------------------|
  | **Application Name**           | Spotify Community Connector                                       |
  | **Homepage URL**               | https://developers.google.com/datastudio/connector               |
  | **Application Description**    | This application...                                              |
  | **Authorization callback URL** | https://script.google.com/macros/d/{YOUR_SCRIPT_ID}/usercallback |

  **Note: While you can choose your own values for "Application Name", "Homepage
  URL", and "Application Description", you must follow the pattern for the
  "Authorization callback URL" in the table above**.

  To find your script_id, Visit [Apps Script][appsscript], then click on
  **File** -> **Project Properties**, and you'll see the id under the **Info**
  tab.

1. Click `Register application`.
1. Visit [Apps Script][appsscript], then click on **File** -> **Project
   Properties** -> **Script Properties**.
1. Add the following key-value pairs.

  | Key                   | Value                |
  |-----------------------|----------------------|
  | `OAUTH_CLIENT_ID`     | {YOUR CLIENT ID}     |
  | `OAUTH_CLIENT_SECRET` | {YOUR CLIENT SECRET} |

## Examples and use cases covered in the connector

- **OAUTH2 Authentication**</br>
  Example of how to authenticate with 3rd party OAUTH2, in this case, GitHub's
  OAUTH2 service.
- **Using Project Properties**</br>
  Example of how to use Project Properties (Specifically Script Properties) to
  save data needed for script execution. Script Properties are useful in
  situations where values are needed for script execution, but shouldn't be put
  into source files. In this case, we put an OAUTH2 "client id" and "client
  secret" into the Script Properties.
- **Using the sampleExtraction property**</br>
  Example of returning pre-defined sample data-set for more efficient
  `getData()` queries when sampleExtraction is `true`. Learn more about
  [sampleExtraction][sample extraction].


[deployment guide]: ../deploy.md
[spotify dashboard]: https://developer.spotify.com/dashboard/applications
[appsscript]: https://script.google.com
[data studio]: https://datastudio.google.com
[community connector]: https://developers.google.com/datastudio/connector
[sample extraction]: https://developers.google.com/datastudio/connector/reference#getdata
[production deployment]: https://datastudio.google.com/datasources/create?connectorId=AKfycbzkEs5Sz3MZsDggy1QLqwu2T39MNrv9XeC4D0F1d72SRXjpCGyGhoORniwKKgZTSoql
