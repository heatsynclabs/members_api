const fetch = require('node-fetch');
const {
  pick,
  forEach
} = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('../config');

const oauthProviders = {
  google: {
    url: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'openid email profile',
    getUser: async (app, query) => {
      const oauthConfig = app.oauth.google;
      const params = new URLSearchParams();
      params.append('code', query.code);
      params.append('client_id', oauthConfig.client_id);
      params.append('client_secret', oauthConfig.client_secret);
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', `${config.server_url}/users/oauth`);

      const body = {
        code: query.code,
        client_id: oauthConfig.client_id,
        client_secret: oauthConfig.client_secret,
        grant_type: 'authorization_code',
        redirect_uri: `${config.server_url}/users/oauth`,
      };

      const result = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
      const providerUserToken = await result.json();
      const providerUser = jwt.decode(providerUserToken.id_token);

      const user = {
        ...pick(providerUser, ['name', 'email']), avatar: providerUser.picture, provider: 'google', providerId: providerUser.sub
      };
      return user;
    }
  },
  github: {
    url: 'https://github.com/login/oauth/authorize',
    scope: 'read:user user:email',
    getUser: async (app, query) => {
      const oauthConfig = app.oauth.github;
      // console.log('getuser', app, query, oauthConfig);
      let params = new URLSearchParams();
      params.append('code', query.code);
      params.append('client_id', oauthConfig.client_id);
      params.append('client_secret', oauthConfig.client_secret);

      const result1 = await fetch('https://github.com/login/oauth/access_token', { method: 'POST', body: params });
      const text = await result1.text();
      params = new URLSearchParams(text);

      const result2 = await fetch('https://api.github.com/user', { method: 'GET', headers: { 'Content-Type': 'application/json', Authorization: 'token ' + params.get('access_token') } });

      const providerUser = await result2.json();
      const user = {
        ...pick(providerUser, ['name', 'email']), avatar: providerUser.avatar_url, provider: 'github', providerId: providerUser.id
      };
      if (!user.providerId) {
        throw new Error('bad response from github');
      }
      return user;
    }
  },
  facebook: {
    url: 'https://www.facebook.com/v6.0/dialog/oauth',
    scope: 'email',
    getUser: async (app, query) => {
      const oauthConfig = app.oauth.facebook;
      let params = new URLSearchParams();
      params.append('code', query.code);
      params.append('client_id', oauthConfig.client_id);
      params.append('client_secret', oauthConfig.client_secret);
      params.append('redirect_uri', `${config.server_url}/users/oauth`);

      const result1 = await fetch(`https://graph.facebook.com/v6.0/oauth/access_token?${params.toString()}`);
      const json = await result1.json();

      params = new URLSearchParams();
      params.append('access_token', json.access_token);
      params.append('fields', 'id,name,email,picture');
      params.append('format', 'json');
      params.append('method', 'get');
      params.append('pretty', '0');

      const result2 = await fetch(`https://graph.facebook.com/v6.0/me?${params.toString()}`);

      const providerUser = await result2.json();
      const user = {
        ...pick(providerUser, ['name', 'email']), avatar: providerUser.picture ? providerUser.picture.data.url : undefined, provider: 'facebook', providerId: providerUser.id
      };
      if (!user.email) {
        throw new Error('Facebook email not verified');
      }
      // console.log('facebook getUser providerUser', providerUser, user);
      return user;
    }
  },
  amazon: {
    url: 'https://www.amazon.com/ap/oa',
    scope: 'profile',
    getUser: async (app, query) => {
      const oauthConfig = app.oauth.amazon;
      let params = new URLSearchParams();
      params.append('code', query.code);
      params.append('client_id', oauthConfig.client_id);
      params.append('client_secret', oauthConfig.client_secret);
      params.append('redirect_uri', `${config.server_url}/users/oauth`);
      params.append('grant_type', 'authorization_code');

      const result1 = await fetch('https://api.amazon.com/auth/o2/token', { method: 'POST', body: params });
      const json = await result1.json();

      params = new URLSearchParams();
      params.append('access_token', json.access_token);

      const result2 = await fetch(`https://api.amazon.com/user/profile?${params.toString()}`);

      const providerUser = await result2.json();
      const user = { ...pick(providerUser, ['name', 'email']), provider: 'amazon', providerId: providerUser.user_id };
      // console.log('amazon getUser providerUser', providerUser, user);
      return user;
    }
  },
  microsoft: {
    url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scope: 'email openid profile',
    additionalRedirProps: { response_mode: 'query' },
    getUser: async (app, query) => {
      const oauthConfig = app.oauth.microsoft;
      const params = new URLSearchParams();
      params.append('code', query.code);
      params.append('client_id', oauthConfig.client_id);
      params.append('client_secret', oauthConfig.client_secret);
      params.append('redirect_uri', `${config.server_url}/users/oauth`);
      params.append('grant_type', 'authorization_code');

      const result1 = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token ', { method: 'POST', body: params });
      const json = await result1.json();

      const providerUser = jwt.decode(json.id_token);
      const user = { ...pick(providerUser, ['name', 'email']), provider: 'microsoft', providerId: providerUser.sub };
      // console.log('microsoft getUser providerUser', providerUser, user);
      return user;
    }
  },
};

function getRedirUrl(oauthConfig, providerName, state) {
  const providerLib = oauthProviders[providerName];
  const params = new URLSearchParams();
  params.append('response_type', 'code');
  params.append('client_id', oauthConfig.client_id);
  params.append('redirect_uri', `${config.server_url}/users/oauth`);
  params.append('state', state);
  params.append('o2v', '1');
  params.append('scope', providerLib.scope);

  if (providerLib.additionalRedirProps) {
    forEach(providerLib.additionalRedirProps, (v, k) => {
      params.append(k, v);
    });
  }

  const fullUrl = `${providerLib.url}?${params.toString()}`;
  // console.log({fullUrl}, `${config.server_url}/users/oauth`);
  return fullUrl;
}

module.exports = {
  oauthProviders,
  getRedirUrl
};
