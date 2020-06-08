const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const custom = require('../functions.js')

const Category = require('../models/category')
const Photo = require('../models/photo')

router.route('/')
	.get(async(req, res) => {
		try {
			const categories = await Category.find()
			res.render('categories/index', {
				categories,
				title: 'Photo Gallery/Portfolio',
				nameOfThePage: 'Photo Gallery'
			});
		} catch {
			res.redirect('/')
		}
	})

router.route('/addCategory')
	.get((req, res) => {
		res.render('categories/new', {
			title: 'Add a category',
			nameOfThePage: 'Adding a category'
		})
	})
	.post(async(req, res) => {
		if(!req.body.name || !req.body.image) return res.redirect('/')
		try {
			let category = new Category({
				name: req.body.name,
				image: req.body.image,
				alias: custom.slug(req.body.name)
			})
			let duplicate = await Category.find({'alias': category.alias})
			if(duplicate.length > 0) category.alias = category.alias + '_' + uuidv4()
			const newCategory = await category.save()
			res.redirect(`/gallery/${newCategory.alias}`)
		} catch {
			res.redirect('/gallery/addCategory')
		}
	})

router.route('/:alias')
	.get(async(req, res) => {
		try {
			const photos = await Photo.find({'categoryAlias': req.params.alias}).sort({_id: -1})
			const category = await Category.findOne({'alias': req.params.alias})
			if(photos.length == 0 && !category) return res.redirect('/gallery')
			res.render('photos/index', {
				photos,
				category,
				title: category.name,
				nameOfThePage: category.name
			})
		} catch {
			res.redirect('/')
		}
	})
	.put(async(req, res) => {
		if(!req.body.name || !req.body.image) return res.redirect('/gallery')
		let formData = {
			'name': req.body.name,
			'image': req.body.image,
			'alias': custom.slug(req.body.name)
		}
		try {
			let category = await Category.findOne({'alias': formData.alias})
			if(category && category.alias != req.params.alias) formData.alias += '_' + uuidv4()
			await Category.updateOne({'alias': req.params.alias}, formData)
			await Photo.updateMany({ 'categoryAlias': req.params.alias }, {'categoryAlias': formData.alias})
			res.redirect(`/gallery/${formData.alias}`)
		} catch {
			res.redirect('/gallery')
		}
	})
	.delete(async(req, res) => {
		try {
			const category = await Category.findOne({'alias': req.params.alias})
			if(category.alias != req.params.alias) return res.redirect('back')
			await category.deleteOne()
			await Photo.deleteMany({'categoryAlias': category.alias})
			res.redirect('/gallery')
		} catch {
			res.redirect('back');
		}
	})

router.get('/:alias/edit', async(req, res) => {
	try {
		const category = await Category.findOne({'alias': req.params.alias})
		if(!category || category.alias != req.params.alias) return res.redirect('/gallery')
		res.render('categories/edit', {
			category,
			title: 'Editing Category: ' + category.name,
			nameOfThePage: 'Editing Category: ' + category.name
		})
	} catch {
		res.redirect('/gallery')
	}
})

module.exports = router