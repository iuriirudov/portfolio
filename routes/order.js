const express = require('express');
const router = express.Router();

router.route('/')
	.get((req, res) => {
		res.render('order', {
			title: 'Order',
			nameOfThePage: 'Order Page'
		})
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