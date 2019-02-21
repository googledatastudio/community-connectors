/**
 * Declares class Config.
 */
var Config = function() {
 this.cc;
 this.config;

 this.init = function() {
  this.cc = DataStudioApp.createCommunityConnector();
  this.config = this.cc.getConfig();
 };

 this.createNewInfo = function(obj) {
  var newInfo = this.config.newInfo();
  newInfo.setId(obj.id);
  newInfo.setText(obj.text);
 };

 this.createNewTextInput = function(obj) {
  var newTextInput = this.config.newTextInput();
  newTextInput.setId(obj.id);
  newTextInput.setName(obj.name);
  newTextInput.setHelpText(obj.helpText);
  newTextInput.setPlaceholder(obj.placeholder);
 };

 this.createNewSelectSingle = function(obj1, obj2) {
  var newSelectSingle = this.config.newSelectSingle();
  newSelectSingle.setId(obj1.id);
  newSelectSingle.setName(obj1.name);
  newSelectSingle.setHelpText(obj1.helpText);
  for (var key in obj2) {
   newSelectSingle.addOption(
    this.config
     .newOptionBuilder()
     .setLabel(obj2[key])
     .setValue(key)
   );
  }
 };

 this.build = function() {
  this.config.setDateRangeRequired(true);
  return this.config.build();
 };
};
/**
 * Describes building of Serpstat configuration.
 * 
 * @returns {config}
 */
function getSerpstatConfig() {
 var config = new Config();
 config.init();
 config.createNewInfo(formDataConfig.basicInfo);
 config.createNewTextInput(formDataConfig.textInputForDomain);
 config.createNewSelectSingle(formDataConfig.selectSingleForMethod, method);
 config.createNewSelectSingle(
  formDataConfig.selectSingleForSearchEngine,
  searchEngine
 );
 return config.build();
}
/**
 * Describes validation of configuration parameters.
 *
 * @params {Object} configuration parameters.
 * @returns {Object} configuration parameters if validation is ok.
 * 
 */
function validateConfig(configParams) {
 configParams = configParams || {};
 var domain = configParams.domain;
 var se = configParams.se;
 var method = configParams.method;

 if (domain===undefined) {
  connector.throwError(translate.miss_domain, true);
 }
 if (method===undefined) {
  connector.throwError(translate.miss_method, true);
 }
 if (se===undefined) {
  connector.throwError(translate.miss_se, true);
 }
 return configParams;
}
