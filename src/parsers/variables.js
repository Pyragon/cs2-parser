const A = require('arcsecond');
const up = require('./util-parsers');
const fc = require('./function-call');

const variableCreateAssign = A.coroutine(function* () {

    yield A.optionalWhitespace;

	let type = yield up.argumentTypeParser;
	yield A.whitespace;
	let name = yield up.variable;
	yield A.optionalWhitespace;
	yield A.char('=');
	yield A.optionalWhitespace;

	let value = yield A.choice([
		fc.calcFunctionCall,
		fc.functionCall,
		up.stringLiteral,
		up.boolLiteral,
		up.intLiteral
	]);

	yield A.endOfInput

	return up.asType('VARIABLE_CREATE_ASSIGN') ({
		name,
		type,
		value
	});

});

const variableCreation = A.coroutine(function* () {

    yield A.optionalWhitespace;

    let type = yield up.argumentTypeParser;
    yield A.whitespace;
    let name = yield up.variable;

	yield A.endOfInput;

    return up.asType('VARIABLE_CREATION') ({
        type,
        name
    });
});

const variableAssignation = A.coroutine(function* () {

    yield A.optionalWhitespace;

	let name = yield up.variable;
	yield A.optionalWhitespace;
	yield A.char('=');
    	yield A.optionalWhitespace;
    
	let value = yield A.choice([
        	fc.calcFunctionCall,
		fc.functionCall,
		up.stringLiteral,
		up.boolLiteral,
		up.intLiteral
    	]);

	yield A.endOfInput;

    	return up.asType('VARIABLE_ASSIGNATION') ({
        	name,
	    	value
    	});

});

module.exports = {
    variableCreation,
    variableAssignation,
	variableCreateAssign
};
