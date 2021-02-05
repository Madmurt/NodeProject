const mongoose = require('mongoose');
const slugs = require('slugs');

const storeSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: 'Please enter a store name!',
	},
	slug: String,
	description: {
		type: String,
		trim: true,
	},
	tags: [String],
});

module.exports = mongoose.model('store', storeSchema);
