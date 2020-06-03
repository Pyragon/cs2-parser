const A = require('arcsecond');

const testScriptData = '//script_1(1)(int arg1)(void)';

const scriptDataParser = A.sequenceOf(
);

const result = scriptDataParser.run(testScriptData);
console.log(result);
