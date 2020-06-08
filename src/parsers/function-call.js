const A = require('arcsecond');

const v = require('./variables');
const up = require('./util-parsers');

const calcFunctionCall = A.coroutine(function* () {

	yield A.optionalWhitespace;

	yield A.str('calc(');

	yield A.optionalWhitespace;

	let left = yield A.choice([
		calcFunctionCall,
		functionCall,
		up.intLiteral,
		up.variable
	]);

	yield A.optionalWhitespace;

	let operator = yield up.operator;

	yield A.optionalWhitespace;

	let right = yield A.choice([
		calcFunctionCall,
		functionCall,
		up.intLiteral,
		up.variable
	]);

	yield A.optionalWhitespace;

	yield A.char(')');

	return up.asType('CALC_FUNCTION_CALL') ({
		left,
		operator,
		right
	});

});

const functionCall = A.coroutine(function*() {

	yield A.optionalWhitespace;

	let name = yield up.variable;

	yield A.char('(');

	let params = yield up.commaSeperated(A.choice([
		calcFunctionCall,
		functionCall,
		up.variable,
		up.stringLiteral,
		up.boolLiteral,
		up.intLiteral
	]));

	yield A.char(')');

	return up.asType('FUNCTION_CALL') ({
		name,
		params
	});

});

module.exports = {
	calcFunctionCall,
	functionCall
};
