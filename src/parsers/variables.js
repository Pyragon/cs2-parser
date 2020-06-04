const A = require('arcsecond');
const up = require('./util-parsers');

const variable = up.mapJoin(A.sequenceOf([
	A.regex(/^[a-zA-Z_]/),
	A.possibly(A.regex(/^[a-zA-Z0-9_]+/)).map(x => x === null ? '' : x)
])).map(up.asType("VARIABLE"));

const variableCreation = A.coroutine(function* () {

    let type = yield up.argumentTypeParser;
    yield A.whitespace;
    let name = yield variable;
    yield A.char(';');

    return up.asType('VARIABLE_CREATION') ({
        type,
        name
    });
});

const variableAssignation = A.coroutine(function* () {

    const name = yield variable;
    yield A.optionalWhitespace;
    yield A.char('=');
    yield A.optionalWhitespace;
    //yield expression, for now, let's just do an int value.
    let value = yield A.choice([
        variable,
        A.digits,
        up.boolLiteral,
        up.stringLiteral
    ]);
    yield A.char(';');

    return up.asType('VARIABLE_ASSIGNATION') ({
        name,
        value
    });

});

module.exports = {
    variable,
    variableCreation,
    variableAssignation
};