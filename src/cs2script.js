const processor = require('./instructions/instruction-processor');
const Stream = require('./io/stream');
const _instructions = require('./instructions/instructions.js');
const _ = require('underscore');

class CS2Script {

	constructor(id, name, args, variables, returnType, instructionData) {
		this.id = id;
		this.name = name;
		this.args = Object.values(args);
		this.variables = Object.values(variables);
		this.returnType = returnType;
		this.instructionData = processor(instructionData, variables, args);
	}

	encode() {

		let stream = new Stream();

		if(!this.name)
			stream.writeByte(0);
		else
			stream.writeString(this.name);
		
		for(let i = 0; i < this.instructionData[3].length; i++) {
			let instruction = this.instructionData[3][i];
			if(!instruction) continue;
			stream.writeShort(instruction.opcode);
			if(instruction == _instructions['PUSH_STRING'])
				stream.writeString(this.instructionData[1][i]);
			else if(instruction == _instructions['PUSH_LONG'])
				stream.writeLong(this.instructionData[2][i]);
			else if(instruction.hasExtra)
				stream.writeInt(this.instructionData[0][i]);
			else
				stream.writeByte(this.instructionData[0][i]);
		}

		stream.writeInt(this.instructionData[3].length);

		stream.writeShort(this.variables.filter(e => e.type === 'int').length);
		stream.writeShort(this.variables.filter(e => e.type === 'string').length);
		stream.writeShort(this.variables.filter(e => e.type === 'long').length);

		stream.writeShort(this.args.filter(e => e.type === 'int').length);
		stream.writeShort(this.args.filter(e => e.type === 'string').length);
		stream.writeShort(this.args.filter(e => e.type === 'long').length);

		let switchBlock = new Stream();

		let switchMap = this.instructionData[5];

		if(switchMap.length == 0)
			switchBlock.writeByte(0);
		else {

			switchBlock.writeByte(switchMap.length);

			for(let map of switchMap) {
				switchBlock.writeShort(Object.values(map).length);

				for(let key of Object.keys(map)) {
					switchBlock.writeInt(key);
					switchBlock.writeInt(map[key]);
				}

			}

		}

		let block = switchBlock.toArray();

		stream.writeBytes(block);

		stream.writeShort(block.length)

		return stream.toArray();

	}

}
module.exports = CS2Script;
