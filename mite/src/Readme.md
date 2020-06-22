# Mite Connector for Google Data Studio

***Disclaimer:** This is not an official Google product*

***Copyright:** Matthias Heise, The unbelievable Machine Company GmbH, 2020*

All code is written for [Google Apps Script](https://script.google.com) that is based on JavaScript. Local source files will be based on the `*.js` pattern whereas uploaded files will be converted to `*.gs` automatically. The source code folder is structured as follows.

## Manifest: appsscript.json

The [manifest](https://developers.google.com/apps-script/manifest) describes the script (e.g. the connector). It is a [prerequisite](https://codelabs.developers.google.com/codelabs/community-connectors/#11) for [deploying](https://codelabs.developers.google.com/codelabs/community-connectors/#12) or [publishing](https://developers.google.com/datastudio/connector/pscc-requirements). Furthermore, it is essential to get the connector being visible in the [Google Data Studio gallery](https://datastudio.google.com/data) if being published.

The parameter [urlFetchWhitelist](https://developers.google.com/apps-script/manifest#whitelisting_urls) is set to `https://*.mite.yo.lk/` including the closing slash. Since the final Mite URL depends on the customer domain (e.g. [account name](https://mite.yo.lk/en/api/index.html)), it is being whitelisted using the asterix as a [wildcard](https://developers.google.com/apps-script/manifest#using_wildcards).

## Utils

The utilities are a set of functions that are commonly used in other files.

## MiteAPI

This is the low-level code that fetches data from the Mite API. It builds and encodes the `HTTP GET` query parameters and set the `HTTP headers` including the [user agent](https://mite.yo.lk/en/api/index.html#user-agent) and the [X-MiteApiKey](https://mite.yo.lk/en/api/index.html#authentication). Since the connector is a read-only data access, it support `HTTP GET` only and no `HTTP POST`.

## MiteAuth

This is the first part of the actual [connector implementation](https://developers.google.com/datastudio/connector/build). It handles the [authorization](https://developers.google.com/datastudio/connector/build#define_authentication_type_in_getauthtype) (e.g. `getAuthType()`) and the storage and retrieval of the Mite credentials (domain and API key). The code is inspired by the [Community connector for Kaggle](https://github.com/googledatastudio/community-connectors/blob/master/kaggle/src/connector.js).

## MiteConnector

This is the second part of the connector implementation. It encapsulates the functions for `getConfig()`, `getSchema` and `getData` that are essential to make the connector work with Google Data Studio. It does not contain the detailed implementation of such since those highly depend on the Mite API that the user configures for the connector (e.g. users, customers, projects, services, time entries). For details, please refer to the [Mite API](https://mite.yo.lk/en/api/index.html).

## DataCache

This encapsulates data caching for key-value pairs based on string valyes. The maximum length of a key is 255 characters, the maximum size of a value is 100kb and the maximum retention time is 6 hours.

Caching is based on [Google Cache Service](https://developers.google.com/apps-script/reference/cache/cache-service) using the user realm. It is also inspired by [this](https://medium.com/@bajena3/building-a-custom-google-data-studio-connector-from-a-z-part-2-oauth-calling-apis-caching-edb3e25b18e7) article. 

Since the resulting data may exceed the maximum of 100kb, data will be encoded to string and split into chunks. The key will include the original `HTTP GET` query string and may exceed the maximum of 255 characters. In such case, the key is converted to a 32-bit hash code (string of fixed size) using an advanced MD5 algorithm (see `Utils.cyrb53()`). This algorithm minimizes key/hashcode collisions in which the value 2 for a second key (hash code 2) would overwrite the original value 1 from another key (hash code 1) since the hashes of key 1 and key 2 would be the same. Such collisions should be avoided.

## IdCache

Unfortunately the [filter control](https://support.google.com/datastudio/answer/6312144) provided by Google Data Studio does not support key-value relationships (e.g. user name to user id). Usually it would display a user name, project name or customer name and give the corresponding user id, project id or customer id to the API. Contrary the Mite API can not filter by plain text but by ids. Therefore, all data that is being retrieved will be scanned for key-value combinations that are then cached. Whenever a new query towards the API contains a filter for that key-value combination, it will be translated so that the parameter can be added to the `HTTP GET` query thus minimizing the number of data rows in the result. If the translation fails, the parameter will not be added to the query and the resulting data will be much larger being filtered at a later stage (high-level filtering). Translation will fail only initially since resulting data is being cached (if caching is enabled). Example:

> user EQUALS John Doe > user_id EQUALS 123 > HTTP GET https://<YOUR_DOMAIN>.mite.yo.lk/?user_id=123

Key-value combinations are specified by `key` in the data schema if supported by the corresponding Mite API. This example sets the `user` name in relation to the `user_id`:

```
    {
      id:'user_id',
      name:'User ID',
      group:'user',
      filter:true,
      type:types.NUMBER
    },
    {
      id:'user',
      key:'user_id',
      group:'user',
      name:'User',
      api:'user_name',
      isDefault:true,
      type:types.TEXT
    }
``` 

## Filter

[Filters](https://developers.google.com/datastudio/connector/filters) in Google Data Studio are a series of OR filters that are then combined with an AND filter. If the connector would ignore those filters, the UI would filter the resulting data automatically. Since UI filtering is extremely slow, it is recommended to filter data inside the connector. Since the Mite API supports filters as well, filtering is split into low-level API filtering and high-level connector filtering while UI filtering is discarded.

The filters set in the report will be converted to a tree of filters that is capable of translating some filters to low-level filters that are then added to the `HTTP GET` query before being sent to the Mite API. For example

```
    dimensionsFilters: [
      [
        {
          operator: 'EQUALS', 
          fieldName: 'user_id', 
          type: 'INCLUDE', 
          values: [123]
        }
      ]
    ]
```
 
 will translate to 

> HTTP GET https://<YOUR_DOMAIN>.mite.yo.lk/?user_id=123

or

```
    dimensionsFilters: [
      [
        {
          operator: 'IN_LIST', 
          fieldName: 'user_id', 
          type: 'INCLUDE', 
          values: [123, 456]
        }
      ]
    ]
```

will translate to

> HTTP GET https://<YOUR_DOMAIN>.mite.yo.lk/?user_id=123,456

Other filters, that are not supported by the Mite API itself, are handled as high-level filters that post-filter data that has been retrieved from the Mite API). For example:

```
    dimensionsFilters: [
      [
        {
          operator: 'LIKE', 
          fieldName: 'user', 
          type: 'INCLUDE', 
          values: ['John']
        }
      ]
    ]
```

Low-level API pre-filtering is specified by `filter:true` in the data schema if supported by the corresponding Mite API. This example indicates that the Mite API supports filtering by the one or multiple `user_id`:

```
    {
      id:'user_id',
      name:'User ID',
      group:'user',
      filter:true,
      type:types.NUMBER
    },
``` 

Google Data Studio is validating each filter, but unfortunately it is not invalidating combinations of filters that do not make any sense. For example, this combination of the same boolean filter would translate to its true value. 

    dimensionsFilters: [
      [
        {
          operator: 'EQUALS', 
          fieldName: 'billable', 
          type: 'INCLUDE', 
          values: [true]
        },
        {
          operator: 'EQUALS', 
          fieldName: 'billable', 
          type: 'EXCLUDE', 
          values: [true]
        }
      ]
    ]


## MiteInterface (including data schema)

This is the third part of the actual connector implementation. It encapsulates schema handling (from the connector to Google Data Studio) and data conversion for data being retrieved from the Mite API. Any schema is being defined as JSON whereas `id`, `group` and `type` are essential for [getSchema()](https://developers.google.com/datastudio/connector/build#define_the_fields_with_getschema). See [Data types and semantic types](https://developers.google.com/datastudio/connector/semantics) for details. `key` is used to map non-id fields to their id fields (e.g. user_name to user_id). `filter:true` indicates that this field is supported by the Mite API and can be used in the `HTTP GET` query. `api` indicates that the field is named differently inside the Mite API (e.g. user in Google Data Studio and user_name in Mite). `isDefault:true` indicates that this dimension or metric is default. This eases the configuration of diagrams and filter controls in Google Data Studio.

```
    {
      id:'user',
      key:'user_id',
      group:'user',
      name:'User',
      filter:false,
      api:'user_name',
      isDefault:true,
      type:types.TEXT
    },
```

## MiteUser

Encapsulates the [Mite Users API](https://mite.yo.lk/en/api/users.html) and defines its data schema. Since this is a basic API without the requirement for a date range, the schema and data handling is done by `MiteInterface`.

## MiteServices

Encapsulates the [Mite Services API](https://mite.yo.lk/en/api/services.html) and defines its data schema. Since this is a basic API without the requirement for a date range, the schema and data handling is done by `MiteInterface`.

## MiteCustomers

Encapsulates the [Mite Customers API](https://mite.yo.lk/en/api/customers.html) and defines its data schema. Since this is a basic API without the requirement for a date range, the schema and data handling is done by `MiteInterface`.

## MiteProjects

Encapsulates the [Mite Projects API](https://mite.yo.lk/en/api/projects.html) and defines its data schema. Since this is a basic API without the requirement for a date range, the schema and data handling is done by `MiteInterface`.

## MiteTimeEntries

Encapsulates the plain (flat; ungrouped) [Mite Time Entries API](https://mite.yo.lk/en/api/time-entries.html) and defines its data schema. Since that API requires a date range and other specific parameters, its implementation differs from the `MiteInterface`.

## MiteTimeEntriesGrouped

Encapsulates the grouped [Mite Time Entries API](https://mite.yo.lk/en/api/time-entries.html#list-grouped) and defines its data schema that depends on the grouping. The handling of the hierarchic grouping (example: customer, project, user, day) and its effect on the data schema is being handled. The main functionality and data conversion is inherited from the `MiteTimeEntries`.
