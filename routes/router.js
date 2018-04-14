var fs = require("fs");
var loginController = require("../controllers/login");

module.exports = function(app, passport) {

    app.all('/*', function(req, res, next){
        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'my-header,X-Requested-With,content-type,Authorization,cache-control');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        // Pass to next layer of middleware
        next();
    })

    // HOME PAGE (with login links)
    app.get('/', function(req, res) {
        res.send('OK');
    });
    
    /** Login, sighnup and Reset password URL generate here.  */
    app.post('/login', passport.authenticate('local-login', {session : true}), loginController.getUser);
    app.post('/signup', passport.authenticate('local-signup', {session : true}));
    app.get('/logout', loginController.logoutUser);
    app.post('/forget', loginController.forgetPass);
    app.get('/reset/:token', loginController.tokenValidate);
    app.post('/reset/:token', loginController.resetPass);
   
    /** Fetch user data, If you are already loggedin than and than you can access it. */
    app.post('/getUsers', isLoggedIn, loginController.getUsers);
    app.post('/updateUsers', isLoggedIn, loginController.updateUsers);
    app.post('/deleteUser', isLoggedIn, loginController.deleteUser);
    app.post('/filterLogin', isLoggedIn, loginController.filterLogin);
    
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()){
        next();
    }else{
        next();
        //return res.status(500).send({status:false, message: globalError.SESSION_EXPIRED});
    }
}