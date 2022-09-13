const _ = require('underscore');
const instructionDB = require('../../data/instructions.json');

const instructions = _.indexBy(instructionDB, 'name');

const instructionsLower = _.indexBy(instructionDB.map(i => {
    i.name = i.name.toLowerCase();
    return i;
}), 'name');

module.exports = { instructions, instructionsLower };