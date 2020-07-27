const express = require('express')
const app = express()
const router = express.Router()
const Category = require('../models/category')
const Photo = require('../models/photo')
const User = require('../models/user')
const middleware = require('../middleware/login')
const bcrypt = require('bcrypt')

router.route('/')
.get(middleware.redirectLogin, async(req, res) => {
    const {user} = res.locals
    const title = 'Registration Form'
    const nameOfThePage = 'Registration'
    res.render('user/profile', {title, nameOfThePage})
})

router.route('/login')
.get(middleware.redirectHome, async(req, res) => {
    const title = 'Registration Form'
    const nameOfThePage = 'Registration'
    const user = res.locals.user
    res.render('user/login', {title, nameOfThePage})
})

.post(middleware.redirectHome, async(req, res) => {
    const {email, password} = req.body

    if(email && password) { //TODO validation
        const user = await User.findOne({email: email})
        if(user) {
            if(await bcrypt.compare(password, user.password)) {
                req.session.userId = user.id
                return res.redirect("/user")
            } else {
                return res.send('Password is incorrect')
            }
        } else {
            return res.send('email not found, please register')
        }
    }
    res.redirect("/user/login")
})

router.route('/register')
.get(middleware.redirectHome, async(req, res) => {
    const title = 'Registration Form'
    const nameOfThePage = 'Registration'
    const user = res.locals.user
    res.render('user/register', {title, nameOfThePage})
})

.post(middleware.redirectHome, async(req, res) => {
    const {email, password, name} = req.body
    try {
        if(email && password && name) { //TODO validation

            // password encryption
            const hashedPassword = await bcrypt.hash(password, 10)

            const exist = await User.find({'email': email})
            if(!exist.length != 0) {
                const user = new User({
                    name,
                    email,
                    password: hashedPassword,
                    isAdmin: false
                })
                const newUser = await user.save(user)
    
                req.session.userId = newUser._id
    
                return res.redirect('/user')
            } else {
                console.log('Error, user exist')
                res.redirect('/user/register')
            }
        } else {
            console.log('Error email, password, name existance')
            res.redirect('/user/register')
        }
    } catch (err) {
        console.log(err)
        res.redirect('/user/register') // TODO querry string errors
    }
})

router.route('/logout')
.post(middleware.redirectLogin, async(req, res) => {
    req.session.destroy()
    res.clearCookie(process.env.SESSION_NAME)
    res.redirect('/user/login')
})

module.exports = router