const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override')
const path = require('path');
const session = require('express-session')
const mongoose  = require('mongoose')
const MongoStore = require('connect-mongo')(session)
const passport = require('passport')

/** Load config */
dotenv.config({ path: './config/config.env'});

/** Passport config */
require('./config/passport')(passport)

/** Connect to Database */
connectDB()

/** Init app */
const app = express()

/** Body parser */
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

/** Method override */
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  }))

/** Shows request (HTTP Method) in Console  */
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
} 

/** Static folder */
app.use(express.static(path.join(__dirname, 'public')));

/** Handlebars helpers */
const { formatDate, stripTags, truncate, editIcon, select} = require('./helpers/hbs')

/** Handlebars */
app.engine('.hbs', exphbs({ helpers: {
formatDate,
stripTags,
truncate,
editIcon,
select
},
defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');

/** Sessions */
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection})
}))

/** Passport Middleware */
app.use(passport.initialize())
app.use(passport.session())

/** Set global variabel */
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})

/** Routes */
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))


const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server is running ${process.env.NODE_ENV} mode on port ${PORT}`))