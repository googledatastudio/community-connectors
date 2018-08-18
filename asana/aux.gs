function transformData (eachParsedResponse) {
  adjResponse = eachParsedResponse;
  
  // Check assignee
  if(eachParsedResponse['assignee'] != null) {
    adjResponse['assignee'] = adjResponse['assignee']['name']
  } else {
    adjResponse['assignee'] = '';
  };
  
  // Check parent task
  if(eachParsedResponse['parent'] != null) {
    adjResponse['parent'] = adjResponse['parent']['name']
  };
  
  // Adjust completed_at date
  if(eachParsedResponse['completed_at'] != null) {
    adjResponse['completed_at'] = adjResponse['completed_at'].split("T")[0];
  } else {
    adjResponse['completed_at'] = '';
  };
  
  // Adjust due date
  if(eachParsedResponse['due_on'] != null) {
    adjResponse['due_on'] = adjResponse['due_on'];
  } else {
    adjResponse['due_on'] = '';
  };
  
  return adjResponse;
};
