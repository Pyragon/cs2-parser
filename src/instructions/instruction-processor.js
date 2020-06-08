const _instructions = require('./instructions');

const processInstructions = (data, variables, args) => {

	let iValues = [];
	let sValues = [];
	let lValues = [];

	let instructions = [];

	let opCount = 0;

	const processInstruction = (instruction, i) => {
		let name;
		let value;
		let variable;
		let instr;
		let params;
		switch (instruction.type) {
			case 'INT_LITERAL':
				instr = _instructions['PUSH_INT'];
				instructions.push(instr);
				value = instruction.value.value; //undefined?
				if (instruction.value.negative) value = -value;
				iValues[opCount++] = value;
				break;
			case 'STRING_LITERAL':
				instructions.push(_instructions['PUSH_STRING']);
				sValues[opCount++] = instruction.value.value;
				break;
			case 'LONG_LITERAL':
				instructions.push(_instructions['PUSH_LONG']);
				value = instruction.value.value;
				if (instruction.value.negative) value = -value;
				lValues[opCount++] = value;
			case 'VARIABLE':
				name = instruction.value;
				variable = variables[name];
				if (!variable) throw new Error('Unable to find variable: ' + name);
				switch (variable.type) {
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
				variable = variables[name];
				if (!variable) throw new Error('Unable to find variable: ' + name);
				value = value.value;
				processInstruction(value);
				switch (variable.type) {
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
						throw new Error('MISSING INSTR ASSIGN TYPE: ' + instruction.value.type);
				}
				break;
			case 'CALC_FUNCTION_CALL':
				processInstruction(instruction.value.right);
				processInstruction(instruction.value.left);
				switch (instruction.value.operator.value) {
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
						iValues[opCount++] = 0;
						break;
				}
				break;
			case 'FUNCTION_CALL':
				name = instruction.value.name.value;
				instr = _instructions[name];
				params = instruction.value.params;
				if (name.match(/script_?\d+/)) {
					let id = parseInt(name.split(/script_?/)[1]);
					for (let i = params.length - 1; i >= 0; i--)
						processInstruction(params[i]);
					instructions.push(_instructions['CALL_CS2']);
					iValues[opCount++] = id;
					break;
				}
				if (!instr) throw new Error('Unhandled function or script: ' + name);
				if (instr.hasExtra) {
					let constant = params[0];
					if (!constant.type.includes('LITERAL'))
						throw new Error('Only literal values for extra call: ' + name + ' ' + constant);

					for (let i = params.length - 1; i >= 1; i--)
						processInstruction(params[i]);
					instructions.push(instr);
					iValues[opCount++] = constant.value.value;
					break;
				}
				for (let i = params.length - 1; i >= 0; i--)
					processInstruction(params[i]);
				instructions.push(instr);
				iValues[opCount++] = 0;
				break;
			case 'STATEMENT':
				//save op count at start of statement.
				//once we reach a 'END_BLOCK' instruction, 
				//here we fuckin' go.........
				let expressions = instruction.value.expr.value.expr.value.expr; //jesus fuck....
				if (expressions.length == 1) {
					//no && or ||
					// console.log(expressions[0].value.left);
					let startIndex = opCount;
					processInstruction(expressions[0].value.left);
					processInstruction(expressions[0].value.right);
					switch (expressions[0].value.operator.value) {
						case '<':
							instructions.push(_instructions['INT_LT']);
							iValues[opCount++] = 1;
							break;
						case '>':
							instructions.push(_instructions['INT_GT']);
							iValues[opCount++] = 1;
							break;
						case '==':
							instructions.push(_instructions['INT_EQ']);
							iValues[opCount++] = 1;
							break;
						case '>=':
							instructions.push(_instructions['INT_GE']);
							iValues[opCount++] = 1;
							break;
						case '<=':
							instructions.push(_instructions['INT_LE']);
							iValues[opCount++] = 1;
							break;
						case '!=':
							instructions.push(_instructions['INT_NE']);
							iValues[opCount++] = 1;
							break;
					}
					instructions.push(_instructions['GOTO']);
					let instrSizeI = opCount++;
					iValues[instrSizeI] = 1;
					if(!instruction.value.hasBlock) {
						let nex = data[++i];
						if (nex)
							processInstruction(nex);
					} else {
						//TODO - else
						let nextInstr;
						while((nextInstr = data[++i]) != null && nextInstr.type != 'END_BLOCK')
							processInstruction(nextInstr);
					}
					iValues[instrSizeI] = opCount - instrSizeI - (instruction.value.type === 'if' ? 1 : 0);
					if (instruction.value.type === 'while') {
						instructions.push(_instructions['GOTO']);
						iValues[opCount++] = startIndex - opCount;
					}
					break;
				}
				break;
			case 'RETURN_STATEMENT':
				value = instruction.value;
				if (value.value != null)
					processInstruction(value.value);
				instructions.push(_instructions['RETURN']);
				iValues[opCount++] = 0;
				break;
			case 'VARIABLE_CREATION':
				break;
			default:
				throw new Error('Unhandled type: ' + instruction.type);
		}
		return i;
	};

	// let i;
	// while(i < data.length) {
	// 	i = processInstruction(data[i++],)
	// }

	for (let i = 0; i < data.length; i++)
		i = processInstruction(data[i], i);
	return [iValues, sValues, lValues, instructions, opCount];

};

module.exports = processInstructions;
