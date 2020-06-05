const A = require('arcsecond');

const up = require('./util-parsers');
const v = require('./variables');
const fc = require('./functionCall');

const statement = A.coroutine(function* () {
	
	let type = yield A.choice([
		A.str('if'),
		A.str('while'),
	]);
	yield A.char('(');
	yield A.optionalWhitespace;
	let left = yield A.choice([
		fc.calcFunctionCall,
		fc.functionCall,
		up.intLiteral,
		up.boolLiteral,
	]);
	yield A.optionalWhitespace;
	let operator = yield up.statementOperator;
	yield A.optionalWhitespace;
	let right = yield A.choice([
		fc.calcFunctionCall,
		fc.functionCall,
		up.intLiteral,
		up.boolLiteral
	]);
	yield A.optionalWhitespace;
	yield A.char(')');
	yield A.optionalWhitespace;
	let block = yield A.choice([
		A.char('{'),
		A.endOfInput
	]);
	return up.asType('STATEMENT') ({
		type,
		left,
		operator,
		right,
		block
	});

});

module.exports = {
	statement
};
