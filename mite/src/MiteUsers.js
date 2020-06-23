var cc = DataStudioApp.createCommunityConnector();

/**
 * Mocks the Datastudio connector for the Mite users API.
 *
 * @constructor
 * @returns {MiteUsers} the connector wrapper for the Mite API
 */
function MiteUsers() {
  return this;
}

/** @constant API for active users; the relative path for the dedicated Mite API to call */
MiteUsers.API = 'users';

/** @constant API_ARCHIVED for archived users; the relative path for the dedicated Mite API to call */
MiteUsers.API_ARCHIVED = 'users/archived';

/**
 * Created the wrapper that handles all Mite and connector functionalities since this instance handles the data schema only.
 *
 * @returns {MiteInterface} - the connector and Mite API wrapper
 */
MiteUsers.prototype.createApi = function () {
  return new MiteInterface(
    this.getDimensions,
    undefined,
    'user',
    MiteUsers.API,
    MiteUsers.API_ARCHIVED
  );
};

/**
 * Gets all dimensions supported by this Mite API.
 *
 * @returns {object} an array of fields whereas each dimension is a dictionary (object in JSON notation).
 */
MiteUsers.prototype.getDimensions = function () {
  var types = cc.FieldType;

  return [
    {
      id: 'id',
      name: 'ID',
      type: types.NUMBER
    },
    {
      id: 'name',
      name: 'Name',
      filter: true,
      isDefault: true,
      type: types.TEXT
    },
    {
      id: 'email',
      name: 'Email',
      filter: true,
      type: types.TEXT
    },
    {
      id: 'note',
      name: 'Note',
      type: types.TEXT
    },
    {
      id: 'language',
      name: 'Language',
      type: types.TEXT
    },
    {
      id: 'role',
      name: 'Role',
      type: types.TEXT
    },
    {
      id: 'archived',
      name: 'Archived',
      filter: true,
      type: types.BOOLEAN
    }
  ];
};
