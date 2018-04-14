let mongoose = require('mongoose');
mongoose.Promise = Promise;

function connect_mongo() {
    let connection_str = "mongodb://" +config.mongo.mongohost+":"+config.mongo.port+"/"+config.mongo.database;

    if (config.mongo.username && config.mongo.password) {
        connection_str = "mongodb://" + config.mongo.username + ":" + config.mongo.password + '@' + connection_str;
    }
    //CONNECTION WITH MONGOOSE
    mongoose.connect(connection_str, { useMongoClient: true });

    // When successfully connected
    mongoose.connection.on('connected', function() {
        console.log('Mongo database connection estabilished successfully. ');
    });

    // If the connection throws an error
    mongoose.connection.on('error', function(err) {
        console.log('Mongoose default connection error: ' + err);
    });

    // When the connection is disconnected
    mongoose.connection.on('disconnected', function() {
        console.log('Mongoose default connection disconnected');
    });

    // If the Node process ends, close the Mongoose connection 
    process.on('exit', function() {
        console.log('Goodbye!!! Node Server stoped');
    });

    process.on('SIGINT', function() {
        mongoose.connection.close(function() {
            console.log('Mongoose default connection disconnected through app termination');
            process.exit(0);
        });
    });

}

module.exports = {
    connectMongoDB: connect_mongo
}