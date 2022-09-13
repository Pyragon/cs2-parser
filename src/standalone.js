const parser = require('./cs2parser')

const fullScriptData = `//script1190(1190)()(void)
string sVar0 = "ASDFAS"
sVar0 = sVar0.toLowerCase()
return`;

console.dir(parser(fullScriptData), { 'maxArrayLength': null });