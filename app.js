if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const session = require('express-session')
const GenericMiddleware = require('./middleware')
const { v4: uuidv4 } = require('uuid')

const {
    SESSION_NAME = uuidv4(),
    SESSION_LIFETIME = 1000*60*20,
    SESSION_SECRET = 'secret string'
} = process.env

const index = require('./routes/index')
const categories = require('./routes/categories')
const photos = require('./routes/photos')
const user = require('./routes/user')
const about = require('./routes/about')
const contact = require('./routes/contact')
const order = require('./routes/order')

// test comment
app.set('view engine', 'pug')
app.set('views', __dirname + '/views')
app.use(methodOverride('_method'))
app.use('/static', express.static(path.join(__dirname, '/public')))
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))
app.use(bodyParser.json())

app.use(session({
    name: SESSION_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESSION_SECRET,
    cookie: {
        maxAge: SESSION_LIFETIME,
        sameSite: true,
        secure: false
    }
}))
app.use(GenericMiddleware)

mongoose.connect(process.env.DATABASE_URL + 'portfolio', {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/', index)
app.use('/gallery', categories)
app.use('/gallery', photos)
app.use('/user', user)
app.use('/about', about)
app.use('/contact', contact)
app.use('/order', order)

app.listen(process.env.PORT || 3001, process.env.IP, () => console.log('Server is started'))