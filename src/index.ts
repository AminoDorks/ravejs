import { exec } from "child_process";

console.log(
  `\x1b[34mVisit our community:\x1b[32m https://t.me/aminodorks\x1b[0m`,
);
exec("npm view rave.js version", (error, stdout, stderr) => {
  if (error) {
    console.error(
      `Error retrieving npm package version for rave.js: ${stderr.trim()}`,
    );
    return;
  }
  const installedVersion = stdout.trim();

  if (installedVersion !== process.env.npm_package_version) {
    console.log(
      `\x1b[33mYou're using outdated version. rave.js v${installedVersion} is available.\x1b[0m`,
    );
  }
});
