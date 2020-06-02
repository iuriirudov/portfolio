if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}
const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const index = require('./routes/index')
const categories = require('./routes/categories')
const photos = require('./routes/photos')
const about = require('./routes/about')
const contact = require('./routes/contact')
const order = require('./routes/order')

app.set('view engine', 'pug')
app.set('views', __dirname + '/views')
app.use(methodOverride('_method'))
app.use('/static', express.static(path.join(__dirname, '/public')))
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))
app.use(bodyParser.json())

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/', index)
app.use('/gallery', categories)
app.use('/gallery', photos)
app.use('/about', about)
app.use('/contact', contact)
app.use('/order', order)

app.listen(process.env.PORT || 3000, process.env.IP, () => console.log('Server is started'))