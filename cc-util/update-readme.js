#!/usr/bin/env node

/**
 * This script updates the readme's deployment url to the newest one provide
 * it's using the format in community-connectors/google-fit/README.md
 */

const childProcess = require('child_process');
const fs = require('fs');

const ENCODING = 'utf8';

/** Promisifys childProcess.exec */
const shellCommand = (commandString) => {
  return new Promise((resolve, reject) => {
    childProcess.exec(commandString, (error, stdout, stderr) => {
      if (error) {
        reject(`exec error: ${error}`);
      } else if (stderr) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

/** Promisifys fs.readFile */
const readFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, ENCODING, function(err, contents) {
      if (err) reject(err);
      else resolve(contents);
    });
  });
};

/** Promisifys fs.writeFile */
const writeFile = (path, contents) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, contents, ENCODING, function(err) {
      if (err) reject(err);
      else resolve(contents);
    });
  });
};

/* Uses clasp to get all deployments, then trims away excess whitespace*/
const getDeployments = async () => {
  const claspResults = await shellCommand(
    'cd src && npx @google/clasp deployments'
  );
  const [_numberOfDeployments, ...deployments] = claspResults
    .trim()
    .split('\n');
  return deployments;
};

/** Returns all of the non-head deployments */
const getNonHeadDeployments = (deployments) => {
  const [_headDeployment, ...nonHeadDeployments] = deployments;
  return nonHeadDeployments;
};

/** Returns the latest deployment */
const getLatestDeployment = (deployments) => {
  const allDeployments = getNonHeadDeployments(deployments);
  return allDeployments[allDeployments.length - 1];
};

/** Parses out the deployment id from the strings clasp returns */
const parseDeploymentId = (deploymentString) => {
  const deploymentIdReversed = deploymentString
    .substring(2)
    .split('')
    .reverse()
    .join('');
  const atLocation = deploymentIdReversed.indexOf('@');
  const deploymentId = deploymentIdReversed
    .substring(atLocation + 2)
    .split('')
    .reverse()
    .join('');
  return deploymentId;
};

/** Builds the url to deeplink directly to the connector using the latest deployment id. */
const getLatestDeploymentUrl = async () => {
  const deployments = await getDeployments();
  const latestDeployment = getLatestDeployment(deployments);
  const deploymentId = parseDeploymentId(latestDeployment);
  const url = `https://datastudio.google.com/datasources/create?connectorId=${deploymentId}`;
  return url;
};

/** Updates the latest deployment link in the readme to be the new latest deployment url. */
const updateReadme = async () => {
  const readmePath = 'README.md';
  const latestDeploymentUrl = await getLatestDeploymentUrl();
  const updatedContents = (await readFile(readmePath)).replace(
    /\[_latest deployment\]:.*/,
    `[_latest deployment]: ${latestDeploymentUrl}`
  );
  await writeFile(readmePath, updatedContents);
};
updateReadme();
