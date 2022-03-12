import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express = require('express');

const app = express();
admin.initializeApp();

app.get('/apartments', async (req, res) => {
	const apartmentsRef = admin.firestore().collection('apartments');
	// const query = apartmentsRef.orderBy('title').limit(5).withConverter(apartmentConverter);
	// const apartments = await admin.firestore().collection('apartments').get().;
	res.send('ejjj');
	res.end();
});

exports.stankoapi = functions.region('europe-west1').https.onRequest(app);
