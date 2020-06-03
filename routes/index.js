const express = require('express')
const router = express.Router()

// MongoDB model
let Photo = require('../models/photo')

router.route('/')
	.get(async(req, res) => {
		try {
			const photos = await Photo.find().sort({_id: -1}).limit(20)
			res.render('index', {
				photos,
				title: 'Recently Added Photos',
				nameOfThePage: 'Recently Added Photos'
			})
		} catch {
			res.redirect('/gallery')
		}
	})
	.post((req, res) => {
		res.send('POST')
	})
	.put((req, res) => {
		res.send('PUT')
	})
	.patch((req, res) => {
		res.send('PATCH')
	})
	.delete((req, res) => {
		res.send('DELETE')
	})

module.exports = router