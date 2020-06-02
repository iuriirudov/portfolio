const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const custom = require('../functions.js')

const Category = require('../models/category')
const Photo = require('../models/photo')

// All Categories Route
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
		if(!req.body.name || !req.body.image) {
			return res.redirect('/')
		}
		const category = new Category({
			name: req.body.name,
			image: req.body.image,
			alias: custom.slug(req.body.name)
		})

		try {
			let duplicate = await Category.find({'alias': category.alias})
			if(duplicate.length > 0) category.alias = category.alias + '_' + uuidv4()
			const newCategory = await category.save()
			res.redirect(`/gallery/${newCategory.alias}`)
		} catch {
			res.redirect('/gallery/addCategory')
		}
	})

router.route('/:id')
	.get((req, res) => {
		Photo.find({'category.alias': req.params.id})
		.sort({_id: -1})
		.exec()
		.then(photos => {
			if(photos.length != 0) {
				res.render('category', {
					photos: photos,
					category: photos[0].category,
					title: photos[0].category.name,
					nameOfThePage: photos[0].category.name
				});
			} else {
				Category.findOne({'alias': req.params.id})
				.exec()
				.then(category => {
					res.render('category', {
						category: category,
						title: category.name,
						nameOfThePage: category.name
					})
				})
				.catch(err => {
					console.log(err);
					return res.redirect(`/gallery/`);
					//res.status(500).json({error: err});
				});
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
	})
	.put(async(req, res) => {
		if(!req.body.name && !req.body.image) {
			return res.redirect('/');
		}
		await Category.findOne({'alias': req.params.id}, async(err, category) => {
			if(!category && category.alias != req.params.id) {
				console.log(err);
				return res.redirect('/gallery');
			}
			let formData = {
				'name': req.body.name,
				'image': req.body.image,
				'alias': custom.slug(req.body.name)
			};
			let duplicate = await Category.find({'alias': formData.alias});
			if(duplicate.length > 0 && !duplicate[0]._id.equals(category._id)) {
				formData.alias = formData.alias + '_' + uuidv4();
			}
			await Category.updateOne({'alias': req.params.id}, formData, async err => {
				await Photo.updateMany({ 'category.id': category._id }, {'category.name': formData.name, 'category.alias': formData.alias}, err => {});
				await (err) ? res.redirect('/') : res.redirect(`/gallery/${formData.alias}`);
			});
		});
	})
	.delete(async(req, res) => {
		await Category.findOne({'alias': req.params.id}, async(err, category) => {
			if(!category && category.alias != req.params.id) {
				console.log(err);
				return res.redirect('/gallery');
			}
			try {
				await Category.deleteOne({'alias': req.params.id, '_id': category._id}, async(err) => {
					await Photo.deleteMany({'category.id': category._id}, (err) => {
						return res.redirect('/gallery');
					});
				});
			} catch(err) {
				console.log(err);
				return res.redirect('back');
			}
		});
	});

router.get('/:id/edit', async(req, res) => {
	await Category.findOne({'alias': req.params.id}, (err, category) => {
		if(category && category.alias === req.params.id) {
			res.render('galleryEditCategory', {
				category: category,
				title: 'Editing Category: ' + category.name,
				nameOfThePage: 'Editing Category: ' + category.name
			});
		} else {
			console.log(err);
			res.redirect('/gallery');
		}
	});
});

module.exports = router;