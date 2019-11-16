# Jira Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio][data studio] [Community Connector][community connector] lets you query data about issues in Jira.

![Data Studio Report using the Jira Community Connector][jira report]

## Set up the Community Connector for personal use

To use this Community Connector in Data Studio there is a one-time setup to
deploy your own personal instance of the connector using Apps Script. The
Jira connector also requires a token to call the API.

### 1. Deploy the connector
Follow the [deployment guide] to deploy the Community
Connector.

Make a note of the Script ID for the connector, you'll need it for the next
step.

- To find your `YOUR_SCRIPT_ID`, Visit [Apps Script], then click on
  **File** -> **Project Properties**, and you'll see the id under the **Info**
  tab.

### 2. Jira access token
The Jira connector requires an API token. Follow the steps below to
complete the connector setup.

1. Go to [Atlassian account API tokens][atlassian api tokens].
2. Click on *Create API token*.
3. Add a label to your token.
4. Use your token for authentication when setting the Jira Community Connector.

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

- **Atlassian API token**  
  Example of how to create a token for Atlassian account.

[jira report]: Jira-dscc-example.png
[deployment guide]: ../deploy.md
[atlassian api token]: https://id.atlassian.com/manage/api-tokens
[Apps Script]: https://script.google.com
[data studio]: https://datastudio.google.com
[community connector]: https://developers.google.com/datastudio/connector
[revoke access]: https://support.google.com/datastudio/answer/9053467
[connector list]: https://datastudio.google.com/c/datasources/create
[creating a new data source]: https://support.google.com/datastudio/answer/6300774
[Use a Community Connector]: https://developers.google.com/datastudio/connector/use
[This app isn't verified]: ../verification.md