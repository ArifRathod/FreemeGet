// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');

// load up the user model
var user_model = require('../model/models');


// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    console.log(user);
    done(null, user);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    user_model.findById(id, function(err, user) {
        done(err, user);
    });
});

// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'

passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        console.log(email,password,req.body);
        // asynchronous
        // user_model.findOne wont fire unless data is sent back
        process.nextTick(function() {
            user_model.findOne({ 'email': email }, function(err, user) {
                console.log(">>>>>>>",err,user)
                // if there are any errors, return the error
                if (err)
                    return req.res.status(400).send({ status:false, message: JSON.stringify(err)});

                // check to see if theres already a user with that email
                if (user) {
                    return req.res.status(200).send({ status:false, message: "Email Already Exist"});
                } else {
                    // if there is no user with that email
                    // create the user
                    var newUser = new user_model();

                    // set the user's local credentials
                    newUser.email = email;
                    newUser.firstName = req.body.firstName;
                    newUser.lastName = req.body.lastName;
                    newUser.gender = req.body.gender;
                    newUser.phone = req.body.phone;
                    newUser.date = Date.now();
                    newUser.password = newUser.generateHash(password);
                    console.log(">>>>>asd>>",newUser)
                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return req.res.status(200).send({status:true});
                    });
                }
            });
        });
    }
));

passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
},

function(req, email, password, done) { // callback with email and password from our form
    user_model.findOne({ 'email': email, 'active': true }, function(err, user) {
        console.log("user---",user)
        if (err)
            return req.res.status(400).send({ status:false, message: JSON.stringify(err)});

        if (!user)
            return req.res.status(500).send({ status:false, message: "User Not Exist"});

        if (!user.validPassword(password))
            return req.res.status(500).send({ status:false, message: "Wrong Password"});
        return done(null, user);
    });
}));