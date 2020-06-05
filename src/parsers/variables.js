const A = require('arcsecond');
const up = require('./util-parsers');
const fc = require('./functionCall');

const variableCreation = A.coroutine(function* () {

    let type = yield up.argumentTypeParser;
    yield A.whitespace;
    let name = yield up.variable;

    return up.asType('VARIABLE_CREATION') ({
        type,
        name
    });
});

const variableAssignation = A.coroutine(function* () {

	let name = yield up.variable;
	yield A.optionalWhitespace;
	yield A.char('=');
    yield A.optionalWhitespace;
    
	let value = yield A.choice([
        fc.calcFunctionCall,
		fc.functionCall,
		up.stringLiteral,
		up.boolLiteral,
		A.digits.map(up.asType('INT_LITERAL'))
    ]);
    
    console.log(value);

    return up.asType('VARIABLE_ASSIGNATION') ({
        name,
	    value
    });

});

module.exports = {
    variableCreation,
    variableAssignation
};
