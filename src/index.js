const { inspect } = require('util');
const A = require('arcsecond');

const up = require('./parsers/util-parsers');
const v = require('./parsers/variables');
const scriptDataParser = require('./parsers/script-data-parser');
const fc = require('./parsers/function-call');
const s = require('./parsers/statements');

const CS2Script = require('./cs2script.js');

const deepLog = x => console.log(inspect(x, {
	depth: Infinity,
	colors: true
}));

const testScriptData = '//script_1(1)(int a)(void)';
const variableCreationData = 'int var1';
const variableAssignationData = 'var1 = script12(true, 12, "test", script58(121212121212121212121212), script_1222())';
const functionCallData = 'script12("test", 12, true, script13(true, 12, "test"))';
const calcFunctionData = 'calc(var1 + script10(calc(10 + 10)))';
const statementData = 'while(10 < 10 && (10 < 10 || 10 > 10)) {';
const returnData = 'return calc(10 + 10);';
const testBracket = 'if(10 < 10 && (10 < 10 || 10 > 10))';

const fullScriptData = `//script_7(7)()(int)
int ivar0 = calc(100 - load_varc(10))
int ivar1
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
	v.variableCreateAssign,
	v.variableCreation,
	v.variableAssignation,
	s.statement,
	s.returnStatement,
	s.endBlock
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

//get info from results, id, name, args, variables, returnType
let scriptDataResult = results[0];
let id = scriptDataResult.value.id;
if(!id) {
	console.log('Missing ID in script data');
	return;
}
let name = scriptDataResult.value.name.value;
if(!name) {
	console.log('Missing name in script data');
	return;
}
let args = scriptDataResult.value.args;
let returnType = scriptDataResult.value.returnType.value;
if(!returnType) {
	console.log('Missing return type in script data');
	return;
}
let vIndex = 0;
let variables = results.filter(e => e.type === 'VARIABLE_CREATION' || e.type == 'VARIABLE_CREATE_ASSIGN').map(e => ({
	type: e.value.type.value,
	name: e.value.name.value,
	index: vIndex++
}));
results.shift();
let script = new CS2Script(id, name, args, variables, returnType, results);
console.log(script.instructionData[3]);

//const result = s.statement.run(testBracket);
//deepLog(result);
