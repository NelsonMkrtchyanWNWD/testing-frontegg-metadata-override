const express = require('express');
const cors = require('cors');
const path = require('path');

const OVERRIDES_DIR = path.join(__dirname, '..', '..', 'overrides');
const FRONTEGG_APP_ID_HEADER = 'frontegg-requested-application-id';
const INSTANCE_NAME_PATTERN = /^[a-z0-9_]+$/;
const CACHE_MAX_AGE_MS = 60 * 60 * 1000;

const APP_ID_TO_INSTANCE_AND_APPLICATION = {
  '05cf0d02-af47-41e9-b894-221a07c0d97c': { instanceName: 'windward', application: 'marint' }, // WINDWARD_MARINT_QA
  '41ded717-0922-44cc-af1c-63f3c65e37df': { instanceName: 'windward', application: 'marint' }, // WINDWARD_MARINT_PRODUCTION
  '98dad650-f1cf-427a-adc5-8043b136da47': { instanceName: 'windward', application: 'mai' },    // WINDWARD_MAIX_QA
  '8125b1dc-11fd-4e6c-87f1-d69ad2810909': { instanceName: 'windward', application: 'mai' },    // WINDWARD_MAIX_PRODUCTION
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
  const instanceName = req.query.instanceName.toLowerCase().replace(/-/g, '_');

  if (!INSTANCE_NAME_PATTERN.test(instanceName)) {
    res.status(400).json({ error: 'Invalid instance name' });
    return;
  }

  const appId = req.get(FRONTEGG_APP_ID_HEADER);

  res.set('Vary', FRONTEGG_APP_ID_HEADER);

  if (!appId) {
    res.status(400).json({ error: 'Missing app ID' });
    return;
  }

  const appInstanceMapping = APP_ID_TO_INSTANCE_AND_APPLICATION[appId];

  if (!appInstanceMapping) {
    res.sendFile(`${instanceName}.json`, { root: OVERRIDES_DIR, maxAge: CACHE_MAX_AGE_MS });
    return;
  }

  const filename = `${appInstanceMapping.instanceName}.${appInstanceMapping.application}.json`;

  res.sendFile(filename, { root: OVERRIDES_DIR, maxAge: CACHE_MAX_AGE_MS });
});

module.exports = app;
