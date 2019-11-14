/**
 * Builds the Community Connector config.
 * @return {Config} The Community Connector config.
 * @see https://developers.google.com/apps-script/reference/data-studio/config
 */
function getConfig() {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config.newInfo()
      .setId('instructions')
      .setText('Enter the following information to connect to Jira Cloud.');
  
  config.newTextInput()
      .setId('host')
      .setName('Host')
      .setHelpText('Jira cloud host')
      .setPlaceholder('examplehost.atlassian.net')
      .setAllowOverride(true);
  
  config.newTextInput()
      .setId('username')
      .setName('Username')
      .setHelpText('Email linked to Jira Cloud account')
      .setPlaceholder('example@email.com')
      .setAllowOverride(true);

  config.newTextInput()
      .setId('apiToken')
      .setName('Jira Cloud API token.')
      .setHelpText('you can create a token in https://id.atlassian.com/manage/api-tokens')
      .setPlaceholder('iUXodSclgC5Pxk9lTmAY2C1B')
      .setAllowOverride(true);
  
  config.newTextInput()
      .setId('projects')
      .setName('Projects')
      .setHelpText('Enter projects keys separated by comma.')
      .setPlaceholder('AA,BB,CC')
      .setAllowOverride(true);
  
  config.newTextInput()
      .setId('additionalQuery')
      .setName('Additional Query')
      .setHelpText('Enter additional JQL to refine search.')
      .setPlaceholder('assignee in (enmanuel_parache)')
      .setAllowOverride(true);
  
  config.newTextInput()
      .setId('maxResults')
      .setName('The maximum number of issues to return (defaults to 50).')
      .setPlaceholder('50')
      .setAllowOverride(true);
  
  config.newSelectSingle()
      .setId('dateForQuery')
      .setName('Date for query')
      .setHelpText('Select the type of date to filter')
      .setAllowOverride(true)
      .addOption(config.newOptionBuilder().setLabel('None').setValue('none'))
      .addOption(config.newOptionBuilder().setLabel('Date created').setValue('created'))
      .addOption(config.newOptionBuilder().setLabel('Date updated').setValue('updated'))
      .addOption(config.newOptionBuilder().setLabel('Date resolved').setValue('resolved'))
      .addOption(config.newOptionBuilder().setLabel('Date status category changed').setValue('statusCategoryChangedDate'))
      .addOption(config.newOptionBuilder().setLabel('Due date').setValue('duedate'));
  
  config.setDateRangeRequired(true);

  return config.build();
}