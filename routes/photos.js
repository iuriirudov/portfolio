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
		} catch(err) {
			res.redirect('/gallery')
		}
	})
	.post(async(req, res) => {
		if(!req.body.name || !req.body.image) {
			return res.redirect('back');
		}

		try {
			await Category.findOne({'alias': req.params.cat}, async(err, category) => {
				if(!category && category.alias != req.params.cat) {
					console.log('No category or wrong alias');
					return res.redirect('back');
				}
				let photo = new Photo();
				photo.name = req.body.name;
				photo.category.id = category._id;
				photo.category.name = category.name;
				photo.category.alias = category.alias;
				photo.image = req.body.image;
				photo.alias = custom.slug(req.body.name);
				photo.tags = req.body.tags.split(',').map(item=>item.trim());
				photo.views = 0;

				let duplicate = await Photo.find({'alias': photo.alias});
				if(duplicate.length > 0) {
					photo.alias = photo.alias + '_' + uuidv4();
				}
				await photo.save();
				res.redirect(`/gallery/${req.params.cat}`);
			});
		} catch(err) {
			console.log(err);
			res.redirect('back');
		}
	});

router.get('/:cat/:photo/edit', async(req, res) => {
	try {
		await Photo.findOne({'alias': req.params.photo}, async(err, photo) => {
			if(err || !photo) {
				console.log('Photo ALIAS doesn\'t match');
				return res.redirect('/gallery');
			}
			try {
				await Category.find({}, (err, Categories) => {
					res.render('editPhoto', {
						allCategories: Categories,
						photo: photo,
						title: 'Edit photo \"' + photo.name + '\"',
						nameOfThePage: 'Editing photo \"' + photo.name + '\"'
					});
				});
			} catch(err) {
				console.log(err);
				res.redirect('back');
			}
		});
	} catch(err) {
		console.log('error with finding photo');
		console.log(err.stack);
		res.redirect('back');
	}
});
router.route('/:cat/:photo')
	.get(async(req, res) => {
		try {
			await Photo.findOne({'alias': req.params.photo}, async(err, photo) => {
				if(err || !photo) {
						console.log('Photo ALIAS doesn\'t match');
						return res.redirect('/gallery');
				}
				try {
					await Category.findOne({'alias': req.params.cat}, async(err, category) => {
						if(err || !category) {
							console.log('Category ALIAS doesn\'t match');
							return res.redirect('/gallery');
						}
						photo.views+=1;
						photo.save();
						res.render('photo', {
							category: category,
							photo: photo,
							title: photo.name,
							nameOfThePage: photo.name
						});
					});
				} catch(err) {
					console.log(err);
					res.redirect('back');
				}
			});
		} catch(err) {
			console.log('error with finding photo');
			console.log(err.stack);
			res.redirect('back');
		}
	})
	.delete(async(req, res) => {
		try {
			await Photo.findOne({'alias': req.params.photo}, async(err, photo) => {
				if(err || !photo) {
					console.log('error with photo.findOne');
					return res.redirect('back');
				}
				try {
					await Photo.deleteOne({'_id': photo._id}, (err) => {
						res.redirect('/gallery/' + req.params.cat);
					});
				} catch(err) {
					console.log(err);
					res.redirect('back');
				}
			});
		} catch(err) {
			console.log(err);
			res.redirect('back');
		}
	})
	.put(async(req, res) => {
		try {
			await Photo.find({'alias': req.params.photo}, async(err, photo) => {
				if(err || !photo || photo.length != 1) {
					console.log('ERROR: Photo.find in PUT');
					return res.redirect('back');
				}
				try {
					await Category.find({'_id': req.body.cat_id}, async(err, category) => {
						if(err || !category) {
							console.log('error with Category.findOne');
							return res.redirect('back');
						}
						let formData = {
							'name': req.body.name,
							'image': req.body.image,
							'category.id': category[0]._id,
							'category.name': category[0].name,
							'category.alias': category[0].alias,
							'alias': custom.slug(req.body.name),
							'tags': req.body.tags.split(',').map(item=>item.trim()),
							//'dateOfModification': moment()
						}
						Photo.find({'alias': formData.alias})
						.exec()
						.then(duplicate => {
							if(duplicate.length > 0 && !duplicate[0]._id.equals(photo[0]._id)) {
								formData.alias = formData.alias + '_' + uuidv4();
							}
							Photo.updateOne({'alias': req.params.photo}, formData, err => {
								(err) ? res.redirect('/') : res.redirect(`/gallery/${category[0].alias}/${formData.alias}`);
							});
						})
						.catch(err => {
							console.log(err);
							res.status(500).json({
								error: err
							});
						});
					});
				} catch(err) {
					console.log(err);
					res.redirect('back');
				}
			});
		} catch(err) {
			console.log(err);
			res.redirect('back');
		}
	});

module.exports = router;