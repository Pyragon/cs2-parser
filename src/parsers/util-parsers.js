const A = require('arcsecond');

const asType = type => value => ({ type, value });
const mapJoin = parser => parser.map(items => items.join(''));
const peek = A.lookAhead(A.regex(/^./));

const argumentTypeParser = A.choice([
	A.str('int'),
	A.str('boolean'),
	A.str('string')
]);

const returnTypeParser = A.choice([
    A.str('int'),
    A.str('boolean'),
    A.str('string'),
    A.str('void')
]);

const variable = mapJoin(A.sequenceOf([
	A.regex(/^[a-zA-Z_]/),
	A.possibly(A.regex(/^[a-zA-Z0-9_]+/)).map(x => x === null ? '' : x)
]));

module.exports = {
    asType,
    mapJoin,
    peek,
    argumentTypeParser,
    returnTypeParser,
    variable
};