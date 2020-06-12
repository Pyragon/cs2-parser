const parser = require('./cs2parser')

//TODO - cli functions (build-file, build-folder, etc)

const fullScriptData = `//script18(18)()(void)
int var1 = 10
switch(var1) {
    case 2:
        send_message(var1);
        break
    case 10:
        send_message(var1);
        break
}
return`;

console.log(parser(fullScriptData));