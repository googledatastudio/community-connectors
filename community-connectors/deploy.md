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
