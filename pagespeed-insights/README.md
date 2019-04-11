# PageSpeed Insights Community Connector

*This is not an official google product*

This [Data Studio] [community connector] lets
you see the Google [PageSpeed Insights] score for a given
page on your website.

This community connector uses the [Google PageSpeed Insights API].

## Try the connector in Data Studio

You can try out the [managed deployment][production deployment] of the latest
code.

### Usage

1. Get a free api key from google. Visit the [page speed insights tutorial]
   and click the `get key` button to get your api key.
1. Paste the key into the credentials box.

## Deploy the connector yourself

Use the [deployment guide] to deploy the community connector
yourself.


## Examples and use cases covered in the connector

- **3rd party key based authentication** This community connector requires the
  use of a third-party 'key' based authentication.
- **error handling and messaging** Example of using [error handling] methods
  and providing useful error messages to users.
- **using a 3rd party api which returns the configuration as part of the data
  studio results** The connector uses a 3rd party api to get the page speed
  score, and also returns the configuration which was set by the user as a
  custom dimension.

## Next Steps

There are a few next steps that could improve this connector. please feel free
to open a PR with any of these improvements.

1. Refactor the Connector to use the new Data connector Service.
2. Listing the actual opportunities that are not complied with as a separate set of dimensions
   to be displayed in a table.
3. Better error handling when the url is not valid or if the api key expires/
   goes over quota.
4. Add Configuarable cacheing using Data Studio api
## Changelog
### Version 2.0
1. Breaking out mobile and desktop score into separate metrics
2. Adding the count of the number of opportunities to improve the url
3. Added a direct link to the actual report on the web

If you have any feedback, feel free to tweet at [@ukdatageek] (the original
author of this connector), or open an issue in the repo.

## To Contribute:
1. Fork this project and make your changes.
2. Make sure you run `prettier --write "**/*.js"` on your code before you push to make your code look great and easy to read.
3. Raise an issue in github and describe what you are going to fix
4. Push your changes to branch with the issue name in it eg 145/update-api-to-v5
5. Create a pull request with details of the change


[@ukdatageek]: https://twitter.com/ukdatageek
[Data Studio Community Connector GitHub]: https://github.com/googledatastudio/community-connectors/issues
[error handling]: https://developers.google.com/datastudio/connector/error-handling
[Page Speed Insights Tutorial]: https://developers.google.com/speed/docs/insights/v4/first-app
[PageSpeed Insights]: https://developers.google.com/speed/pagespeed/insights/
[Google PageSpeed Insights API]: https://developers.google.com/speed/docs/insights/v5/get-started
[production deployment]: https://datastudio.google.com/datasources/create?connectorId=AKfycbxNlR9D-nb_2du5Zm9HfgsdeIrfr42IRY47qrUiApsnKaLq4D9UXDqGwSTrXWLF4S3qRw
[appsscript]: https://script.google.com
[data studio]: https://datastudio.google.com
[community connector]: https://developers.google.com/datastudio/connector
[deployment guide]: ../deploy.md
