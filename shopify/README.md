# Shopify Community Connector for Data Studio

*This is not an official Google product* [Brought to you by Sysharmony.com](https://sysharmony.com/datastudio/shopify/)

This [Data Studio](https://datastudio.google.com/) [Community Connector](https://developers.google.com/datastudio/connector) lets users query their Shopify sales. 

![alt text](https://sysharmony.com/static/images/SHopify_by_sysharmony_green-1.png "Green demo")

![alt text](https://sysharmony.com/static/images/Shopify_by_SysHarmony_Dark-1.png "Dark demo")


## Set up the Community Connector for personal use

To use this Community Connector in Data Studio there is a one-time setup to
deploy your own personal instance of the connector using Apps Script. The
connector also requires additional setup in Spotify to configure OAuth.

### 1. Deploy the connector

Follow the [deployment guide](https://github.com/googledatastudio/community-connectors/blob/master/deploy.md) to deploy the Community Connector.

Make a note of the Script ID for the connector, you'll need it for the next
step.

- To find your Script ID, Visit [Apps Script](https://script.google.com/), then click on
  **File** -> **Project Properties**, and you'll see the id under the **Info**
  tab.

### 2. Shopify auth configuration
  1. In username enter your Shopify url, example: mystore.myshopify.com
  2. In token enter your Shopify private app token (make sure it has order_read when creating it).
   [check this page for more: https://shopify.dev/tutorials/authenticate-a-private-app-with-shopify-admin#generate-private-app-credentials](https://shopify.dev/tutorials/authenticate-a-private-app-with-shopify-admin#generate-private-app-credentials)
## Using the connector in Data Studio

Once you've set up and deployed the connector, follow the
[Use a Community Connector](https://developers.google.com/datastudio/connector/use) guide to use the connector in Data Studio.

**Note**: After using the connector in Data Studio, as long as you do not
[revoke access](https://support.google.com/datastudio/answer/9053467), it will remain listed in the [connector list](https://datastudio.google.com/c/datasources/create) for easy access
when [creating a new data source](https://support.google.com/datastudio/answer/6300774).

## Troubleshooting

### This app isn't verified

When authorizing the community connector, if you are presented with an
"unverified" warning screen see [This app isn't verified](https://github.com/googledatastudio/community-connectors/blob/master/verification.md) for details on how to
proceed.
