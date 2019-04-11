const open = require('opn');
const argparse = require('argparse');
const packageJson = require('../package.json');
const cp = require('child_process');
const chalk = require('chalk');
const terminalLink = require('terminal-link');

const exec = (command, options) => {
  return new Promise((resolve, reject) => {
    const child = cp.exec(command, options, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({out: stdout, err: stderr});
      }
    });
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  });
};

const parser = new argparse.ArgumentParser({
  version: '1.0',
  addHelp: true,
  description: 'Scripts for managing connectors.',
});

parser.addArgument(['-s', '--script'], {
  choices: ['try_production', 'update_production', 'try_latest'],
  dest: 'script',
  help: 'The script to run.',
  required: true,
});

const args = parser.parseArgs();

const openDeployment = (deploymentId, deploymentName) => {
  const green = chalk.rgb(15, 157, 88);
  const deploymentUrl = `https://datastudio.google.com/datasources/create?connectorId=${deploymentId}`;
  const formattedUrl = green(
    terminalLink(`${deploymentName} deployment`, deploymentUrl)
  );
  console.log(`Opening: ${formattedUrl}`);
  return open(deploymentUrl);
};

const updateDeployment = async (deploymentId) => {
  await exec(`npx @google/clasp deploy --deploymentId ${deploymentId}`);
};

const main = async () => {
  switch (args.script) {
    case 'try_production': {
      return await openDeployment(
        packageJson.deployments.production,
        'production'
      );
    }
    case 'try_latest': {
      return await openDeployment(packageJson.deployments.latest, 'latest');
    }
    case 'update_production': {
      return await updateDeployment(packageJson.deployments.production);
    }
    default: {
      throw new Error(`${args.script} is not supported yet.`);
    }
  }
};

(async () => {
  try {
    await main();
  } catch (e) {
    console.error(`${e}`);
    process.exit(1);
  }
  process.exit(0);
})();
