const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const OVERRIDES_DIR = path.join(__dirname, '..', '..', '..', 'overrides');
const FRONTEGG_APP_ID_HEADER = 'frontegg-requested-application-id';
const VERSION_PATTERN = /^v[1-9][0-9]*$/;

// Simulates the appId → appName mapping loaded from AWS secrets in user-gql-service
const APP_ID_TO_APP_NAME = {
  '05cf0d02-af47-41e9-b894-221a07c0d97c': 'marint', // WINDWARD_MARINT_QA
  '41ded717-0922-44cc-af1c-63f3c65e37df': 'marint', // WINDWARD_MARINT_PRODUCTION
  '98dad650-f1cf-427a-adc5-8043b136da47': 'mai',    // WINDWARD_MAIX_QA
  '8125b1dc-11fd-4e6c-87f1-d69ad2810909': 'mai',    // WINDWARD_MAIX_PRODUCTION
};

const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: [FRONTEGG_APP_ID_HEADER, 'x-frontegg-framework', 'x-frontegg-sdk'],
  })
);

app.get('*', (req, res) => {
  const version = req.query.version;

  if (!VERSION_PATTERN.test(version)) {
    res.status(404).end();
    return;
  }

  const instanceName = req.query.instanceName.toLowerCase();
  const appId = req.get(FRONTEGG_APP_ID_HEADER);

  res.set('Vary', FRONTEGG_APP_ID_HEADER);

  if (!appId) {
    res.status(400).json({ error: 'Missing app ID' });
    return;
  }

  const appName = APP_ID_TO_APP_NAME[appId];

  if (!appName) {
    res.status(400).json({ error: 'Unknown app ID' });
    return;
  }

  const appSpecificFile = `${instanceName}.${appName}.json`;
  const appSpecificFileExists = fs.existsSync(path.join(OVERRIDES_DIR, appSpecificFile));
  const fileToServe = appSpecificFileExists ? appSpecificFile : `${instanceName}.json`;

  res.sendFile(fileToServe, { root: OVERRIDES_DIR, maxAge: '1y', immutable: true });
});

module.exports = app;
