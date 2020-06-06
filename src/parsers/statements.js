const A = require('arcsecond');

const up = require('./util-parsers');
const v = require('./variables');
const fc = require('./functionCall');

const bracketedAndExpression = A.coroutine(function* () {
});

const bracketedOrExpression = A.coroutine(function* () {
});

//normal bracketed expression, no splits
const bracketedExpression = A.coroutine(function* () {

	yield A.char('(');

	//TODO - create arrays using sepBy(||) and sepBy(&&)
	//change statement to include the ( and seperate by || and &&,
	//see if that's different than this, still do same for bracketedExpression and expression
	
	let expr = yield A.choice([
		up.orSeperated(A.choice([
			bracketedExpression,
			expression
		])).map(up.asType('OR_SEP')),
		up.andSeperated(A.choice([
			bracketedExpression,
			expression
		])).map(up.asType('AND_SEP'))
	]);
	
	yield A.char(')');

	return up.asType('BRACKETED_EXPRESSION') ({
		expr
	});

});

const expression = A.coroutine(function* () {

	yield A.optionalWhitespace;

	let left = yield A.choice([
		bracketedExpression,
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
		bracketedExpression,
		fc.calcFunctionCall,
		fc.functionCall,
		up.variable,
		up.intLiteral,
		up.boolLiteral
	]);

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

	let expr = yield bracketedExpression;

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
