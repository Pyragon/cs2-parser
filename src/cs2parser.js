const _ = require('underscore');
const A = require('arcsecond');

const up = require('./parsers/util-parsers');
const v = require('./parsers/variables');
const scriptDataParser = require('./parsers/script-data-parser');
const fc = require('./parsers/function-call');
const s = require('./parsers/statements');

const CS2Script = require('./cs2script.js');

let parser = A.choice([
    scriptDataParser,
    s.breakStatement,
    s.switchStatement,
    fc.functionCall,
    v.variableCreateAssign,
    v.variableCreation,
    v.variableAssignation,
    s.statement,
    s.returnStatement,
    s.endBlock,
    s.caseStatement,
    s.continueStatement
]);

const parseScript = function(scriptData) {

    let results = [];
    let index = 0;
    for (let line of scriptData.split('\n')) {
        let data = parser.run(line);
        if (data.isError === true) {
            console.log('Error on line ' + index + ': ' + data.error);
            console.log('line', line);
            process.exit();
            return;
        }
        results.push(data.result);
        index++;
    }

    //get info from results, id, name, args, variables, returnType
    let scriptDataResult = results[0];
    let id = scriptDataResult.value.id;
    if (!id) {
        console.log('Missing ID in script data');
        return;
    }
    let name = scriptDataResult.value.name.value;
    if (!name) {
        console.log('Missing name in script data');
        return;
    }
    let args = scriptDataResult.value.args;
    let returnType = scriptDataResult.value.returnType.value;
    if (!returnType) {
        console.log('Missing return type in script data');
        return;
    }
    let vIndex = 0;
    let variables = results.filter(e => e.type === 'VARIABLE_CREATION' || e.type == 'VARIABLE_CREATE_ASSIGN').map(e => ({
        type: e.value.type.value,
        name: e.value.name.value,
        index: vIndex++
    }));
    variables = _.indexBy(variables, 'name');
    results.shift();
    let script = new CS2Script(id, name, args, variables, returnType, results);
    console.log(script);
    for (let i = 0; i < script.instructions.length; i++)
        console.log(script.instructions[i].name + ' ' + script.iValues[i]);

    let array = script.encode();

    return array;
}

module.exports = parseScript;