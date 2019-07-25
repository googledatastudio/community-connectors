# SENUTO Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio] [Community Connector] lets users query data from [senuto].

This connector uses the [example keywords domain statistic api].


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

### Senuto Connector Configuration

**SecurityID**, **Domain**
- Enter the security code and domain for which you want to fetch data.
- SecurityID - you can find in your application at app.senuto.com. 

## Troubleshooting

### This app isn't verified

When authorizing the community connector, if you are presented with an
"unverified" warning screen see [This app isn't verified] for details on how to
proceed.

### Support

[Integration of Data with Data Studio – a step-by-step manual]

[Data Studio]: https://datastudio.google.com
[Community Connector]: https://developers.google.com/datastudio/connector
[senuto]: https://www.senuto.com/en/
[example keywords domain statistic api]: ./example.md
[deployment guide]: ../deploy.md
[Use a Community Connector]: https://developers.google.com/datastudio/connector/use
[revoke access]: https://support.google.com/datastudio/answer/9053467
[connector list]: https://datastudio.google.com/c/datasources/create
[creating a new data source]: https://support.google.com/datastudio/answer/6300774
[This app isn't verified]: ../verification.md
[Integration of Data with Data Studio – a step-by-step manual]: https://wiki.senuto.com/l/en/additional-functions/integration-of-data-with-data-studio-a-step-by-step-manual