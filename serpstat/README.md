# google-data-studio-community-connector

## [Serpstat](https://serpstat.com/) Community Connector for Data Studio

This is not an official Google product.

This [Data Studio](https://datastudio.google.com/navigation/reporting) [Community Connector](https://developers.google.com/datastudio/connector/) lets users query domain history and domain competitors from [Serpstat API](https://serpstat.com/api/). 

You can take historical data on a domain’s number of keywords and visibility, for example:
* Visibility
* Site visibility
* The number of keywords found in the chosen search engine
*	Number of Ads as of "date"
*	Number of keywords in ads
* Number of new keywords
* Number of keywords which were lost by a domain in the last N-days
* Number of domain's keywords which positions have improved over the last N-days
* Number of domain's keywords which positions have dropped over the last N-days
* Verification date of a particular array element
* Approximate organic traffic prognosis

You can take data about lists domain’s competitors in top 20 Google search results, for example:
* Competitor domain
* Competitor domain's visibility
* The number of keywords found in the chosen search engine
* Approximate organic traffic prognosis
* Change in visibility since the last upgrade
* Change in the number of keywords over the last N-time
* Traffic change over the last N-time (in comparison with ""prev_date"" )
* Change in the number of keywords used in PPC Ads
* The number of acquired keywords for the domain over the last N-days
* Number of keywords lost by a domain over the last N-days
* Number of domain's keywords which positions have improved over the last N-days
* Number of domain's keywords which positions have dropped over the last N-days
* Number of keywords used by domain in PPC Ads
* Number of Ads as of "date"
*	Keywords domains have in common
* Domain's relevancy to the keyword

To use this Community Connector you need have [Serpstat account](https://serpstat.com/users/profile/).
You need to enter domain name, token for API access (from Serpstat account) and select search engine.

## Try the Community Connector in Data Studio
You can try out the managed deployment of the latest code: [Serpstat Community Connector](https://datastudio.google.com/u/0/datasources/create?connectorId=AKfycbzk-Z0rKHKgKivjJ75iClNSCNwurOx_Htis377EeSEn).

## Deploy the Community Connector yourself
Use the [deployment guide](https://github.com/googledatastudio/community-connectors/blob/master/deploy.md) to deploy the Community Connector yourself.

## Examples and use cases covered in the connector:
* Error handling and messaging

Example of using [error handling methods and providing useful error messages to users](https://developers.google.com/datastudio/connector/error-handling).