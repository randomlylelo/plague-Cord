const admin = require('firebase-admin');
const key = require('./key.js');

admin.initializeApp({
  credential: admin.credential.cert(key),
  databaseURL: "https://plague-cord.firebaseio.com"
});

const db = admin.firestore();

module.exports = db;