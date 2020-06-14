const _instructions = require('./util/instructions');

const processInstructions = (data, variables, args) => {

	let iValues = [];
	let sValues = [];
	let lValues = [];

	let instructions = [];

	let opCount = 0;

	let switchMap = [];
	let switchIndex = 0;

	const processInstruction = (instruction, i) => {
		let name;
		let value;
		let variable;
		let instr;
		let params;
		let nextInstr;
		switch (instruction.type) {
			case 'INT_LITERAL':
				instr = _instructions['PUSH_INT'];
				instructions.push(instr);
				value = instruction.value.value;
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
				i = processInstruction(value, i);
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
				i = processInstruction(instruction.value.right, i);
				i = processInstruction(instruction.value.left, i);
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
					for (let k = params.length - 1; k >= 0; k--)
						i = processInstruction(params[k], i);
					instructions.push(_instructions['CALL_CS2']);
					iValues[opCount++] = id;
					break;
				}
				if (!instr) throw new Error('Unhandled function or script: ' + name);
				if (instr.hasExtra) {
					let constant = params[0];
					if (!constant.type.includes('LITERAL'))
						throw new Error('Only literal values for extra call: ' + name + ' ' + constant);

					for (let k = params.length - 1; k >= 1; k--)
						i = processInstruction(params[k], i);
					instructions.push(instr);
					iValues[opCount++] = constant.value.value;
					break;
				}
				for (let k = params.length - 1; k >= 0; k--)
					i = processInstruction(params[k], i);
				instructions.push(instr);
				iValues[opCount++] = 0;
				break;
			case 'SWITCH_STATEMENT':
				variable = instruction.value.variable;
				i = processInstruction(variable, i);
				instructions.push(_instructions['SWITCH']);
				let si = switchIndex++;
				iValues[opCount++] = si;
				let tillEnd = [];
				let cases = [];
				let startIndex = opCount;
				while((nextInstr = data[++i]).type !== 'END_BLOCK') {
					if(nextInstr.type !== 'CASE_STATEMENT') throw new Error('Expected case statement!');
					let literal = nextInstr.value.literal.value.value;
					cases.push(literal);
					instructions.push(_instructions['GOTO']);
					tillEnd.push(opCount++);
					while((nextInstr = data[++i]).type !== 'BREAK_STATEMENT')
						i = processInstruction(nextInstr, i);
				}
				switchMap[si] = {};
				for(let k = 0; k < tillEnd.length; k++) {
					let till = tillEnd[k];
					switchMap[si][cases[k]] = till - startIndex + 1;
					iValues[till] = opCount - till - 1;
				}
				break;
			case 'STATEMENT':
				let expressions = instruction.value.expr.value.expr.value.expr;
				let tillGoTo = [];
				for(let expression of expressions) {
					let startIndex = opCount;
					i = processInstruction(expression.value.left, i);
					i = processInstruction(expression.value.right, i);
					tillGoTo.push(opCount++);
					switch (expression.value.operator.value) {
						case '<':
							instructions.push(_instructions['INT_LT']);
							break;
						case '>':
							instructions.push(_instructions['INT_GT']);
							break;
						case '==':
							instructions.push(_instructions['INT_EQ']);
							break;
						case '>=':
							instructions.push(_instructions['INT_GE']);
							break;
						case '<=':
							instructions.push(_instructions['INT_LE']);
							break;
						case '!=':
							instructions.push(_instructions['INT_NE']);
							break;
					}
				}
				instructions.push(_instructions['GOTO']);
				let instrSizeI = opCount++;
				for(let goto of tillGoTo)
					iValues[goto] = opCount - goto - 1;
				iValues[instrSizeI] = 1;
				if(!instruction.value.hasBlock) {
					let nex = data[++i];
					if (nex)
						i = processInstruction(nex, i);
					nex = data[i + 1];
					if(nex.type !== 'END_BLOCK') {
						iValues[instrSizeI] = opCount - instrSizeI - (instruction.value.type === 'if' ? 1 : 0);
						break;
					}
					nextInstr = data[++i];
				} else {
					while((nextInstr = data[++i]) != null && nextInstr.type != 'END_BLOCK')
						i = processInstruction(nextInstr, i);
				}
				iValues[instrSizeI] = opCount - instrSizeI - (instruction.value.type === 'if' && !nextInstr.value.hasElse ? 1 : 0);
				if (instruction.value.type === 'while') {
					instructions.push(_instructions['GOTO']);
					iValues[opCount++] = startIndex - opCount;
				}
				if(nextInstr.value.hasElse) {
					instructions.push(_instructions['GOTO']);
					let elseIndex = opCount++;
					iValues[elseIndex] = 0;
					let inst = nextInstr;
					if(nextInstr.value.statement !== null)
						i = processInstruction(nextInstr.value.statement, i);
					else {
						while((nextInstr = data[++i]) != null && nextInstr.type != 'END_BLOCK')
							i = processInstruction(nextInstr, i);
					}
					iValues[elseIndex] = opCount - elseIndex + -1;
				}
				break;
			case 'RETURN_STATEMENT':
				value = instruction.value;
				if (value.value != null)
					i = processInstruction(value.value, i);
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

	for (let i = 0; i < data.length; i++)
		i = processInstruction(data[i], i);
	return [iValues, sValues, lValues, instructions, opCount, switchMap];

};

module.exports = processInstructions;
