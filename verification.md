# This app isn't verified

When authorizing a community connector, an OAuth consent screen may be
presented to you with a warning "This app isn't verified". This is because the
connector has requested authorization to make requests to an external API
(E.g. to fetch data from the service you're connecting to). If you have
followed the [deployment guide][deploy] to setup a community connector and are
using your own personal deployment you do not need to complete the verification
process and instead can continue past this warning by clicking **Advanced > Go
to {Project Name} (unsafe)**.

If you are using a community connector that you did not
[personally deploy][deploy] it is recommended that you only proceed with
community connectors from trusted sources.

For distribution or non-personal use cases the project must eventually go
through the [verification process][verify] to remove that warning and other
limitations.

For additional details see [OAuth Client Verification][verify].

[deploy]: deploy.md
[verify]: https://developers.google.com/apps-script/guides/client-verification