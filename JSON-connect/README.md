# JSON connect - Community Connector for Data Studio
*This is not an official Google product*

This [Data Studio](https://datastudio.google.com) [Community
Connector](https://developers.google.com/datastudio/connector) lets users connect
to custom JSON data sources

## Try the Community Connector in Data Studio
You can try out the latest production version of [JSON connect](https://datastudio.google.com/datasources/create?connectorId=AKfycbzDZJEtN414a8F_vWQ3z9MHFJKXpXzGz8rq7De5jfPMmJz-k49Dpd4gbW5olVa0BvI)

## Configuration

### JSON data source URL
Enter the URL of a JSON data source. (Demo content: [https://jsonplaceholder.typicode.com/comments](https://jsonplaceholder.typicode.com/comments) )

In case of a "Invalid JSON format" error, validate your JSON using a validation tool like [JSONLint.com](https://jsonlint.com/) 

### Caching
Enable caching by checking the 'Cache response' checkbox. This is usefull with large datasets. The cache will expire after ten minutes. The rows in your dataset may not exceed 100KB

*The first row of the dataset is used to determine the data schema*

## Deploy a Community Connector yourself
1. Visit [Google Apps Script](https://script.google.com/) and create a new
   project.
2. You should see a shell project with a blank `myFunction` function in the
   `Code.gs` file. Delete the `myFunction` function and copy over the contents
   of the `main.js` file from the repository.
3. If the repository has any other `.js` or `.gs` file, you will need to create
   those files in Apps Scripts environment(**File > New > Script File**) and
   copy over the content.
4. In the Apps Script development environment, select **View > Show manifest
   file**. This will create a new `appsscript.json` manifest file. Remove all
   content from this manifest file and replace it with the content of the
   `appsscript.json` file in the repository.
5. To use the Community Connector in Data Studio, follow the [guide on Community
   Connector Developer
   site](https://developers.google.com/datastudio/connector/use).
