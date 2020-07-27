const express = require('express')
const app = express()
const router = express.Router()
const User = require('../models/user')

router.use(async(req, res, next) => {
    const {userId} = req.session
    if(userId) {
        res.locals.user = await User.findById(userId)
    }
    next()
})

module.exports = router;