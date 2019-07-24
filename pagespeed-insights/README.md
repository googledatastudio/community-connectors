# PageSpeed Insights Community Connector for Data Studio

*This is not an official Google product*

This [Data Studio] [Community Connector] lets users query the Google
[PageSpeed Insights] score for a given page on your website.

This community connector uses the [Google PageSpeed Insights API].

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

### Authentication: API Key

The connector requires an API Key to authenticate and connect to your account.
Follow the steps below to obtain a free API key from Google:

1. Visit the [Page Speed Insights Tutorial], click **GET A KEY**.
1. Paste the key into the credentials box during connector authentication.

## Troubleshooting

### This app isn't verified

When authorizing the community connector, if you are presented with an
"unverified" warning screen see [This app isn't verified] for details on how to
proceed.

## Developer examples and use cases covered in the connector

- **3rd party key based authentication** This community connector requires the
  use of a third-party 'key' based authentication.
- **error handling and messaging** Example of using [error handling] methods
  and providing useful error messages to users.
- **using a 3rd party api which returns the configuration as part of the data
  studio results** The connector uses a 3rd party api to get the page speed
  score, and also returns the configuration which was set by the user as a
  custom dimension.

## Additional info

### Future work
There are a few next steps that could improve this connector. please feel free
to open a PR with any of these improvements.

1. Refactor the Connector to use the new Data connector Service.
2. Listing the actual opportunities that are not complied with as a separate set of dimensions
   to be displayed in a table.
3. Better error handling when the url is not valid or if the api key expires/
   goes over quota.
4. Add Configuarable cacheing using Data Studio api

### Changelog
#### Version 2.0
1. Breaking out mobile and desktop score into separate metrics
2. Adding the count of the number of opportunities to improve the url
3. Added a direct link to the actual report on the web

If you have any feedback, feel free to tweet at [@ukdatageek] (the original
author of this connector), or open an issue in the repo.

### To Contribute
1. Fork this project and make your changes.
2. Make sure you run `prettier --write "**/*.js"` on your code before you push to make your code look great and easy to read. 
3. Raise an issue in github and describe what you are going to fix 
4. Push your changes to branch with the issue name in it eg 145/update-api-to-v5
5. Create a pull request with details of the change


[Data Studio]: https://datastudio.google.com
[Community Connector]: https://developers.google.com/datastudio/connector
[PageSpeed Insights]: https://developers.google.com/speed/pagespeed/insights/
[Google PageSpeed Insights API]: https://developers.google.com/speed/docs/insights/v5/get-started
[deployment guide]: ../deploy.md
[Use a Community Connector]: https://developers.google.com/datastudio/connector/use
[revoke access]: https://support.google.com/datastudio/answer/9053467
[connector list]: https://datastudio.google.com/c/datasources/create
[creating a new data source]: https://support.google.com/datastudio/answer/6300774
[Page Speed Insights Tutorial]: https://developers.google.com/speed/docs/insights/v4/first-app
[This app isn't verified]: ../verification.md
[error handling]: https://developers.google.com/datastudio/connector/error-handling
[@ukdatageek]: https://twitter.com/ukdatageek
