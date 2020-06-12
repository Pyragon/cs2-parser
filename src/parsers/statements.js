const A = require('arcsecond');

const up = require('./util-parsers');
const v = require('./variables');
const fc = require('./function-call');

const bracketedAndExpression = A.coroutine(function* () {
	
	yield A.char('(');

	let expr = yield up.andSeperated(A.choice([
		expression,
		bracketedExpression
	]));

	yield A.char(')');

	return up.asType('AND_SEP') ({
		expr
	});

});

const bracketedOrExpression = A.coroutine(function* () {
	
	yield A.char('(');

	let expr = yield up.orSeperated(A.choice([
		expression,
		bracketedExpression
	]));

	yield A.char(')');

	return up.asType('OR_SEP') ({
		expr
	});

});

//normal bracketed expression, no splits
const bracketedExpression = A.coroutine(function* () {

	let expr = yield A.choice([
		bracketedAndExpression,
		bracketedOrExpression
	]);

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
		A.endOfInput
	]);

	return up.asType('RETURN_STATEMENT') ({
		value: value === ';' ? null : value
	});
});

const endBlockNoElse = A.coroutine(function* () {

	yield A.optionalWhitespace;
	yield A.char('}');

	yield A.endOfInput;

	return up.asType('END_BLOCK') ({
		hasElse: false
	});

});

const endWithElse = A.coroutine(function* () {

	yield A.optionalWhitespace;

	yield A.str('else');

	yield A.whitespace;

	let stmt = yield statement;

	let results = yield A.choice([
		A.char('{'),
		A.endOfInput
	]);

	return up.asType('END_BLOCK') ({
		hasElse: true,
		statement: stmt,
		hasBlock: results === '{'
	});

});

const endBlockWithElse = A.coroutine(function* () {

	yield A.optionalWhitespace;
	yield A.char('}');

	yield A.optionalWhitespace;

	yield A.str('else');

	yield A.whitespace;

	let stmt = yield statement;

	let results = yield A.choice([
		A.char('{'),
		A.endOfInput
	]);

	return up.asType('END_BLOCK') ({
		hasElse: true,
		statement: stmt,
		hasBlock: results === '{'
	});

});

const endWithElseNoStatement = A.coroutine(function* () {

	yield A.optionalWhitespace;

	yield A.str('else');

	yield A.optionalWhitespace;

	let results = yield A.choice([
		A.char('{'),
		A.endOfInput
	]);

	return up.asType('END_BLOCK') ({
		hasElse: true,
		statement: null,
		hasBlock: results === '{'
	});

});

const endBlockWithElseNoStatement = A.coroutine(function* () {

	yield A.optionalWhitespace;
	yield A.char('}');

	yield A.optionalWhitespace;

	yield A.str('else');

	yield A.optionalWhitespace;

	let results = yield A.choice([
		A.char('{'),
		A.endOfInput
	]);

	return up.asType('END_BLOCK') ({
		hasElse: true,
		statement: null,
		hasBlock: results === '{'
	});

});

const endBlock = A.choice([
	endBlockNoElse,
	endWithElse,
	endBlockWithElse,
	endWithElseNoStatement,
	endBlockWithElseNoStatement
]);

const switchStatement = A.coroutine(function* () {

	yield A.optionalWhitespace;

	yield A.str('switch(');

	let variable = yield up.variable;

	yield A.char(')');
	yield A.optionalWhitespace;
	yield A.char('{');

	return up.asType('SWITCH_STATEMENT') ({
		variable
	});
});

const caseStatement = A.coroutine(function* () {

	yield A.optionalWhitespace;

	yield A.str('case ');

	let literal = yield up.intLiteral;

	yield A.char(':');

	return up.asType('CASE_STATEMENT') ({
		literal
	});

});

const breakStatement = A.sequenceOf([
	A.optionalWhitespace,
	A.str('break'),
	A.optionalWhitespace
]).map(up.asType('BREAK_STATEMENT'));

const continueStatement = A.sequenceOf([
	A.optionalWhitespace,
	A.str('continue'),
	A.optionalWhitespace
]).map(up.asType('CONTINUE_STATEMENT'));

module.exports = {
	statement,
	returnStatement,
	switchStatement,
	caseStatement,
	breakStatement,
	continueStatement,
	endBlock
};
