const express = require('express');
const router = express.Router();

// MongoDB model
let Photo = require('../models/photo');

router.route('/')
	.get((req, res) => {
		Photo.find()
		.sort({_id: -1})
		.limit(20)
		.exec()
		.then(photos => {
			res.render('index', {
				photos: photos,
				title: 'Recently Added Photos',
				nameOfThePage: 'Recently Added Photos'
			});
		})
		.catch(err => {
			custom.error(err);
			res.status(500).json({error: err})
		});
	})
	.post((req, res) => {
		res.send('This was a post request');
	})
	.put((req, res) => {
		res.send('This is PUT');
	})
	.patch((req, res) => {
		res.send('PATCH request');
	})
	.delete((req, res) => {
		res.send('DELETE request');
	})

module.exports = router;