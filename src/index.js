const { inspect } = require('util');
const A = require('arcsecond');

const up = require('./parsers/util-parsers');
const v = require('./parsers/variables');
const scriptDataParser = require('./parsers/script-data-parser');
const fc = require('./parsers/functionCall');

const deepLog = x => console.log(inspect(x, {
	depth: Infinity,
	colors: true
}));

const testScriptData = '//script_1(1)(int a)(void)';
const variableCreationData = 'int var1;';
const variableAssignationData = 'var1 = 12;';
const functionCallData = 'script12("test", 12, true, script13());'

const result = fc.functionCall.run(functionCallData);
deepLog(result);
