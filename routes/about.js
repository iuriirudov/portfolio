const express = require('express')
const router = express.Router()

router.route('/')
	.get((req, res) => {
		res.render('about', {
			title: 'About me',
			nameOfThePage: 'About me'
		});
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