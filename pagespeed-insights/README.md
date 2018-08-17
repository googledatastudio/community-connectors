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

1. Breaking out mobile and desktop score into separate metrics
1. Listing the rules that are not complied with as a separate set of dimensions
   to be displayed in a table.
1. Better error handling when the url is not valid or if the api key expires/
   goes over quota.

If you have any feedback, feel free to tweet at [@ukdatageek] (the original
author of this connector), or open an issue in the repo.


[@ukdatageek]: https://twitter.com/ukdatageek
[Data Studio Community Connector GitHub]: https://github.com/googledatastudio/community-connectors/issues
[error handling]: https://developers.google.com/datastudio/connector/error-handling
[Page Speed Insights Tutorial]: https://developers.google.com/speed/docs/insights/v4/first-app
[PageSpeed Insights]: https://developers.google.com/speed/pagespeed/insights/
[Google PageSpeed Insights API]: https://developers.google.com/speed/docs/insights/v4/getting-started
[production deployment]: https://datastudio.google.com/datasources/create?connectorId=AKfycbxNlR9D-nb_2du5Zm9HfgsdeIrfr42IRY47qrUiApsnKaLq4D9UXDqGwSTrXWLF4S3qRw
[appsscript]: https://script.google.com
[data studio]: https://datastudio.google.com
[community connector]: https://developers.google.com/datastudio/connector
[deployment guide]: ../deploy.md
