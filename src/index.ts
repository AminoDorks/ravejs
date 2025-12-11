import { exec } from 'child_process';
import { VERSION } from './constants';

console.log(
  `\x1b[34mVisit our community:\x1b[32m https://t.me/aminodorks\x1b[0m`,
);
exec('npm view ravejs version', (error, stdout, stderr) => {
  if (error) {
    console.error(
      `Error retrieving npm package version for ravejs: ${stderr.trim()}`,
    );
    return;
  }
  const installedVersion = stdout.trim();

  if (installedVersion !== VERSION) {
    console.log(
      `\x1b[33mYou're using outdated version. ravejs v${installedVersion} is available.\x1b[0m`,
    );
  }
});
