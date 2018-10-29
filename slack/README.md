
# Slack Connector
*This is not an official Google product or a slack product*


This [Data Studio](https://datastudio.google.com)  [Community Connector](https://developers.google.com/datastudio/connector) lets users query [Slack](https://slack.com/) app for a specific Channels. This Community Connector uses the `history` end point of [Slack API](https://api.slack.com/methods/channels.history).

## Try the Community Connector in Data Studio

You can try out the managed deployment of the latest code: [Slack
Connector](https://datastudio.google.com/datasources/create?connectorId=AKfycbxiJmr3004OzoxzfQa7m-K7PDDvgpsgS5m4atgmwVA)

## Parameters required to access the connector

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

