# webtrends
Webtrends Community Connector for Google Data Studio

*This is not an official Google product*

This [Data Studio](https://datastudio.google.com) [Community
Connector](https://developers.google.com/datastudio/connector) allows users to access all of their [Webtrends](https://www.webtrends.com/) data in Google Data Studio. This Community Connector uses the **Webtrends API**.

## Try the Community Connector in Data Studio

You can try out the managed deployment of the latest code: [Webtrends Community Connector](https://datastudio.google.com/datasources/create?connectorId=AKfycbzSrtEqnF5eyipfxPs9jmfYpXHZXGZoW7DFiYLhYTgo5GbQsuXjNeU0OKoxTrN4SHT7TA)
This community connector require the authentication credentials to login to your Webtrends account.

## Deploy the Community Connector yourself

Use the [deployment guide](../deploy.md) to deploy the Community Connector yourself.

##
For information on how to use the connector and support requests refer to the dedicated page on the developer's website: [appsscript.it](http://www.appsscript.it/articoli/data-studio-connector-webtrends-connettore-personalizzato/).

## Examples and use cases covered in the connector

- **USER_PASS authentication**  
  This community connector require the authentication credentials to login to your Webtrends account.
  Once the login credentials have been approved, it will be enough to provide the ID of your Webtrends Account and the ID of the Report you want to query before connecting.
- **Dynamic Schema**  
  Example of automatic generation of a dynamic schema based on the response of the requested Report ID, [getSchema()](https://developers.google.com/datastudio/connector/reference#getschema).
