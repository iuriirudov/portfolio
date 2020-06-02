const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const custom = require('../functions.js')

// MongoDB model
let Category = require('../models/category');
let Photo = require('../models/photo');

// Categories
router.route('/')
	.get((req, res) => {
		Category
		.find()
		.exec()
		.then(categories => {
			res.render('gallery', {
				categories: categories,
				title: 'Photo Gallery/Portfolio',
				nameOfThePage: 'Photo Gallery'
			});
		})
		.catch(err => {
			custom.error(err);
			res.status(500).json({error: err})
		});
	})

router.route('/addCategory')
	.get((req, res) => {
		res.render('galleryAddCategory', {
			title: 'Add a category to gallery',
			nameOfThePage: 'Adding a category to the Gallery'
		});
	})
	.post(async(req, res) => {
		if(!req.body.name && !req.body.image) {
			return res.redirect('/');
		}
		let category = new Category();
		category.name = req.body.name;
		category.image = req.body.image;
		category.alias = custom.slug(req.body.name);

		try {
			let duplicate = await Category.find({'alias': category.alias});
			if(duplicate.length > 0) {
				category.alias = category.alias + '_' + uuidv4();
			}
			await category.save();
			res.redirect('/gallery');
		} catch(err) {
			console.log(err);
			res.redirect('/');
		}
	});

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


// Photos
router.route('/:cat/add')
	.get(async(req, res) => {
		try {
			await Category.find({'alias': req.params.cat}, (err, category) => {
				if(err || !category || category.length != 1) return res.redirect('back');
				res.render('addPhoto', {
					data: category[0],
					title: `Adding a photo to ${category[0].name}`,
					nameOfThePage: `Adding a photo to ${category[0].name}`
				});
			});
		} catch(err) {
			console.log(err);
			res.redirect('back');
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