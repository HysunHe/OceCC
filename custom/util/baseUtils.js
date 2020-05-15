"use strict"

const isEmpty = function isEmpty(val) {
	if(val === undefined || val == null){
		return true;
	}else if (typeof val === 'object') {
		return (Object.keys(val).length > 0) ? false : true;
	} else {
		return (val.length <= 0) ? true : false;
	}

}

module.exports.isEmpty = isEmpty;