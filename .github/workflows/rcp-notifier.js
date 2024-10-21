const {
  slackNotification,
  getLocalConfigs,
  RCPDates,
} = require('./helpers.js');
const fs = require('fs');
const path = require('path');

const statePath = path.join(__dirname, 'rcp-notifier.json');
const saveFilePath = path.join(__dirname, 'rcp-notifier.json');
const isWithin24Hours = (targetDate) =>
  Math.abs(new Date() - targetDate) <= 24 * 60 * 60 * 1000;

// Run from the root of the project for local testing: node --env-file=.env .github/workflows/rcp-notifier.js
const main = async (params) => {
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  console.log('Starting state', state);
  // fs.writeFileSync(saveFilePath, JSON.stringify(messages, null, 2), 'utf8');
  const { context } = params;
  for (const rcp of RCPDates) {
    const start = new Date(rcp.start);
    const utcStart = new Date(rcp.start).toUTCString();
    const utcEnd = new Date(rcp.end).toUTCString();
    const tenDaysBefore = new Date(start).setDate(start.getDate() - 10);
    const fourDaysBefore = new Date(start).setDate(start.getDate() - 4);
    if (isWithin24Hours(tenDaysBefore) && !state[tenDaysBefore]) {
      console.log('Within 10 days of an RCP');
      await slackNotification(
        `Reminder RCP starts in 10 days from ${utcStart} to ${utcEnd}. Merges to stage will be disabled two days prior to the RCP.`,
      );
      state[tenDaysBefore] = true;
    }
    if (isWithin24Hours(fourDaysBefore) && !state[fourDaysBefore]) {
      console.log('Within 4 days of an RCP');
      await slackNotification(
        `Reminder RCP starts in 4 days from ${utcStart} to ${utcEnd}. Merges to stage will be disabled in two days.`,
      );
      state[fourDaysBefore] = true;
      console.log(fourDaysBefore);
    }
  }
  console.log('Ending state', state);
  fs.writeFileSync(saveFilePath, JSON.stringify(state, null, 2), 'utf8');
};

if (process.env.LOCAL_RUN) {
  const { context } = getLocalConfigs();
  main({ context });
}

module.exports = main;
