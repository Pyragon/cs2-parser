const { inspect } = require('util');
const A = require('arcsecond');

const up = require('./parsers/util-parsers');
const v = require('./parsers/variables');
const scriptDataParser = require('./parsers/script-data-parser');
const fc = require('./parsers/functionCall');
const s = require('./parsers/statements');

const deepLog = x => console.log(inspect(x, {
	depth: Infinity,
	colors: true
}));

const testScriptData = '//script_1(1)(int a)(void)';
const variableCreationData = 'int var1';
const variableAssignationData = 'var1 = script12(true, 12, "test", script58(121212121212121212121212), script_1222())';
const functionCallData = 'script12("test", 12, true, script13(true, 12, "test"))';
const calcFunctionData = 'calc(10 + calc(10 + calc(20 / 20)))';
const ifStatementData = 'while(var1 < calc(20 / 2)) {';
const returnData = 'return calc(10 + 10);';

const fullScriptData = `//script_1(1)(int arg1)(void)
int var1
var1 = 12
string var2
var2 = to_string(var1)
send_message(var2)
return`;

let parser = A.choice([
	scriptDataParser,
	fc.functionCall,
	v.variableCreation,
	v.variableAssignation,
	s.statement,
	s.returnStatement
]);

let results = [];
for(let line of fullScriptData.split('\n')) {
	let data = parser.run(line);
	if(data.isError === true) {
		console.log(data);
		return;
	}
	results.push(data.result);
}

deepLog(results);

//const result = s.returnStatement.run(returnData);
//deepLog(result);
