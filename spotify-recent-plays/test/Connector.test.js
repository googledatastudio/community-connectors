import Connector from '../src/Connector';
import CacheServiceMock from './mocks/CacheServiceMock';
import PropertiesServiceMock from './mocks/PropertiesServiceMock';
import OAuth2Mock from './mocks/OAuth2Mock';
import UrlFetchAppMock from './mocks/UrlFetchAppMock';
import HtmlServiceMock from './mocks/HtmlServiceMock';
import { buildFakeRequest } from './helpers/FakeRequest';
import apiResponses from './helpers/ApiResponses';

let service, cacheServiceMock, propertiesServiceMock, oAuth2Mock, urlFetchAppMock, htmlServiceMock;

beforeEach(() => {
  cacheServiceMock = new CacheServiceMock();
  propertiesServiceMock = new PropertiesServiceMock();
  oAuth2Mock = new OAuth2Mock();
  urlFetchAppMock = new UrlFetchAppMock(apiResponses);
  htmlServiceMock = new HtmlServiceMock();
  service = new Connector({
    CacheService: cacheServiceMock,
    UrlFetchApp: urlFetchAppMock,
    HtmlService: htmlServiceMock,
    PropertiesService: propertiesServiceMock,
    OAuth2: oAuth2Mock
  });
});

test('getSchema', () => {
  const fields = service.getSchema().schema.map((f) => f.name);
  const expected = [
    'track_name',
    'artist',
    'played_at_hour',
    'played_at_date',
    'plays',
    'tracks_count',
    'popularity'
  ];
  expect(fields).toEqual(expected, 'it returns the schema content');
});

test('getConfig', () => {
  expect(service.getConfig().dateRangeRequired).toBe(true);
});

test('getAuthType', () => {
  expect(service.getAuthType().type).toBe('OAUTH2');
});

test('isAdminUser', () => {
  expect(service.isAdminUser()).toBe(true);
});

test('getData', () => {
  const startDate = new Date('2018-07-13T00:00:00Z');
  const endDate = new Date('2018-07-14T00:00:00Z');
  const fields = ['track_name', 'artist'];
  let request = buildFakeRequest({
    startDate,
    endDate,
    fields
  });
  console.log(request);
  /* eslint-disable quotes */
  const expected = {
    "rows": [
      {
        "values": [
          "Make It Wit Chu",
          "Queens of the Stone Age"
        ]
      },
      {
        "values": [
          "Lazaretto",
          "Jack White"
        ]
      },
      {
        "values": [
          "The Hardest Button To Button",
          "The White Stripes"
        ]
      },
      {
        "values": [
          "Black Smoke Rising",
          "Greta Van Fleet"
        ]
      },
      {
        "values": [
          "Little Sister",
          "Queens of the Stone Age"
        ]
      },
      {
        "values": [
          "Beat The Devil's Tattoo",
          "Black Rebel Motorcycle Club"
        ]
      },
      {
        "values": [
          "Bury Me Face Down",
          "grandson"
        ]
      },
      {
        "values": [
          "I Was Just a Kid",
          "Nothing But Thieves"
        ]
      },
      {
        "values": [
          "Ten Tonne Skeleton",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "L.S.F.",
          "Kasabian"
        ]
      },
      {
        "values": [
          "You Think I Ain't Worth A Dollar, But I Feel Like A Millionaire - Album Version (With Interlude)",
          "Queens of the Stone Age"
        ]
      },
      {
        "values": [
          "250 Miles",
          "Radio Moscow"
        ]
      },
      {
        "values": [
          "Miss Alissa",
          "Eagles Of Death Metal"
        ]
      },
      {
        "values": [
          "Suffocation Blues",
          "Black Pistol Fire"
        ]
      },
      {
        "values": [
          "Sleep",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "Level",
          "The Raconteurs"
        ]
      },
      {
        "values": [
          "Are You Looking for Action?",
          "Kasabian"
        ]
      },
      {
        "values": [
          "Bath Salts",
          "Highly Suspect"
        ]
      },
      {
        "values": [
          "Sixteen Saltines",
          "Jack White"
        ]
      },
      {
        "values": [
          "Blood Hands",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "Talk On The Street",
          "Greta Van Fleet"
        ]
      },
      {
        "values": [
          "The Evil Has Landed",
          "Queens of the Stone Age"
        ]
      },
      {
        "values": [
          "Icky Thump",
          "The White Stripes"
        ]
      },
      {
        "values": [
          "Club Foot",
          "Kasabian"
        ]
      },
      {
        "values": [
          "Don't Tell",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "Keep On Swinging",
          "Rival Sons"
        ]
      },
      {
        "values": [
          "No One Knows",
          "Queens of the Stone Age"
        ]
      },
      {
        "values": [
          "Get Better",
          "Nothing But Thieves"
        ]
      },
      {
        "values": [
          "Careless",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "War",
          "grandson"
        ]
      },
      {
        "values": [
          "What Makes A Good Man?",
          "The Heavy"
        ]
      },
      {
        "values": [
          "I Sat By The Ocean",
          "Queens of the Stone Age"
        ]
      },
      {
        "values": [
          "Wolf",
          "Highly Suspect"
        ]
      },
      {
        "values": [
          "She's Creeping",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "Little Monster",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "Come On Over",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "Out Of The Black - Live From Spotify NYC",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "Loose Change - Live From Spotify NYC",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "Figure It Out - Live From Spotify NYC",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "Come On Over - Live From Spotify NYC",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "Figure It Out",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "Lights Out",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "Hook, Line & Sinker",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "Birthday Sex",
          "Jeremih"
        ]
      },
      {
        "values": [
          "I Only Lie When I Love You",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "My Sharona - Recorded at Abbey Road Studios, London",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "How Did We Get So Dark? - Recorded at Abbey Road Studios, London",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "Better Strangers",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "Ten Tonne Skeleton",
          "Royal Blood"
        ]
      },
      {
        "values": [
          "Careless",
          "Royal Blood"
        ]
      }
    ],
    "schema": [
      {
        "dataType": "STRING",
        "label": "Track Name",
        "name": "track_name",
        "semantics": {
          "conceptType": "DIMENSION"
        }
      },
      {
        "dataType": "STRING",
        "label": "Artist",
        "name": "artist",
        "semantics": {
          "conceptType": "DIMENSION"
        }
      }
    ]
  };
  /* eslint-enable quotes */

  expect(service.getData(request)).toEqual(expected);
});

test('authCallback', () => {
  service.authCallback();
  expect(htmlServiceMock.lastHtmlContent).toMatch(/Success/);
});

test('isAuthValid', () => {
  expect(service.isAuthValid()).toBe(true);
});

test('get3PAuthorizationUrls', () => {
  expect(service.get3PAuthorizationUrls()).toBe('https://mock.com');
});

test('resetAuth', () => {
  service.resetAuth();
  expect(oAuth2Mock.resetCalled).toBe(true);
});
