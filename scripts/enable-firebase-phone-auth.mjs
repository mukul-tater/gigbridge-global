#!/usr/bin/env node
/**
 * Enables Firebase Phone sign-in for the linked project.
 * Requires: firebase login (already done)
 */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const PROJECT_ID = 'auth-app-for-frontend';
const CONFIG_PATH = join(homedir(), '.config', 'configstore', 'firebase-tools.json');

async function getAccessToken() {
  const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  const refreshToken = config.tokens?.refresh_token;
  if (!refreshToken) {
    throw new Error('No Firebase refresh token. Run: npx firebase-tools@latest login --no-localhost');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
      client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error(data.error_description || 'Failed to refresh Firebase access token');
  }
  return data.access_token;
}

async function enablePhoneAuth(accessToken) {
  const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config?updateMask=signIn.phoneNumber.enabled`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      signIn: {
        phoneNumber: {
          enabled: true,
        },
      },
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error?.message || JSON.stringify(body));
  }
  return body;
}

async function addAuthorizedDomain(accessToken, domain) {
  const getUrl = `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config`;
  const getRes = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const config = await getRes.json();
  const domains = new Set(config.authorizedDomains || []);
  domains.add(domain);

  const patchRes = await fetch(`${getUrl}?updateMask=authorizedDomains`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      authorizedDomains: [...domains],
    }),
  });

  const body = await patchRes.json();
  if (!patchRes.ok) {
    throw new Error(body.error?.message || JSON.stringify(body));
  }
  return body.authorizedDomains;
}

const token = await getAccessToken();
console.log('Enabling Phone auth...');
await enablePhoneAuth(token);
console.log('✓ Phone auth enabled');

console.log('Adding authorized domains...');
const domains = await addAuthorizedDomain(token, 'localhost');
console.log('✓ Authorized domains:', domains.join(', '));

console.log('Adding dev test phone +919876543210 => 123456 ...');
const testUrl = `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config?updateMask=signIn.phoneNumber.testPhoneNumbers`;
const testRes = await fetch(testUrl, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    signIn: {
      phoneNumber: {
        testPhoneNumbers: {
          '+919876543210': '123456',
        },
      },
    },
  }),
});
if (!testRes.ok) {
  const err = await testRes.json();
  console.warn('Test phone setup skipped:', err.error?.message || err);
} else {
  console.log('✓ Test phone: +919876543210 → OTP 123456');
}
