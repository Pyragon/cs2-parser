const A = require('arcsecond');

const asType = type => value => ({ type, value });
const mapJoin = parser => parser.map(items => items.join(''));
const peek = A.lookAhead(A.regex(/^./));

const commaSeperated = A.sepBy(A.sequenceOf([
        A.char(','),
        A.optionalWhitespace
]));

const argumentTypeParser = A.choice([
	A.str('int'),
	A.str('boolean'),
	A.str('string')
]).map(asType("ARGUMENT_TYPE"));


const variable = mapJoin(A.sequenceOf([
        A.regex(/^[a-zA-Z_]/),
        A.possibly(A.regex(/^[a-zA-Z0-9_]+/)).map(x => x === null ? '' : x)
])).map(asType("VARIABLE"));

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
	variable,
	commaSeperated,
    argumentTypeParser,
    returnTypeParser,
    stringLiteral,
    boolLiteral
};
