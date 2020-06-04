const { inspect } = require('util');
const A = require('arcsecond');

const up = require('./parsers/util-parsers');
const scriptDataParser = require('./parsers/script-data-parser');

const deepLog = x => console.log(inspect(x, {
	depth: Infinity,
	colors: true
}));

const testScriptData = '//script_1(1)(int arg1, int arg2, string arg3)(void)';

const result = scriptDataParser.run(testScriptData);
deepLog(result);
