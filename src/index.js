const A = require('arcsecond');

const testScriptData = '//script_1(1)(int arg1)(void)';

const asType = type => value => ({ type, value });

const argumentTypeParser = A.choice([
	A.str('int'),
	A.str('boolean'),
	A.str('string')
]);

//change to coroutine
const scriptDataParser = A.sequenceOf([
	A.str('//'),
	A.str('script_'),
	A.digits,
	A.char('('),
	A.digits,
	A.char(')'),
	A.char('('),
	argumentTypeParser.map(asType('ARGUMENT_TYPE')),
	A.whitespace,
	A.str('arg1'),
	A.char(')'),
	A.char('('),
	A.choice([
		A.str('void'),
		A.str('int'),
		A.str('string')
	]),
	A.char(')'),
	A.endOfInput
]).map(asType('SCRIPT_DATA'));

const result = scriptDataParser.run(testScriptData);
console.log(result.result);
