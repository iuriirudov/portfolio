const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const custom = require('../functions.js')

const Category = require('../models/category')
const Photo = require('../models/photo')

router.route('/:cat/add')
	.get(async(req, res) => {
		try {
			const category = await Category.findOne({'alias': req.params.cat})
			if(!category) return res.redirect('/gallery')
			res.render('photos/add', {
				data: category,
				title: `Adding a photo to ${category.name}`,
				nameOfThePage: `Adding a photo to ${category.name}`
			})
		} catch {
			res.redirect('/gallery')
		}
	})
	.post(async(req, res) => {
		if(!req.body.name || !req.body.image) return res.redirect('/')
		try {
			const category = await Category.findOne({'alias': req.params.cat})
			let photo = new Photo({
				name: req.body.name,
				categoryAlias: category.alias,
				image: req.body.image,
				alias: custom.slug(req.body.name),
				tags: req.body.tags.split(',').map(item=>item.trim()),
				views: 0
			})
			let duplicate = await Photo.find({'alias': photo.alias})
			if(duplicate.length > 0) photo.alias = photo.alias + '_' + uuidv4()
			const newPhoto = await photo.save()
			res.redirect(`/gallery/${category.alias}/${newPhoto.alias}`)
		} catch {
			res.redirect('back')
		}
	});

router.get('/:cat/:photo/edit', async(req, res) => {
	try {
		const photo = await Photo.findOne({'alias': req.params.photo})
		if(!photo || photo.alias != req.params.photo || photo.categoryAlias != req.params.cat) return res.redirect('/gallery')
		const categories = await Category.find()
		res.render('photos/edit', {
			categories,
			photo,
			title: 'Edit photo \"' + photo.name + '\"',
			nameOfThePage: 'Editing photo \"' + photo.name + '\"'
		})
	} catch {
		res.redirect('/gallery')
	}
})

router.route('/:cat/:photo')
	.get(async(req, res) => {
		try {
			const photo = await Photo.findOne({'alias': req.params.photo})
			if(!photo || photo.alias != req.params.photo || photo.categoryAlias != req.params.cat) return res.redirect('/gallery')
			const category = await Category.findOne({'alias': req.params.cat})
			if(!category || category.alias != req.params.cat) return res.redirect('/gallery')
			photo.views += 1
			photo.save()
			res.render('photos/photo', {
				category,
				photo,
				title: photo.name,
				nameOfThePage: photo.name
			})
		} catch {
			res.redirect('/gallery')
		}
	})
	.delete(async(req, res) => {
		try {
			const photo = await Photo.findOne({'alias': req.params.photo})
			if(!photo || photo.alias != req.params.photo || photo.categoryAlias != req.params.cat) return res.redirect('back')
			await photo.deleteOne()
			res.redirect(`/gallery/${photo.categoryAlias}`)
		} catch {
			res.redirect('/gallery')
		}
	})
	.put(async(req, res) => {
		if(!req.body.name || !req.body.image || !req.body.cat_id || !req.body.tags) return res.redirect('/gallery')
		let formData = {
			'name': req.body.name,
			'image': req.body.image,
			'alias': custom.slug(req.body.name),
			'tags': req.body.tags.split(',').map(item=>item.trim()),
			//'dateOfModification': moment()
		}
		try {
			let photo = await Photo.findOne({'alias': formData.alias})
			const category = await Category.findOne({'_id': req.body.cat_id})
			if(photo && photo.alias != req.params.photo) formData.alias += '_' + uuidv4()
			formData.categoryAlias = category.alias
			await Photo.updateOne({'alias': req.params.photo}, formData)
			res.redirect(`/gallery/${category.alias}/${formData.alias}`)
		} catch {
			res.redirect('/gallery')
		}
	})

module.exports = router