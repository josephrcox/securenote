if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(express.static('./'));

app.use(bodyParser.json());

const mongoose = require('mongoose');
mongoose.connect(process.env.DATEBASE_URL, {});
const connection = mongoose.connection;
connection.once('open', function (res) {
	console.log('Connected to Mongoose!');
	connectedToDB = true;
});

const Note = require('./models/note');

app.post('/secureapi/lookup', async (req, res) => {
	const note = await Note.findOne({ encryptedKey: req.body.encryptedKey });
	if (!note) {
		res.json({ status: 404, data: 'Note not found' });
		return;
	}
	note.opens += 1;
	await note.save();
	res.json({ status: 200, data: note.encryptedData });
});

app.post('/secureapi/save', async (req, res) => {
	const encryptedData = req.body.encryptedData;
	const encryptedKey = req.body.encryptedKey;

	const note = await Note.findOne({ encryptedKey: req.body.encryptedKey });
	if (!note) {
		res.json({ status: 404, data: 'Note not found' });
		return;
	}
	note.encryptedData = encryptedData;
	await note.save();
	res.json({ status: 200, data: note });
});

app.post('/secureapi/store', async (req, res) => {
	const encryptedData = req.body.encryptedData;
	const encryptedKey = req.body.encryptedKey;

	const note = await Note.findOne({ encryptedKey: req.body.encryptedKey });
	if (note) {
		res.json({ status: 409, data: 'Note already exists' });
		return;
	}

	const newNote = new Note({
		encryptedKey: encryptedKey,
		encryptedData: encryptedData,
	});

	await newNote.save();
	res.json({ status: 200, data: newNote });
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
