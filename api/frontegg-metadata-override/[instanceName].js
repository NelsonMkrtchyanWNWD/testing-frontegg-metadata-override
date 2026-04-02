const express = require('express');
const cors = require('cors');
const path = require('path');

const OVERRIDES_DIR = path.join(__dirname, '..', '..', 'overrides');
const FRONTEGG_APP_ID_HEADER = 'frontegg-requested-application-id';
const INSTANCE_NAME_PATTERN = /^[a-z0-9_]+$/;
const CACHE_MAX_AGE_MS = 60 * 60 * 1000;

const APP_ID_TO_INSTANCE_NAME = {
  '98dad650-f1cf-427a-adc5-8043b136da47': 'mai', // WINDWARD_MAIX_QA
  '8125b1dc-11fd-4e6c-87f1-d69ad2810909': 'mai', // WINDWARD_MAIX_PRODUCTION
};

const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: [FRONTEGG_APP_ID_HEADER, 'x-frontegg-framework', 'x-frontegg-sdk'],
  })
);

function sendOverrideFile(res, filePath) {
  res.sendFile(filePath, { maxAge: CACHE_MAX_AGE_MS }, (err) => {
    if (!err || res.headersSent) return;

    if (err.code === 'ENOENT') {
      res.status(404).json({ error: 'Instance not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

app.get('*', (req, res) => {
  const instanceName = req.query.instanceName.toLowerCase().replace(/-/g, '_');

  if (!INSTANCE_NAME_PATTERN.test(instanceName)) {
    res.status(400).json({ error: 'Invalid instance name' });
    return;
  }

  const appId = req.headers[FRONTEGG_APP_ID_HEADER];
  const appInstanceName = appId && APP_ID_TO_INSTANCE_NAME[appId];

  res.set('Vary', FRONTEGG_APP_ID_HEADER);

  const defaultFile = path.join(OVERRIDES_DIR, `${instanceName}.json`);

  if (appInstanceName) {
    const appSpecificFile = path.join(OVERRIDES_DIR, `${instanceName}.${appInstanceName}.json`);

    res.sendFile(appSpecificFile, { maxAge: CACHE_MAX_AGE_MS }, (err) => {
      if (err?.code === 'ENOENT') {
        sendOverrideFile(res, defaultFile);
        return;
      }

      if (err) {
        if (res.headersSent) return;
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    return;
  }

  sendOverrideFile(res, defaultFile);
});

module.exports = app;
