
# Slack Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio] [Community Connector] lets users query the [Slack] app for
specific Channels.

This Community Connector uses the `history` endpoint of the [Slack API].

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

### Slack connector configuration

The following configuration parameters are available:

- **`Token`**  (required)
 you need an access token to get the contents of the slack Channel.If you don't have one you can generate it [here](https://api.slack.com/custom-integrations/legacy-tokens)

- **`Channel`**  (required)
  Specify the Channel Id for which you need to access the messages.If you don't know the channel Id. Click [here](https://www.wikihow.com/Find-a-Channel-ID-on-Slack-on-PC-or-Mac) to know how.
  
- **`Count`** (Optional, default=100)
  Number of messages to return, between 1 and 1000.
  
- **`Inclusive`**   (Optional, default=0)
  Include messages with latest or oldest timestamp in results.
  
- **`latest`**  (Optional, default=now)
  End of time range of messages to include in results.
  
- **`oldest`**  (Optional, default=0)
  Start of time range of messages to include in results.

 - **`Unreads`**  (Optional, default=0)
  Include `unread_count_display` in the output?

## Troubleshooting

### This app isn't verified

When authorizing the community connector, if you are presented with an
"unverified" warning screen see [This app isn't verified] for details on how to
proceed.

[Data Studio]: https://datastudio.google.com
[Community Connector]: https://developers.google.com/datastudio/connector
[Slack]: https://slack.com/
[Slack API]: https://api.slack.com/methods/channels.history
[deployment guide]: ../deploy.md
[Use a Community Connector]: https://developers.google.com/datastudio/connector/use
[revoke access]: https://support.google.com/datastudio/answer/9053467
[connector list]: https://datastudio.google.com/c/datasources/create
[creating a new data source]: https://support.google.com/datastudio/answer/6300774
[This app isn't verified]: ../verification.md
