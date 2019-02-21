/**
* Declares class ApiFetch.
*/
function ApiFetch() {
 this.call = function(url, method, payload) {
  if (payload === undefined) {
   payload = {};
  }
  return UrlFetchApp.fetch(url, {
   method: method,
   payload: payload
  });
 };

 this.get = function(url) {
  return this.call(url);
 };

 this.post = function(url, body) {
  return this.call(url, 'post', body);
 };
}

var api = 'https://api.serpstat.com/v3/';
var url = 'https://plugin.serpstat.com/googleDataStudio?method=';
/**
* Declares class SerpstatAPI.
*/
var SerpstatAPI = function() {
 this.api = api;
 this.url = url;
 this.fetch = new ApiFetch();
};
/**
* Describes method fetchDataFromNode of SerpstatAPI class.
* 
* @param {String} path Query parameter for building request string.
* @returns values for requested fields in predefined format.
*/
SerpstatAPI.prototype.fetchDataFromNode = function(path) {
 var url = this.url + path;
 var res = this.fetch.get(url);
 var resJson = JSON.parse(res);
 if(resJson === 500){
  connector.throwError('Internal error', true);
 }
 console.log(
  { message: 'This is res from Node' },
  { initialData: resJson }
 );

 return resJson ? resJson : [];
};
/**
 * Gets user localization.
 *
 * @returns {String} User language.
 */
function getUserLang(){
 var lang = Session.getActiveUserLocale();
 var index=lang.indexOf('_');
 if(index===-1){
   return lang;
 }
 var resLang=lang.slice(0, index);
 return resLang;
}

var lang = getUserLang();

var serpstatAPI = new SerpstatAPI();

/** 
* Gets avaliable methods from Serpstat for this connector.
*/
var method = serpstatAPI.fetchDataFromNode('avaliableMethods');

/** 
* Gets avaliable search engines from Serpstat for this connector.
*/
var searchEngine = serpstatAPI.fetchDataFromNode('searchEngine');
/** 
* Gets translate object from Serpstat for this connector according to user localization.
* Now Serpstat connector have two avaliable languages - ru and en.
*/
var translate = serpstatAPI.fetchDataFromNode(
 lang === 'ru' ? 'getTranslates&locale=ru' : 'getTranslates&locale=en'
);
/**
* Building configuration fields according to translate object.
*/
var formDataConfig = {
 basicInfo: {
  id: 'instructions"',
  text: translate.info_text
 },
 textInputForDomain: {
  id: 'domain',
  name: translate.domain_name,
  helpText: translate.domain_help,
  placeholder: translate.domain_placeholder
 },
 selectSingleForMethod: {
  id: 'method',
  name: translate.method_name,
  helpText: translate.method_help
 },
 selectSingleForSearchEngine: {
  id: 'se',
  name: translate.se_name,
  helpText: translate.se_help
 }
};
/**
* Declares class SerpstatToken.
* Inherits SerpstatAPI class.
*/
function SerpstatToken(key) {
 SerpstatAPI.call(this);
 this.key = key;
}
/**
* Declares class SerpstatData.
* Inherits SerpstatAPI class.
*/
function SerpstatData(request) {
 SerpstatAPI.call(this);
 this.request = request;
 this.method = this.request.configParams.method;
 this.domain = this.request.configParams.domain;
 this.se = this.request.configParams.se;
 this.userProperties = PropertiesService.getUserProperties();
 this.token = this.userProperties.getProperty('api_key');
}

SerpstatToken.prototype = Object.create(SerpstatAPI.prototype);

SerpstatData.prototype = Object.create(SerpstatAPI.prototype);
/**
* Describes method validateToken of SerpstatToken class.
* 
* @returns {Boolean} true if token is valid.
*/
SerpstatToken.prototype.validateToken = function() {
 var url = this.api.replace('v3', 'v1') + 'plugin/stats?token=' + this.key;
 var response = this.fetch.get(url);
 var responseAnswer = JSON.parse(response);
 if (responseAnswer.status_code === 200) {
  return true;
 } else {
  return false;
 }
};
/**
* Describes method fetchDataFromApi of SerpstatData class.
* 
* @returns {Object} values from Serpstat API request.
*/
SerpstatData.prototype.fetchDataFromApi = function() {
 var paramsArray = [
  '?query=',
  this.domain,
  '&se=',
  this.se,
  '&token=',
  this.token
 ];

 var url = this.api + this.method + paramsArray.join('');
 
 var response = this.fetch.get(url);

 var data = JSON.parse(response.getContentText());
 
 if (data.status_code !== 200) {
  connector.throwError(data.status_msg, true);
 }
 if(data.status_code === 200 && data.result.length === 0){
  connector.throwError(translate.no_result, true);
 }
 if (data.result.length === 0) {
  connector.throwError(translate.wrong_fetch, true);
 }

 return data.result;
};
