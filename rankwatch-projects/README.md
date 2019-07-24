# gds-project-keyword-ranks

*This is not an official Google product*

This [Data Studio] [Community Connector] allows [RankWatch] users to view
the ranks of their project for keywords on various search engines.

## Features
- Connect one project and search engine for each data source
- Get upto 5000 keywords with Rankings added in your Project
- Get the following metrics:
  - Current Rank
  - Previous Rank
  - Initial Rank
  - Highest Rank
  - Search Volume
  - Page Score
- Get Keyword, Tracked URL, Ranking URL and Date as dimensions.

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

## Troubleshooting

### This app isn't verified

When authorizing the community connector, if you are presented with an
"unverified" warning screen see [This app isn't verified] for details on how to
proceed.

[Data Studio]: https://datastudio.google.com
[Community Connector]: https://developers.google.com/datastudio/connector
[RankWatch]: https://www.rankwatch.com
[deployment guide]: ../deploy.md
[Use a Community Connector]: https://developers.google.com/datastudio/connector/use
[revoke access]: https://support.google.com/datastudio/answer/9053467
[connector list]: https://datastudio.google.com/c/datasources/create
[creating a new data source]: https://support.google.com/datastudio/answer/6300774
[This app isn't verified]: ../verification.md