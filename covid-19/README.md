# COVID-19 Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio] [Community Connector] lets users query JHU CSSE COVID-19 data via [NovelCOVID-19 API](https://github.com/NovelCOVID/API).

## Set up the Community Connector for personal use

To use this Community Connector in Data Studio there is a one-time setup to
deploy your own personal instance of the connector using Apps Script.

## Deploy the connector

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

### Limitations
- Currently, it only queries all historical data.