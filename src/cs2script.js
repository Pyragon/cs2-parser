const processor = require('./instruction-processor');

class CS2Script {

	constructor(id, name, args, variables, returnType, instructionData) {
		this.id = id;
		this.name = name;
		this.args = args;
		this.variables = variables;
		this.returnType = returnType;
		this.instructionData = processor(instructionData);
	}

}
module.exports = CS2Script;
