let async = require("async");
let crypto = require('crypto');
let User = require("../model/models.js");
let config = require("../config/config.json");
let helper = require("../helpers/email.js");
let mongoose = require('mongoose');

module.exports = {
    getUser: function(req, res) {
        User.findOne({ email: req.body.email }, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(400).send({ status: false, message: JSON.stringify(err) })
            }
            var newObject = JSON.stringify(user),
                userdata = JSON.parse(newObject);
            delete userdata['password'];
            return res.status(200).send({ status: true, data: userdata });
        });
    },
    getUsers: function(req, res) {
        // var filter = req.body.filter || {};
            
        //     delete req.body.filter;

        // if(filter && typeof filter == "string"){
        //     filter = JSON.parse(filter);
        // }
        
        var option = req.body || {};
        //     keys = Object.keys(option),
        //     limit = filter.limit || config.constant.DEFAULT_LIMIT,
        //     pageSkip = filter.page || 0;

        // if(option && keys){
        //     if(keys.length == 0)    option = {};
        // }
        // option['display'] = true;
        // if(typeof pageSkip == "number" && typeof limit == "number"){
            User
                .find(option)
                // .skip(pageSkip*limit)
                // .limit(limit)
                .then(function(divisions, err) {
                    if(err){
                        return res.status(400).send({ status: false, message: JSON.stringify(err) })
                    }
                    User.count(function(err, count){
                        if(err){
                            return res.status(400).send({ status: false, message: JSON.stringify(err) })
                        }
                        return res.status(200).send({ status: true, documents: count, data: divisions });
                    });
                });
        // }else{
        //     return res.status(400).send({ status: false, message: globalError.INPUT_TYPE })
        // }
    },
    updateUsers: function(req, res){
        try{
            let where = req.body.id;
            if(where){
                User.findOne({ _id : where }, function(err, user) {
                    if (!user) {
                        return res.status(500).send({ status: false, message: globalError.USER_NOTEXIST });
                    }
                    // set the user's local credentials
                    user.firstName = req.body.firstName;
                    user.lastName = req.body.lastName;
                    user.title = req.body.title;
                    user.phone = req.body.phone;
                    user.active = req.body.active;                   
                    user.date_Modified = Date.now();

                    user.save(function(err) {
                        if (err)
                            return res.status(400).send({ status: false, message: JSON.stringify(err) })
                        return req.res.status(200).send({status:true, data: req.user});
                    });
                });
            }else{
                return res.status(400).send({ status: false, message: globalError.INPUT_NOT_VALIDATE })
            }
        }catch(e){
            console.log(e);
            return res.status(400).send({ status: false, message: e })
        }
    },
    deleteUser: function(req, res) {
        let where = req.body.id,
            multi = req.body.multi || false;
        if(where){
            if(multi){
                if(typeof where == "string"){
                    where = JSON.parse(where);
                }
                User.update(
                        { _id: { $in: where } },
                        {
                            $set:{
                                display : false
                            }
                        },
                        {multi: true}, function(err, doc){
                    if(err)
                        return res.status(400).send({ status: false, message: JSON.stringify(err) });
                    return req.res.status(200).send({status: true, data: doc});
                });
            }else{
                User.findOneAndUpdate(
                        {_id: where}, 
                        {
                            $set:{
                                display : false
                            }
                        }, function(err, doc){
                    if(err)
                        return res.status(400).send({ status: false, message: JSON.stringify(err) });
                    return req.res.status(200).send({status: true, data: doc});
                });
            }
        }else{
            return res.status(400).send({ status: false, message: globalError.INPUT_NOT_VALIDATE })
        }
    },
    logoutUser: function(req, res) {
        req.logout();
        res.status(200).send({ status: true, message: "Successful logout." })
    },
    forgetPass: function(req, res) {
        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                User.findOne({ email: req.body.email }, function(err, user) {
                    if (!user) {
                        return res.status(500).send({ status: false, message: globalError.USER_NOTEXIST });
                    }

                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + config.reset_pass_time;

                    user.save(function(err) {
                        done(err, token, user);
                    });
                });
            },
            function(token, user, done) {
                var option = {
                    subject: 'Reset Password',
                    to: user.email,
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.host + '/set-password.html?tokenid=' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                }
                helper.sendEmail(option, function(data) {
                    if (data && data.status) {
                        return res.status(200).send({ status: true, message: " Verification Email Sent. " });
                    } else {
                        return res.status(400).send({ status: false, message: data.message });
                    }
                })
            }
        ], function(err) {
            console.log(err);
            // res.redirect('/forgot');
        });
    },
    tokenValidate: function(req, res) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user)
                return res.status(500).send({ status: false, message: globalError.TOKEN_INVALID });
            return res.status(200).send({ status: true, message: " Valid User. " });
        });
    },
    resetPass: function(req, res) {
        async.waterfall([
            function(done) {
                User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                    if (!user)
                    	return res.status(500).send({ status: false, message: globalError.TOKEN_INVALID });

                    let newUser = new User();
                    user.password = newUser.generateHash(req.body.password);
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
                    user.save(function(err) {
                        req.logIn(user, function(err) {
                            done(err, user);
                        });
                    });
                });
            },
            function(user, done) {
                var option = {
                    to: user.email,
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                }
                helper.sendEmail(option, function(data) {
                    if (data && data.status) {
                        return res.status(200).send({ status: true, message: "password reset." });
                    } else {
                        return res.status(400).send({ status: false, message: data.message });
                    }
                })
            }
        ], function(err) {
            res.redirect('/');
        });
    },
    filterLogin: function(req, res) {
        let name = req.body.name || undefined,
            email = req.body.email || undefined,
            phone = req.body.phone || undefined,
            role = req.body.role || undefined,
            status = req.body.status || undefined,
            dateRange = req.body.dateRange || {},
            filter = req.body.filter || {},
            sort = req.body.sort || undefined,
            sortObj = {};

        if(sort){
            var type = 1;
            if (typeof sort == "string") {
                sort = JSON.parse(sort);
            }
            
            if(sort.type == "desc"){  // descending vs ascending
                type = -1;
            }

            if(sort.name){
                sortObj['sub_type'] = type;
            }else{
                sortObj['date_Modified'] = type;
            }
        }else{
            sortObj['date_Modified'] = -1;
        }

        let filterObj = {};

        if (name) {
            name = new RegExp(name, 'gi');
        }

        (name) ? filterObj['firstName'] = name: filterObj;
        (email) ? filterObj['email'] = email: filterObj;
        (phone) ? filterObj['phone'] = phone: filterObj;
        (role) ? filterObj['accessLevel'] = role: filterObj;
        (status) ? filterObj['active'] = status: filterObj;

        if (filter) {
            if (typeof filter == "string") {
                filter = JSON.parse(filter);
            }
            limit = filter.limit || config.constant.DEFAULT_LIMIT;
            pageSkip = filter.page || 0;
        }

        if (dateRange) {
            if (typeof dateRange == "string") {
                dateRange = JSON.parse(dateRange);
            }
            let startDate = dateRange.start,
                endDate = dateRange.end;
            if (startDate && endDate) {
                filterObj["date"] = { "$gt": new Date(startDate), "$lt": new Date(endDate) };
            }
        }
        filterObj['display'] = true;
        User
            .aggregate([
                {
                    $match: filterObj
                },
                {
                    $lookup:{ 
                        "from": "departments", 
                        "localField": "_id", 
                        "foreignField": "_idDivision._id", 
                        "as": "departments"
                    }
                },
                {
                    $addFields: {
                        sub_type: { $toLower: "$firstName" }
                    }
                },
                {
                    $sort: sortObj
                },
                {
                    $skip: pageSkip*limit
                },
                {
                    $limit: limit
                }
            ])
            .then(function(users, err) {
                if (err) {
                    return res.status(400).send({ status: false, message: JSON.stringify(err) })
                }
                User.count(filterObj, function(err, count) {
                    if (err) {
                        return res.status(400).send({ status: false, message: JSON.stringify(err) })
                    }
                    return res.status(200).send({ status: true, documents: count, data: users });
                })
            });
    }
}