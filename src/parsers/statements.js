const A = require('arcsecond');

const up = require('./util-parsers');
const v = require('./variables');
const fc = require('./functionCall');

const expression = A.coroutine(function* () {

	yield A.optionalWhitespace;

	yield A.char('(');

	yield A.optionalWhitespace;

	let left = yield A.choice([
		expression,
		fc.calcFunctionCall,
		fc.functionCall,
		up.variable,
		up.intLiteral,
		up.boolLiteral
	]);

	yield A.optionalWhitespace;

	let operator = yield up.statementOperator;

	yield A.optionalWhitespace;

	let right = yield A.choice([
		expression,
		fc.calcFunctionCall,
		fc.functionCall,
		up.variable,
		up.intLiteral,
		up.boolLiteral
	]);

	yield A.char(')');

	return up.asType('EXPRESSION') ({
		left,
		operator,
		right
	});

});

const statement = A.coroutine(function* () {
	
	let type = yield A.choice([
		A.str('if'),
		A.str('while'),
	]);

	let expr = yield A.choice([
		expression
	]);

	yield A.optionalWhitespace;

	let results = yield A.choice([
		A.char('{'),
		A.endOfInput
	]);

	return up.asType('STATEMENT') ({
		type,
		expr,
		hasBlock: results === '{'
	})

});

const returnStatement = A.coroutine(function* () {

	yield A.optionalWhitespace;

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

const endBlock = A.sequenceOf([
	A.optionalWhitespace,
	A.char('}')
]).map(up.asType('END_BLOCK'));

module.exports = {
	statement,
	returnStatement,
	endBlock
};
