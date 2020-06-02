let mongoose = require('mongoose');

// Photo Schema
let photoSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	category: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Category'
		},
		alias: String,
		name: String
	},
	image: {
		type: String,
		required: true
	},
	alias: {
		type: String,
		required: true
	},
	tags: {
		type: Array
	},
	dateOfCreation: {
		type: Date,
		default: new Date()
	},
	dateOfModification: {
		type: Date,
		default: new Date()
	},
	views: {
		type: Number
	}
});

let Photo = module.exports = mongoose.model('Photo', photoSchema);