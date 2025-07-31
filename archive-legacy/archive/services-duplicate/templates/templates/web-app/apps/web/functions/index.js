/**
 * Cloud Functions for METU Template
 */

const functions = require('firebase-functions');

// Hello World example function
exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from METU Template Cloud Functions!');
});
