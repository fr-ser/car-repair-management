#!/usr/bin/env node
'use strict';

const https = require('node:https');
const readline = require('node:readline');

const clientId = process.env.DROPBOX_CLIENT_ID;
const clientSecret = process.env.DROPBOX_CLIENT_SECRET;
const redirectUri = 'http://localhost';

if (!clientId || !clientSecret) {
  console.error(
    'Error: DROPBOX_CLIENT_ID and DROPBOX_CLIENT_SECRET must be set.',
  );
  process.exit(1);
}

const authUrl =
  `https://www.dropbox.com/oauth2/authorize` +
  `?client_id=${clientId}` +
  `&redirect_uri=${encodeURIComponent(redirectUri)}` +
  `&response_type=code` +
  `&token_access_type=offline`;

console.log('Open this URL in your browser and authorize the app:\n');
console.log(authUrl);
console.log(
  '\nAfter authorizing, your browser will redirect to localhost (it will fail — that is expected).',
);
console.log(
  'Copy the value of the "code" query parameter from the address bar.\n',
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Paste the authorization code here: ', (code) => {
  rl.close();
  code = code.trim();

  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  }).toString();

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64',
  );

  const options = {
    hostname: 'api.dropboxapi.com',
    path: '/oauth2/token',
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      const json = JSON.parse(data);
      if (json.refresh_token) {
        console.log('\nSuccess! Add this to your .envrc:\n');
        console.log(`export DROPBOX_REFRESH_TOKEN=${json.refresh_token}`);
      } else {
        console.error('\nError response from Dropbox:');
        console.error(JSON.stringify(json, null, 2));
        process.exit(1);
      }
    });
  });

  req.on('error', (err) => {
    console.error('Request failed:', err.message);
    process.exit(1);
  });

  req.write(body);
  req.end();
});
