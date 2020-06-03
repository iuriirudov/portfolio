let mongoose = require('mongoose')

let photoSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	categoryAlias: {
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
})

let Photo = module.exports = mongoose.model('Photo', photoSchema)