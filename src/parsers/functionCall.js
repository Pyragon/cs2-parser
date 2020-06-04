const A = require('arcsecond');

const v = require('./variables');
const up = require('./util-parsers');

const functionCall = A.coroutine(function*() {

	let name = yield v.variable;

	yield A.char('(');

	let params = yield up.commaSeperated(A.choice([
		functionCall,
		v.variable,
		up.stringLiteral,
		up.boolLiteral,
		A.digits.map(up.asType('INT_LITERAL'))
	]));

	return up.asType('FUNCTION_CALL') ({
		name,
		params
	});

});

module.exports = {
	functionCall
};
