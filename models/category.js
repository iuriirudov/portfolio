let mongoose = require('mongoose');

// Category Schema
let categorySchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	image: {
		type: String,
		required: true
	},
	alias: {
		type: String,
		required: true
	}
});

let Category = module.exports = mongoose.model('Category', categorySchema);