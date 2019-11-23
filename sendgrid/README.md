# SendGrid Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio](https://datastudio.google.com) [Community Connector](https://developers.google.com/datastudio/connector) lets you connect to [SendGrid](https://sendgrid.com/)'s [Global Stats API](https://sendgrid.com/docs/API_Reference/Web_API_v3/Stats/global.html) and provide all of your user’s email statistics for a given date range.

![sendgrid-global-stats-data-studio-template](https://raw.githubusercontent.com/schoraria911/gds-community-connectors/master/SendGrid/Global%20Stats/images/sendgrid-global-stats-data-studio-template.png)
*This visualisation is based on a [dummy data set](https://docs.google.com/spreadsheets/d/1SRjFAKN0qJGWjHy_wZNqz8n6Hrjg0NTlx14VXqTaMpc/edit?usp=sharing) that mimics the API response data structure*.

## Set up the Community Connector for personal use

To use this Community Connector in Data Studio there is a one-time setup to deploy your own personal instance of the connector using [Apps Script](https://developers.google.com/apps-script).

### Deploy the connector

#### Method 1

Follow the [deployment guide](https://github.com/googledatastudio/community-connectors/blob/master/deploy.md) to deploy the Community Connector.

#### Method 2

**Make a copy** of [this script](https://script.google.com/d/1lumxFV7wE0V3mTHrENuSx3rT9XEywJeXYT9dLAz3y-80J_hQR4UoyAS7/edit?usp=sharing) and then **Deploy from manifest...**

## Using the connector in Data Studio

Once you've set up and deployed the connector, follow the [Use a Community Connector](https://developers.google.com/datastudio/connector/use) guide to use the connector in Data Studio.

**Note**: After using the connector in Data Studio, as long as you do not [revoke access](https://support.google.com/datastudio/answer/9053467), it will remain listed in the [connector list](https://datastudio.google.com/c/datasources/create) for easy access when [creating a new data source](https://support.google.com/datastudio/answer/6300774).

### Authentication: API Key

Authenticate to the SendGrid API by [creating an API Key](https://sendgrid.com/docs/ui/account-and-settings/api-keys/#creating-an-api-key) in the Settings section of the SendGrid UI.

> SendGrid recommends API Keys because they are a secure way to talk to the SendGrid API that is separate from your username and password. If your API key gets compromised in any way, it is easy to delete and create a new one and update your environment variables with the new key. An API key permissions can be set to provide access to different functions of your account, without providing full access to your account as a whole.

Refer [SendGrid > Authentication](https://sendgrid.com/docs/API_Reference/Web_API_v3/How_To_Use_The_Web_API_v3/authentication.html#-API-key-recommended).

You will be prompted to enter this **Key** while setting up the connector for the first time.

![enter-api-key](https://raw.githubusercontent.com/schoraria911/gds-community-connectors/master/SendGrid/Global%20Stats/images/sendgrid-enter-api-key.png)

## Troubleshooting

### This app isn't verified

When authorizing the community connector, if you are presented with an "unverified" warning screen see [This app isn't verified](https://github.com/googledatastudio/community-connectors/blob/master/verification.md) for details on how to proceed.

### Start date is too far in the past

SendGrid's [stats APIs](https://sendgrid.com/docs/API_Reference/Web_API_v3/Stats/index.html) provide a read-only access to your email statistics that are available only for the last **3 years** and so if you stumble upon the following error, please change the date range from the data studio viz.

```
{
    "errors": [
        {
            "message": "start date is too far in the past",
            "field": "start_date"
        }
    ]
}
```

## Developer examples covered in the connector

- Using `AuthType.KEY` along with `setCredentials` for [authentication](https://developers.google.com/datastudio/connector/auth)
- Implementing [Properties Service > User Properties](https://developers.google.com/apps-script/reference/properties/properties-service#getuserproperties) to store and serve SendGrid API Key
