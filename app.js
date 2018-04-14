let express = require('express'),
	mongoose = require('mongoose'),
	path = require('path'),
	passport = require('passport'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	MongoStore = require('connect-mongo')(session);

global.__rootDir = __dirname; 
global.config = require('./config/config.json'),
require(__rootDir+'/middleware/passport');

const app = express(),
	config_DB = require('./db/database_con.js'),
	port = process.env.PORT || config.PORT || "3000",
	host_ip = config.HOST || "127.0.0.1";

var db = mongoose.connection;
config_DB.connectMongoDB();

app.use(cookieParser());
app.use(bodyParser.json({limit: '500:mb'}));
app.use(bodyParser.urlencoded({limit: '500mb', extended: true}));
// app.use(express.static(__dirname + '/public'));
// app.set('view engine', 'html');
app.set('views', path.join(__dirname, '/public'));
app.use(express.static(__dirname + '/public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(session(
	{ 
		secret: 'arifrathod',
	    resave: true,
	    saveUninitialized: true,
	    store: new MongoStore(
	    	{
	    		mongooseConnection : db
	    	}
	    )        
	}
));

app.use(passport.initialize());
app.use(passport.session());

// routes
setTimeout(function(){
	require('./routes/router.js')(app, passport); // load our routes and pass in our app and fully configured passport
}, 1000);
// var routes = require('./routes/router');
// app.use('/', routes);
app.listen(port, host_ip);
console.log('Server started on port number : ' + port);