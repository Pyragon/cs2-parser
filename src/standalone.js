const parser = require('./cs2parser')

const fullScriptData = `//script18(18)()(void)
int var1 = 10
string var2
if(var1 < 10) {
    var2 = to_string(var1)
    send_message(var2)
} else {
    send_message("hello")
    send_message("hello2")
    send_message("hello3")
    send_message("hello4")
    send_message("hello5")
}
return var1`;

console.dir(parser(fullScriptData), {'maxArrayLength': null});