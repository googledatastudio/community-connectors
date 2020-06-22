var cc = DataStudioApp.createCommunityConnector();

/**
 * Mocks the Datastudio connector for the Mite projects API.
 * 
 * @constructor
 * @returns {MiteProjects} the connector wrapper for the Mite API
 */
function MiteProjects() {
  return this;
}

/** @constant API for active projects; the relative path for the dedicated Mite API to call */
MiteProjects.API = 'projects';

/** @constant API_ARCHIVED for archived projects; the relative path for the dedicated Mite API to call */
MiteProjects.API_ARCHIVED = 'projects/archived';

/** 
 * Created the wrapper that handles all Mite and connector functionalities since this instance handles the data schema only. 
 * 
 * @returns {MiteInterface} - the connector and Mite API wrapper
*/
MiteProjects.prototype.createApi = function() {
  return new MiteInterface(this.getDimensions, undefined, 'project', MiteProjects.API, MiteProjects.API_ARCHIVED);
}

/** 
 * Gets all dimensions supported by this Mite API.
 * 
 * @returns {object} an array of fields whereas each dimension is a dictionary (object in JSON notation).
 */
MiteProjects.prototype.getDimensions = function() {
  var types = cc.FieldType;
  
  return [
    {
      id:'id',
      name:'ID',
      type:types.NUMBER
    },
    {
      id:'name',
      name:'Name',
      filter:true,
      isDefault:true,
      type:types.TEXT
    },
    {
      id:'note',
      name:'Note',
      type:types.TEXT
    },
    {
      id:'customer_id',
      name:'Customer ID',
      filter:true,
      type:types.NUMBER
    },
    {
      id:'customer',
      key:'customer_id',
      name:'Customer',
      api:'customer_name',
      type:types.TEXT
    },
    {
      id:'budget',
      name:'Budget',
      type:types.NUMBER
    },
    {
      id:'budget_type',
      name:'Budget Type',
      type:types.TEXT
    },
    {
      id:'hourly_rate',
      name:'Hourly Rate',
      type:types.NUMBER
    },
    {
      id:'archived',
      name:'Archived',
      filter:true,
      type:types.BOOLEAN
    },
  ];
}
