const cron = require('node-cron');
const { spawn } = require('child_process');
const path = require('path');

const AGENT_SCRIPT = path.join(__dirname, 'agent.js');

console.log('Starting TikTok Automation Scheduler...');
console.log('Schedule: Every day at 09:00 AM');

// Schedule task to run at 9:00 AM every day
cron.schedule('0 9 * * *', () => {
  console.log('Running scheduled task: TikTok Post');
  runAgent();
});

function runAgent() {
  const child = spawn('node', [AGENT_SCRIPT], {
    stdio: 'inherit',
    cwd: __dirname
  });

  child.on('close', (code) => {
    console.log(`Agent process exited with code ${code}`);
  });

  child.on('error', (err) => {
    console.error('Failed to start agent process:', err);
  });
}

// Optional: Run immediately on start for testing (comment out in production)
// runAgent();
