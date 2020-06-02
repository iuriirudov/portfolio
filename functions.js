const slugify = require('slugify')

function error(err) {
	return console.log('Error: ' + err)
}

function slug(string) {
	return slugify(string, {replacement: '_', lower: true})
}

function randomNumber(n) {
	return Math.ceil(Math.random()*n)
}


module.exports = {
	error,
	slug,
	randomNumber
}