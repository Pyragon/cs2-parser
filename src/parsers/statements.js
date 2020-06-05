const A = require('arcsecond');

const up = require('./util-parsers');
const v = require('./variables');
const fc = require('./functionCall');

const statement = A.coroutine(function* () {
	
	let type = yield A.choice([
		A.str('if'),
		A.str('while'),
	]);
	yield A.optionalWhitespace;
	yield A.char('(');
	yield A.optionalWhitespace;
	let left = yield A.choice([
		fc.calcFunctionCall,
		fc.functionCall,
		up.variable,
		up.intLiteral,
		up.boolLiteral,
	]);
	yield A.optionalWhitespace;
	let operator = yield up.statementOperator;
	yield A.optionalWhitespace;
	let right = yield A.choice([
		fc.calcFunctionCall,
		fc.functionCall,
		up.variable,
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

const returnStatement = A.coroutine(function* () {
	yield A.str('return');

	yield A.optionalWhitespace;

	let value = yield A.choice([
		fc.calcFunctionCall,
		fc.functionCall,
		up.variable,
		up.intLiteral,
		up.stringLiteral,
		up.boolLiteral,
		A.char(';'),
		A.endOfInput
	]);

	return up.asType('RETURN_STATEMENT') ({
		value: value === ';' ? null : value
	});
});

module.exports = {
	statement,
	returnStatement
};
