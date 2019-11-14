# GitHub Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio][data studio] [Community Connector][community connector] lets you query data about repositories in GitHub.

![Data Studio Report using the GitHub Community Connector][github report]

## Set up the Community Connector for personal use

To use this Community Connector in Data Studio there is a one-time setup to
deploy your own personal instance of the connector using Apps Script. The
GitHub connector also requires additional setup in GitHub to configure OAuth.

### 1. Deploy the connector
Follow the [deployment guide] to deploy the Community
Connector.

Make a note of the Script ID for the connector, you'll need it for the next
step.

- To find your `YOUR_SCRIPT_ID`, Visit [Apps Script], then click on
  **File** -> **Project Properties**, and you'll see the id under the **Info**
  tab.

### 2. GitHub OAuth App
The GitHub connector requires an OAuth 2.0 client. Follow the steps below to
complete the connector setup.

1. Go to [GitHub developer settings][github settings].
1. Click on *New OAuth app*.
1. Complete the form...

  | Text Field                     | Response                                                         |
  |  ------------------------------|------------------------------------------------------------------|
  | **Application Name**           | GitHub Community Connector                                       |
  | **Homepage URL**               | https://github.com/googledatastudio/community-connectors/tree/master/github                |
  | **Application Description**    | This application...                                              |
  | **Authorization callback URL** | https://script.google.com/macros/d/{YOUR_SCRIPT_ID}/usercallback |

  **Note: While you can choose your own values for "Application Name",
  "Homepage URL", and "Application Description", you must follow the pattern
  for the "Authorization callback URL" in the table above. Replace
  `YOUR_SCRIPT_ID` with the value you noted in step #1.**

1. Click `Register application`.
1. Visit [Apps Script] and open your GitHub connector Apps Script
   project. Click on **File** -> **Project Properties** ->
   **Script Properties**.
1. Add the following key-value pairs as script properties:

  | Key                   | Value                |
  |-----------------------|----------------------|
  | `OAUTH_CLIENT_ID`     | {YOUR CLIENT ID}     |
  | `OAUTH_CLIENT_SECRET` | {YOUR CLIENT SECRET} |

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

- **OAUTH2 Authentication**  
  Example of how to authenticate with 3rd party `OAUTH2`, in this case, GitHub's
  OAuth 2.0 service.
- **Using Project Properties**  
  Example of how to use Project Properties (Specifically Script Properties) to
  save data needed for script execution. Script Properties are useful in
  situations where values are needed for script execution, but shouldn't be put
  into source files. In this case, we put an OAUTH2 "client id" and "client
  secret" into the Script Properties.

[github report]: Example-GitHub-Report.png
[deployment guide]: ../deploy.md
[github settings]: https://github.com/settings/developers
[Apps Script]: https://script.google.com
[data studio]: https://datastudio.google.com
[community connector]: https://developers.google.com/datastudio/connector
[revoke access]: https://support.google.com/datastudio/answer/9053467
[connector list]: https://datastudio.google.com/c/datasources/create
[creating a new data source]: https://support.google.com/datastudio/answer/6300774
[Use a Community Connector]: https://developers.google.com/datastudio/connector/use
[This app isn't verified]: ../verification.md