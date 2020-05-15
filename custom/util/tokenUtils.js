"use strict"

var crypto = require('crypto');
const tokenUtils = function getToken(val) {
	return crypto.createHash('sha256')
		.update(val, 'utf8')
		.digest('hex');

}

module.exports.tokenUtils = tokenUtils;