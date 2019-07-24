# Stack Overflow Questions Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio] [Community Connector] lets users query [Stack Overflow]
questions for a specific tag.

This Community Connector uses the `questions` endpoint of the
[Stack Exchange API].

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

## Developer examples and use cases covered in the connector

- **API key based authentication (shared API Key)**  
  You can use this Community Connector as an example to implement API key based
  authentication or quota management for shared API keys(i.e. instances where a
  single API key can be used for all users of the Community Connector.).
- **Logging**  
  Example of using a global flag to toggle logging and also [logging method
  parameters and output to Stackdriver].
- **Defining a namespace**  
  Example of [Defining a namespace] for your connector.
- **Caching data**  
  Example of [Using Apps Script Cache Service] to store UrlFetch results.

[Data Studio]: https://datastudio.google.com
[Community Connector]: https://developers.google.com/datastudio/connector
[Stack Overflow]: https://stackoverflow.com
[Stack Exchange API]: https://api.stackexchange.com/docs/questions
[deployment guide]: ../deploy.md
[Use a Community Connector]: https://developers.google.com/datastudio/connector/use
[revoke access]: https://support.google.com/datastudio/answer/9053467
[connector list]: https://datastudio.google.com/c/datasources/create
[creating a new data source]: https://support.google.com/datastudio/answer/6300774
[This app isn't verified]: ../verification.md
[logging method parameters and output to Stackdriver]: https://developers.google.com/datastudio/connector/debug#apps_script_logging
[Defining a namespace]: https://stackoverflow.com/questions/881515/how-do-i-declare-a-namespace-in-javascript
[Using Apps Script Cache Service]: https://developers.google.com/apps-script/reference/cache/