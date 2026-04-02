const fs = require('fs');
const path = require('path');

const OVERRIDES_DIR = path.join(__dirname, '..', 'overrides');
const FRONTEGG_APP_ID_HEADER = 'frontegg-requested-application-id';
const INSTANCE_NAME_PATTERN = /^[a-z0-9_]+$/;
const CACHE_MAX_AGE_SECONDS = 60 * 60;

const APP_ID_TO_INSTANCE_NAME = {
  '98dad650-f1cf-427a-adc5-8043b136da47': 'mai', // WINDWARD_MAIX_QA
  '8125b1dc-11fd-4e6c-87f1-d69ad2810909': 'mai', // WINDWARD_MAIX_PRODUCTION
};

function readOverrideFile(filePath) {
  try {
    return fs.readFileSync(filePath);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const rawInstanceName = req.query.instance || '';
  const instanceName = rawInstanceName.toLowerCase().replace(/-/g, '_');

  if (!instanceName || !INSTANCE_NAME_PATTERN.test(instanceName)) {
    return res.status(400).json({ error: 'Invalid instance name' });
  }

  const appId = req.headers[FRONTEGG_APP_ID_HEADER];
  const appInstanceName = appId && APP_ID_TO_INSTANCE_NAME[appId];

  res.setHeader('Vary', FRONTEGG_APP_ID_HEADER);
  res.setHeader('Cache-Control', `public, max-age=${CACHE_MAX_AGE_SECONDS}`);

  let content = null;

  if (appInstanceName) {
    content = readOverrideFile(path.join(OVERRIDES_DIR, `${instanceName}.${appInstanceName}.json`));
  }

  if (!content) {
    content = readOverrideFile(path.join(OVERRIDES_DIR, `${instanceName}.json`));
  }

  if (!content) {
    return res.status(404).json({ error: 'Instance not found' });
  }

  res.setHeader('Content-Type', 'application/json');
  res.end(content);
};
