const _instructions = require('./util/instructions.js');
const _scripts = require('./util/scripts.js');
const processor = require('./instruction-processor');
const Stream = require('./io/stream');
const _ = require('underscore');

class CS2Script {

    constructor(id, name, args, variables, returnType, instructionData) {
        this.id = id;
        this.name = name;
        this.args = Object.values(args);
        this.variables = Object.values(variables);
        this.returnType = returnType;
        this.loadData(instructionData, variables, args);
    }

    loadData(instructionData, variables, args) {
        let data = processor(instructionData, variables, args);
        [this.iValues, this.sValues, this.lValues, this.instructions, this.opCount, this.switchMap] = data;
    }

    encode() {

        let stream = new Stream();

        console.log('writing name', this.name);

        if (!this.name)
            stream.writeByte(0);
        else
            stream.writeString(this.name);

        for (let i = 0; i < this.instructions.length; i++) {
            let instruction = this.instructions[i];
            if (!instruction) continue;
            stream.writeShort(instruction.opcode);
            if (instruction == _instructions['PUSH_STRING'])
                stream.writeString(this.sValues[i]);
            else if (instruction == _instructions['PUSH_LONG'])
                stream.writeLong(this.lValues[i]);
            else if (instruction.hasExtra)
                stream.writeInt(this.iValues[i]);
            else
                stream.writeByte(this.iValues[i]);
        }

        stream.writeInt(this.instructions.length);

        stream.writeShort(this.variables.filter(e => e.type === 'int').length);
        stream.writeShort(this.variables.filter(e => e.type === 'string').length);
        stream.writeShort(this.variables.filter(e => e.type === 'long').length);

        stream.writeShort(this.args.filter(e => e.type === 'int').length);
        stream.writeShort(this.args.filter(e => e.type === 'string').length);
        stream.writeShort(this.args.filter(e => e.type === 'long').length);

        let switchBlock = new Stream();

        let switchMap = this.switchMap;

        if (switchMap.length == 0)
            switchBlock.writeByte(0);
        else {

            switchBlock.writeByte(switchMap.length);

            for (let map of switchMap) {
                switchBlock.writeShort(Object.values(map).length);

                for (let key of Object.keys(map)) {
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