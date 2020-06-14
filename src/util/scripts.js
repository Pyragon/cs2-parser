const _ = require('underscore');
const scriptsDB = require('../../data/scripts.json');

const scripts = _.indexBy(scriptsDB, 'id');

module.exports = scripts;
