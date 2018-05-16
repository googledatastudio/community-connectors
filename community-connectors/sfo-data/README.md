# SFO Airport Passenger Traffic Community Connector for Data Studio
*This is not an official Google product*

This [Data Studio Community
Connector](https://developers.google.com/datastudio/connector/) allows users to
explore passenger traffic data through San Francisco International Airport. It
uses an API provided by [DataSF](https://datasf.org/opendata/). To find out more
about the data, visit the [Data SF page on SFO air traffic passenger
statistics](https://data.sfgov.org/Transportation/Air-Traffic-Passenger-Statistics/rkru-6vcg).

You can try out the managed deployment of the latest code: [SFO Passenger
Statistics Community
Connector](https://datastudio.google.com/datasources/create?connectorId=AKfycbxgoC3YfmE4LmkxDHcNXcxLDTLBsbelLey8KbGjGBDYn3uYzS5A-x-tVC9tWnfQrN1p9g).

## Deploy the Community Connector yourself

Use the [deployment guide](../deploy.md) to deploy the Community Connector
yourself. After completing the steps in the deployment guide, 

1. Register for an account at [Data SF](https://datasf.org/)
2. [Use this guide](https://dev.socrata.com/consumers/getting-started.html) to
   register an application and get the application token.
3. Visit [Apps Script](https://script.google.com), then click on **File** -> **Project
   Properties** -> **Script Properties**.
4. Add the following key-value pair.

  | Key                   | Value                |
  |-----------------------|----------------------|
  | `APP_TOKEN`           | {YOUR_APP_TOKEN}     |

