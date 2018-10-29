function getConfig(request) {
  var config = {
    configParams: [
      {
        type: 'TEXTINPUT',
        name: 'username',
        displayName: 'User Name',
        helpText: 'Enter the email address that you use to login to Toggl.com.',
        placeholder: 'e.g. someone@google.com'
      },   
      {
        type: 'TEXTINPUT',
        name: 'apiKey',
        displayName: 'API Key',
        helpText: 'Enter your API key. Each user in Toggl.com has an API token. You can find it under "My Profile" in your Toggl account.',
        placeholder: 'Enter API Key'
      },
      {
        type: 'TEXTINPUT',
        name: 'workspaceId',
        displayName: 'Workspace ID',
        helpText: 'Enter the ID of the workspace for which you wish to retrieve data.',
        placeholder: 'Enter Workspace ID'
      },      
      {
      type: 'SELECT_SINGLE',
      name: 'grouping',
      displayName: 'Grouping',
      helpText: 'Select primary grouping.',
      options: [
        {
          label: 'Clients',
          value: 'clients'
        },
        {
          label: 'Projects',
          value: 'projects'
        },
        {
          label: 'Users',
          value: 'users'
        }
      ]
      }, 
      {
      type: 'SELECT_SINGLE',
      name: 'subgrouping',
      displayName: 'Sub-Grouping',
      helpText: 'Select secondary grouping.',
      options: [
        {
          label: 'Users',
          value: 'users'
        },
        {
          label: 'Clients',
          value: 'clients'
        },
        {
          label: 'Projects',
          value: 'projects'
        },
        {
          label: 'Tasks',
          value: 'tasks'
        },        
        {
          label: 'Time Entries',
          value: 'time_entries'
        }        
      ]
      }
    ],
    'dateRangeRequired': true
  };
  return config;
};

var fixedSchema = [
  
  {
    name: 'total_grand',
    label: 'Total Time',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: false
    }
  },
  {
    name: 'total_billable',
    label: 'Billable Time',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: false
    }
  },  
  {
    name: 'grouping_id',
    label: 'Grouping ID',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  }, 
  {
    name: 'grouping_title',
    label: 'Title (Grouping)',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },   
  {
    name: 'client',
    label: 'Client',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },   
  {
    name: 'grouping_time',
    label: 'Time (Grouping)',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: false
    }
  }, 
  {
    name: 'subgrouping_title',
    label: 'Title (Sub-Grouping)',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },     
  {
    name: 'subgrouping_time',
    label: 'Time (Sub-Grouping)',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: true
    }
  },     
  {
    name: 'subgrouping_sum',
    label: 'Billable Amount (Sub-Grouping)',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      isReaggregatable: true
    }
  }
];

function getSchema(request) {
  return {schema: fixedSchema};
};

function getData(request) {
  var dataSchema = [];
  request.fields.forEach(function(field) {
    for (var i = 0; i < fixedSchema.length; i++) {
      if (fixedSchema[i].name === field.name) {
        dataSchema.push(fixedSchema[i]);
        break;
      }
    }
  });

  var headers = {
    "Authorization" : "Basic " + Utilities.base64Encode(request.configParams.apiKey + ':api_token')
  };

  var params = {
    "method":"GET",
    "headers":headers,
    "muteHttpExceptions":true
  };  
  
  var url = [
    'https://toggl.com/reports/api/v2/summary?',
    'user_agent=',
    request.configParams.username,
    '&workspace_id=',
    request.configParams.workspaceId,    
    '&since=',
    request.dateRange.startDate,
    '&until=',
    request.dateRange.endDate,
    '&grouping=',
    request.configParams.grouping,
    '&subgrouping=',
    request.configParams.subgrouping    
  ];
  var response = JSON.parse(UrlFetchApp.fetch(url.join(''), params));

  var data = [];
  response.data.forEach(function(group) {
    group.items.forEach(function(item) {
      var values = [];
      dataSchema.forEach(function(field) {

        switch(field.name) {
          case 'total_grand':
            values.push(response.total_grand);
            break; 
          case 'total_billable':
            values.push(response.total_billable);
            break;                        
          case 'grouping_id':
            values.push(group.id);
            break; 
          case 'grouping_time':
            values.push(group.time);
            break;             
          case 'grouping_title':           
            switch(request.configParams.grouping) {
              case 'projects':
                values.push(group.title.project);
                break;
              case 'clients':
                values.push(group.title.client);
                break;
              case 'users':
                values.push(group.title.user);
                break;
              default:
                values.push('');                
            }            
            break;
          case 'client':
            switch(request.configParams.grouping) {
              case 'projects':
                values.push(group.title.client);
                break;
              case 'clients':
                values.push(group.title.client);
                break; 
              default:             
                switch(request.configParams.subgrouping) {
                  case 'projects':
                    values.push(item.title.client);
                    break;
                  case 'clients':
                    values.push(item.title.client);
                    break;
                  default:
                    values.push('');     
                }
            }              
            break;
          case 'subgrouping_title': 
            switch(request.configParams.subgrouping) {
              case 'projects':
                values.push(item.title.project);
                break;
              case 'clients':
                values.push(item.title.client);
                break;
              case 'users':
                values.push(item.title.user);
                break;
              case 'tasks':
                values.push(item.title.task);
                break;                 
              case 'time_entries':
                values.push(item.title.time_entry);
                break;                
              default:
                values.push('');                
            }            
            break;              
          case 'subgrouping_time':
            values.push(item.time);
            break;
          case 'subgrouping_sum':
            values.push(item.sum);
            break;            
          default:
            values.push('');
        }
      });
      data.push({
        values: values
      });      
    });
  });

  return {
    schema: dataSchema,
    rows: data
  };
};

function getAuthType() {
  var response = {
    "type": "NONE"
  };
  return response;
};

function isAdminUser() {
  return false;
};
