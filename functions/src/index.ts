/* eslint-disable max-len */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as webpush from 'web-push';
import { updatedDiff } from 'deep-object-diff';


import express = require('express');


import User from './models/User';
import { translateFromFieldName } from './helpers';
import cors = require('cors');

const app = express();
app.use(cors());

admin.initializeApp();
const privateKey = 'JBq2I7T5PailehMtedY3Pw5iUWG2x3xpZBCXsQJivSs';
const publicKey = 'BGRMSocKa6z_GeM5EXMK0IWv00BHIg70lTjrWnWAgU0m0dBocPJIRtt4R51F0DOQMPw-GX9D4uczIMi6zYunz3w';
const GCMAPIkey = 'AAAAj-pySgg:APA91bED_gBfZWhoLpd9uI4MLmLafhwRb_FQw1-4EIX9fAkt77OesVVVvX7f2jgY7XfoUIFLLEQ7sqaZF4p_sPNphYselB7g94s7e117r-tMm9_t9v6nuyiK8ud0x3KGLkNOTdcmNRhW';

/**
 * endpoint to be called on users login, add user and his pushSubscription object
 * if user already exists, but not the pushSubscription object (e.g. user is logged in from another browser)
 * add pushSubscription object to list
*/
app.post('/user/:id/push-subscriptions', async (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	const { pushSubscription } = req.body.data;
	const userId = req.params.id;

	const usersRef = admin.firestore().collection('users');
	const querySnapshot = await usersRef.doc(userId).get();

	let user: User;
	let statusCode: number;

	if (querySnapshot.exists) {
		user = querySnapshot.data() as User;
		statusCode = 200;
		if (!user.pushSubscription.includes(pushSubscription)) {
			user.pushSubscription.push(pushSubscription);
			await usersRef.doc(userId).set(user, { merge: true });
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

app.put('/user/:id/user-subscription', async (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	const userId = req.params.id;
	const { userSubscription } = req.body;

	const usersRef = admin.firestore().collection('users');
	await usersRef.doc(userId).update(userSubscription);

	res.status(200).send(userSubscription);
});

app.post('/user/:id/apartments', async (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	const { apartmentRM } = req.body.data;
	const { images } = apartmentRM;

	const apartmentsRef = admin.firestore().collection('apartments');
	let pushMessage: string;
	// is updated
	if (apartmentRM.id) {
		const apartmentSnapshot = await apartmentsRef.doc(apartmentRM.id).get();
		const apartment = apartmentSnapshot.data();
		if (apartment) {
			pushMessage = `Dogodile su se promjene na jednom od oglasa na koji ste pretplaćeni (${apartment.title}). Na podacima: `;
			const changes = Object.keys(updatedDiff(apartment, apartmentRM)).map((fieldName: string) => translateFromFieldName(fieldName));
			pushMessage += changes.filter(Boolean).join(', ');
			apartmentsRef.doc(apartmentRM.id).set(apartmentRM);
		}
	} else { // is newly added
		apartmentsRef.add(apartmentRM);
	}

	webpush.setGCMAPIKey(GCMAPIkey);
	webpush.setVapidDetails(
		'mailto:example@gmail.com',
		publicKey,
		privateKey
	);

	const usersRef = admin.firestore().collection('users');
	const querySnapshot =
		await usersRef
			.where('userSubscription.partOfTown', '==', apartmentRM.partOfTown)
			.where('userSubscription.areaMin', '<=', +apartmentRM.area)
			.get();

	const users = querySnapshot.docs.filter((user) => {
		return user.data().userSubscription.priceMax >= apartmentRM.price &&
			user.data().userSubscription.priceMin <= apartmentRM.price &&
			user.data().userSubscription.areaMax >= apartmentRM.area;
	});

	users.forEach((user) => {
		user.data().pushSubscription.forEach((pushSubscription: webpush.PushSubscription) => {
			webpush.sendNotification(pushSubscription, JSON.stringify({ title: pushMessage, image: images[0] }))
				.then((res) => console.log('Successfully sent Notifications.', res))
				.catch((err) => console.log(err));
		});
	});


	res.end();
});

app.delete('/apartments/:apartmentId', async (req, res) => {
	res.set('Access-Control-Allow-Origin', '*');
	const apartmentId = req.params.apartmentId;
	const { apartment } = req.body;

	const apartmentsRef = admin.firestore().collection('apartments');

	webpush.setGCMAPIKey(GCMAPIkey);
	webpush.setVapidDetails(
		'mailto:example@gmail.com',
		publicKey,
		privateKey
	);

	const usersRef = admin.firestore().collection('users');
	const querySnapshot =
		await usersRef
			.where('userSubscription.partOfTown', '==', apartment.partOfTown)
			.where('userSubscription.areaMin', '<=', +apartment.area)
			.get();

	const users = querySnapshot.docs.filter((user) => {
		return user.data().userSubscription.priceMax >= apartment.price &&
			user.data().userSubscription.priceMin <= apartment.price &&
			user.data().userSubscription.areaMax >= apartment.area;
	});

	const pushMessage = `Oglas '${apartment.title}' je izbrisan od strane autora.`;

	users.forEach((user) => {
		user.data().pushSubscription.forEach((pushSubscription: webpush.PushSubscription) => {
			webpush.sendNotification(pushSubscription, JSON.stringify({ title: pushMessage }))
				.then((res) => console.log('uspjeh', res))
				.catch((err) => console.log(err));
		});
	});

	try {
		await apartmentsRef.doc(apartmentId).delete();
		res.status(200).send(apartmentId);
	} catch (e) {
		res.status(400).send(e);
	}
});

exports.stankoapi = functions.region('europe-west1').https.onRequest(app);
