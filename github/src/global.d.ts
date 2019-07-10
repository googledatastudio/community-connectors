// TODO - all of the `Object` types could probably be better specified in the
// future, but since that's what the builder's `.build()` return, this is the
// best we can do for now.

// getAuthType
type GetAuthTypeResponse = Object;

// getSchema

interface GetSchemaRequest<T> {
  configParams: T;
}
interface GetSchemaResponse {
  schema: Object[];
}

// getConfig

interface GetConfigRequest {
  languageCode: string;
}
type GetConfigResponse = Object;

// getData

interface DefaultConfigParams {
  [configId: string]: string;
}
interface GetDataRequest<T> {
  configParams?: T;
  scriptParams?: {
    sampleExtraction: boolean;
    lastRefresh: string;
  };
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  fields: Array<{
    name: string;
  }>;
}

type GetDataRowValue = string | number | boolean;
interface GetDataRow {
  values: Array<GetDataRowValue>;
}
type GetDataRows = Array<GetDataRow>;

interface GetDataResponse {
  schema: Object[];
  rows: GetDataRows;
}

// setCredentials
interface UserPassCredentials {
  userPass: {
    username: string;
    password: string;
  };
}

interface UserTokenCredentials {
  userToken: {
    username: string;
    token: string;
  };
}

interface KeyCredentials {
  key: string;
}

type SetCredentialsRequest =
  | UserPassCredentials
  | UserTokenCredentials
  | KeyCredentials;

interface SetCredentialsResponse {
  errorCode: 'NONE' | 'INVALID_CREDENTIALS';
}

type Fields = GoogleAppsScript.Data_Studio.Fields;

// Useful connector functions
type GetFields = () => Fields;

// Connector Function Types

type IsAdminUser = () => boolean;
type GetConfig = (request: GetConfigRequest) => GetConfigResponse;
type GetData<T = DefaultConfigParams> = (
  request: GetDataRequest<T>
) => GetDataResponse;
type GetSchema<T = DefaultConfigParams> = (
  request: GetSchemaRequest<T>
) => GetSchemaResponse;
type IsAuthValid = () => boolean;
type ResetAuth = () => void;
type AuthCallback = (request: object) => GoogleAppsScript.HTML.HtmlOutput;
type SetCredentials = (
  request: SetCredentialsRequest
) => SetCredentialsResponse;
type GetAuthType = () => GetAuthTypeResponse;
type Get3PAuthorizationUrls = () => string;
