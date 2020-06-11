const parser = require('./cs2parser')

//TODO - cli functions (build-file, build-folder, etc)

const fullScriptData = `//script18(18)()(void)
send_message("test this piece of shit");
return;`;

console.log(parser(fullScriptData));