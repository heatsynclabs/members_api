const jwt = require('jsonwebtoken');
const { includes } = require('lodash');
const aedes = require('aedes')();
const debug = require('debug')('mqtt');
const config = require('../config');

aedes.authenticate = async function (client, username, password, callback) {
  debug('mqtt auth', username, password);
  try {
    const decoded = jwt.verify(password.toString(), config.jwt.password);
    client.user = decoded;
    if (client.user) {
      debug('mqtt authed', client.user);
      return callback(null, 'ok');
    }
  } catch (e) {
    debug('mqtt error authenticating', e);
    return callback(e);
  }
  
  return callback('nope');
}

aedes.on('client', (client) => {
  debug('onclient', client.user);
  if (client.user) {
    const topic = `/users/${client.user.id}`;
    client.subscribe({topic, qos: 0}, (ok) => {
      debug('user subscribed', topic, ok);
    });

    if (includes(client.user.scope, 'DOOR')) {
      client.subscribe({topic: '/door/updates', qos: 0}, (ok) => {
        debug('roor subscribed', topic, ok);
      });
    }

    if (includes(client.user.scope, 'ADMIN')) {
      client.subscribe({topic: '/admin/updates', qos: 0}, (ok) => {
        debug('admin subscribed', topic, ok);
      });
    }
  }

});

aedes.authorizeSubscribe = function (client, sub, callback) {
  debug('authorizeSubscribe', client.user, sub);
  const { user } = client;
  if (user) {
    if (sub.topic.startsWith(`/users/${user.id}`)) {
      return callback(null, sub);
    } else if (sub.topic.startsWith('/admin/') && includes(user.scope, 'ADMIN')) {
      return callback(null, sub);
    } else if (sub.topic.startsWith('/door/') && includes(user.scope, 'DOOR')) {
      return callback(null, sub);
    }
  }
  
  return callback(new Error('wrong topic'));
}

aedes.on('publish', (packet, client, cb) => {
  debug('publish', packet.topic, packet.payload.length, client ? client.id : 'noclient', cb);
});

function publish(topic, payload) {
  if (payload && typeof payload === 'object') {
    payload = JSON.stringify(payload);
  } else {
    payload = String(payload);
  }
  aedes.publish({ topic, payload });
}

module.exports = {
  mqtt: aedes,
  publish,
};