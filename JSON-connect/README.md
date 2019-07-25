# JSON connect - Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio] [Community Connector] lets users query data from a [JSON]
data source.

![Screenshot of the JSON connect connector configuration in Data Studio][screenshot]

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

### Configuration

#### JSON data source URL
Enter the URL of a JSON data source. (Demo content: [https://jsonplaceholder.typicode.com/comments])

In case of a "Invalid JSON format" error, validate your JSON using a validation tool like [JSONLint.com].

**Note**: The first row of the dataset is used to determine the data schema.

#### Caching
Enable caching by checking the 'Cache response' checkbox. This is usefull with large datasets. The cache will expire after ten minutes. The rows in your dataset may not exceed 100KB

## Troubleshooting

### This app isn't verified

When authorizing the community connector, if you are presented with an
"unverified" warning screen see [This app isn't verified] for details on how to
proceed.

[Data Studio]: https://datastudio.google.com
[Community Connector]: https://developers.google.com/datastudio/connector
[JSON]: https://www.json.org/
[screenshot]: json-connect.png
[deployment guide]: ../deploy.md
[Use a Community Connector]: https://developers.google.com/datastudio/connector/use
[revoke access]: https://support.google.com/datastudio/answer/9053467
[connector list]: https://datastudio.google.com/c/datasources/create
[creating a new data source]: https://support.google.com/datastudio/answer/6300774
[https://jsonplaceholder.typicode.com/comments]: https://jsonplaceholder.typicode.com/comments
[JSONLint.com]: https://jsonlint.com/
[This app isn't verified]: ../verification.md