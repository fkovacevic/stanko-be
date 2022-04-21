import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express = require('express');

import User from './models/User';

const app = express();
admin.initializeApp();

app.get('/apartments', async (req, res) => {
	// const apartmentsRef = admin.firestore().collection('apartments');
	// const query = apartmentsRef.orderBy('title').limit(5).withConverter(apartmentConverter);
	// const apartments = await admin.firestore().collection('apartments').get().;
	res.send('ovdje');
	res.end();
});

app.post('user/:id', async (req, res) => {
	console.log('ovdi');
});

app.post('/user/subscribe', async (req, res) => {
	const { userId, pushSubscription } = req.body.data;
	const usersRef = admin.firestore().collection('users');
	const querySnapshot = await usersRef.doc(userId).get();
	let user: User;
	let statusCode: number;
	console.log('pozvano');

	if (querySnapshot.exists) {
		user = querySnapshot.data() as User;
		statusCode = 200;
		if (!user.pushSubscription.includes(pushSubscription)) {
			user.pushSubscription.push(pushSubscription);
			await usersRef.doc(userId).set(user);
			statusCode = 201;
		}
	} else {
		user = {
			pushSubscription: [pushSubscription],
			userSubscription: {},
		};
		await usersRef.doc(userId).set(user);
		statusCode = 201;
	}
	res.status(statusCode).send(user);
});

exports.stankoapi = functions.region('europe-west1').https.onRequest(app);
