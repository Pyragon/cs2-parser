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
const calcFunctionData = 'calc(var1 + script10(calc(10 + 10)))';
const ifStatementData = 'while(var1 < calc(20 / 2)) {';
const returnData = 'return calc(10 + 10);';

const fullScriptData = `//script_7(7)()(void)
int var0
int var1
ivar0 = calc(100 - load_var(10))
store_varc(10, 0)
if(ivar0 < -1)
	return
if(ivar0 == script1305())
	return
ivar1 = script_8(ivar0)
if(ivar1 == -1)
	return
if(if_isopen(ivar1) == 0)
	return
script_71(ivar0)
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
let index = 0;
for(let line of fullScriptData.split('\n')) {
	let data = parser.run(line);
	if(data.isError === true) {
		console.log('Error on line '+index+': '+data.error);
		process.exit();
		return;
	}
	results.push(data.result);
	index++;
}

deepLog(results);

// const result = fc.calcFunctionCall.run(calcFunctionData);
// deepLog(result);
