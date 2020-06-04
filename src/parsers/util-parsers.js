const A = require('arcsecond');

const asType = type => value => ({ type, value });
const mapJoin = parser => parser.map(items => items.join(''));
const peek = A.lookAhead(A.regex(/^./));

const argumentTypeParser = A.choice([
	A.str('int'),
	A.str('boolean'),
	A.str('string')
]).map(asType("ARGUMENT_TYPE"));

const returnTypeParser = A.choice([
    A.str('int'),
    A.str('boolean'),
    A.str('string'),
    A.str('void')
]).map(asType("RETURN_TYPE"));

const stringLiteral = A.coroutine(function* () {

    yield A.char('"');

    let value = yield A.regex(/^[^"]+/);

    yield A.char('"');

    return asType("STRING_LITERAL") ({
        value
    });

});

const boolLiteral = A.choice([
    A.str('true'),
    A.str('false')
]).map(asType("BOOL_LITERAL"));

module.exports = {
    asType,
    mapJoin,
    peek,
    argumentTypeParser,
    returnTypeParser,
    stringLiteral,
    boolLiteral
};