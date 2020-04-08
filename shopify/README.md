# Shopify Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio] [Community Connector] lets users query their Shopify sales. 



## Set up the Community Connector for personal use

To use this Community Connector in Data Studio there is a one-time setup to
deploy your own personal instance of the connector using Apps Script. The
connector also requires additional setup in Spotify to configure OAuth.

### 1. Deploy the connector

Follow the [deployment guide] to deploy the Community Connector.

Make a note of the Script ID for the connector, you'll need it for the next
step.

- To find your Script ID, Visit [Apps Script], then click on
  **File** -> **Project Properties**, and you'll see the id under the **Info**
  tab.

### 2. Shopify auth configuration
  1. In username enter your Shopify url, example: mystore.myshopify.com
  2. In token enter your Shopify private app token (make sure it has order_read when creating it).
   check this page for more: https://shopify.dev/tutorials/authenticate-a-private-app-with-shopify-admin#generate-private-app-credentials
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
