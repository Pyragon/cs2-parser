const _instructions = require('./instructions');

const processInstructions = (data, variables, args) => {

	let iValues = [];
	let sValues = [];
	let lValues = [];
	
	let instructions = [];

	let opCount = 0;

	const processInstruction = (instruction) => {
		let name;
		let value;
		let variable;
		let instr;
		switch(instruction.type) {
			case 'INT_LITERAL':
				instr = _instructions['PUSH_INT'];
				instructions.push(instr);
				value = instruction.value.value;
				if(instruction.value.negative) value = -value;
				iValues[opCount++] = value;
				break;
			case 'STRING_LITERAL':
				instructions.push(_instructions['PUSH_STRING']);
				sValues[opCount++] = instruction.value.value;
				break;
			case 'LONG_LITERAL':
				instructions.push(_instructions['PUSH_LONG']);
				value = instruction.value.value;
				if(instruction.value.negative) value = -value;
				lValues[opCount++] = value;
			case 'VARIABLE':
				name = instruction.value;
				variable = variables.find(e => e.name === name);
				if(!variable) throw new Error('Unable to find variable: '+name);
				switch(variable.type) {
					case 'int':
						instructions.push(_instructions['LOAD_INT']);
						iValues[opCount++] = variable.index;
						break;
					case 'string':
						instructions.push(_instructions['LOAD_STRING']);
						iValues[opCount++] = variable.index;
						break;
					case 'long':
						instructions.push(_instructions['LOAD_LONG']);
						iValues[opCount++] = variable.index;
						break;
				}
				break;
			case 'VARIABLE_ASSIGNATION':
			case 'VARIABLE_CREATE_ASSIGN':
				value = instruction.value;
				name = value.name.value;
				variable = variables.find(e => e.name === name);
				if(!variable) throw new Error('Unable to find variable: '+name);
				value = value.value;
				processInstruction(value);
				switch(instruction.value.type.value) {
					case 'int':
						instructions.push(_instructions['STORE_INT']);
						iValues[opCount++] = variable.index;
						break;
					case 'string':
						instructions.push(_instructions['STORE_STRING']);
						iValues[opCount++] = variable.index;
						break;
					case 'long':
						instructions.push(_instructions['STORE_LONG']);
						iValues[opCount++] = variable.index;
					default:
						throw new Error('MISSING INSTR ASSIGN TYPE: '+instruction.value.type);
				}
                                break;
			case 'CALC_FUNCTION_CALL':
				processInstruction(instruction.value.right);
				processInstruction(instruction.value.left);
				switch(instruction.value.operator.value) {
					case '+':
						instructions.push(_instructions['ADD']);
						iValues[opCount++] = 0;
						break;
					case '-':
						instructions.push(_instructions['SUBTRACT']);
						iValues[opCount++] = 0;
						break;
					case '/':
						instructions.push(_instructions['DIVIDE']);
						iValues[opCount++] = 0;
						break;
					case '*':
						instructions.push(_instructions['MULTIPLY']);
						iVAlues[opCount++] = 0;
						break;
				}
				break;
                        case 'FUNCTION_CALL':
                                name = instruction.value.name.value;
                                value = instructionDB.find(e => e.name.toUpperCase() === name.toUpperCase());
                                if(!value)
                                        value = scriptDB.find(e => e.name.toUpperCase() === name.toUpperCase());
                                //if(!value) 
                                  //      throw new Error('Unable to find function or script with name: '+name);
                                break;
                        case 'STATEMENT':
                                break;
			case 'RETURN_STATEMENT':
				value = instruction.value;
				if(value != null) processInstruction(value.value);
				instructions.push(_instructions['RETURN']);
				iValues[opCount++];
				break;
			case 'VARIABLE_CREATION':
				break;
			default:
				throw new Error('Unhandled type: '+instruction.type);
                }
	};

	for(let instruction of data) {
		processInstruction(instruction);
	}
	return [ iValues, sValues, lValues, instructions, opCount ];

};

module.exports = processInstructions;
