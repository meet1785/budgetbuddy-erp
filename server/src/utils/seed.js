const { exec } = require('child_process');
const path = require('path');

// Change to server directory and run ts-node with proper configuration
const serverDir = path.join(__dirname, '..');
process.chdir(path.join(serverDir, '..'));

exec('npx ts-node --project server/tsconfig.json server/src/utils/seedData.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(stdout);
});