const up = require('./util-parsers.js');
const A = require('arcsecond');

const argumentParser = A.coroutine(function* () {
	let type = yield up.argumentTypeParser;
	yield A.whitespace;
	let name = yield up.variable;
	return up.asType('ARGUMENT') ({
		type,
		name
	});
});

const scriptData = A.coroutine(function* () {
	yield A.str('//');

	let name = yield up.variable;

	yield A.char('(');

	let id = yield A.digits;

	yield A.char(')');

	yield A.char('(');

	const args = yield up.commaSeperated(argumentParser);

	yield A.char(')');

	yield A.char('(');

	const returnType = yield up.returnTypeParser;

	yield A.char(')');
	yield A.optionalWhitespace;

	return up.asType('SCRIPT_DATA') ({
		id,
		name,
		args,
		returnType
	});

});

module.exports = scriptData;
