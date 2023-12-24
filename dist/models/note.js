const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
	{
		encryptedKey: { type: String, required: true },
		encryptedData: { type: String, required: false, default: '' },
		opens: { type: Number, default: 1 },
	},
	{ collection: 'notes', timestamps: true },
);

const Note = mongoose.model('noteSchema', noteSchema);

module.exports = Note;
