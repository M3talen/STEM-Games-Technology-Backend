const crypto = require('crypto');

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env]["crypto"];

const ENCRYPTION_KEY = config.key;
const algorithm = 'aes-256-cbc';

const { base64encode, base64decode } = require('nodejs-base64');

function encrypt(data) {
    if (!data) {
        return data;
    }
    var cipher = crypto.createCipher(algorithm,ENCRYPTION_KEY)
    var crypted = cipher.update(data,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;

}

function decrypt(data) {

    if (!data) {
        return data;
    }

    var decipher = crypto.createDecipher(algorithm,ENCRYPTION_KEY)
    var dec = decipher.update(data,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}



module.exports = { decrypt, encrypt };