// load the things we need
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    firstName: {    // First name of User
        type: String,
        required: true
    },
    lastName: {     // Last name of user
        type: String,
        required: true
    },
    gender: {     // Last name of user
        type: String,
        required: true
    },
    phone: {        // Contact No
        type: String
    },
    email: {        // User email ID
        type: String,
        required: true
    },
    password: {     // User password stored in Encrypted formate
        type: String,
        required: true
    },
    resetPasswordToken : {      // Reset password token store and match over here.
        type : String
    },
    resetPasswordExpires : {    // Reset password URL expire in how much hours, validation over here.
        type : Date
    },
    active:{    // Active/Inactive for user
        type: Boolean,
        default: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    date_Created: {
        type: Date
    },
    date_Modified: {
        type: Date,
        default: Date.now
    },
    display:{   // Soft delete of users
        type: Boolean
    }
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('users', userSchema);
