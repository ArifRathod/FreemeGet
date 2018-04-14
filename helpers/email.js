/*================================================================ 
            History Of The File 
    Author			- Gunjan Patel 
    purpose         - Writing - For Sending Email Configuration.
==================================================================== **/
const nodemailer = require('nodemailer');

let config = require('../config/config.json');

let transporter = nodemailer.createTransport({
    host: 'smtp.'+config.email.service+'.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: config.email.user, // generated ethereal user
        pass: config.email.pass // generated ethereal password
    }
});

function sendEmail(option, callback) {
	if(typeof option == "object") {
		option['from'] = config.email.from;
		
		var verified = checkDetails(option);
		if(verified){
			transporter.sendMail(option, (error, info) => {
				if (error) {
				    console.log(error);
				    return callback({ status: false, message: globalError.PROCESSING });
				}
				console.log('Message sent: %s', info.messageId);
				console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
				callback({ status: true, data : info });
			});
		}else{
			return callback({ status: false, message: globalError.OBJECT_VERIFY });
		}
	}else{
		return callback({ status: false, message: globalError.OBJECT_VERIFY });
	}
}

//Helper function
function checkDetails(data) {
    if (typeof data === 'string') {
        data = JSON.parse(data);
    }
    for (pro in data) {
        if (!data[pro]) {
            return false;
        }
    }
    return true;
}

module.exports = {
	sendEmail : sendEmail
}