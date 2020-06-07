const instructionDB = Object.values(require('../data/instructions.json'));
const scriptDB = Object.values(require('../data/scripts.json'));

const processInstructions = (data) => {

	console.log(instructionDB);

	let iValues = [];
	let sValues = [];
	
	let instructions = [];

	let opCount = 0;

	for(let instruction of data) {
		switch(instruction.type) {
			case 'VARIABLE_CREATION':
				break;
			case 'VARIABLE_ASSIGNATION':
				break;
			case 'VARIABLE_CREATE_ASSIGN':
				break;
			case 'FUNCTION_CALL':
				let name = instruction.value.name.value;
				let value = instructionDB.find(e => e.name.toUpperCase() === name.toUpperCase());
				if(!value)
					value = scriptDB.find(e => e.name.toUpperCase() === name.toUpperCase());
				if(!value) {
					console.log('Unable to find function or script with name: '+name);
					process.exit();
					return;
				}
				break;
			case 'STATEMENT':
				break;
		}
	}

	return [ iValues, sValues, instructions, opCount ];

};

module.exports = processInstructions;
