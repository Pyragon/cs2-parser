const _ = require('underscore');
const instructionDB = require('../../data/instructions.json');

const instructions = _.indexBy(instructionDB, 'name');

module.exports = instructions;
