/* eslint-disable no-useless-escape */
const { body, validationResult } = require("express-validator");

const validator = async (req, res, next) => {
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(400).json({ errors: errors.array({onlyFirstError:true}) });
	} 
	next();
};

module.exports = {validator, body}