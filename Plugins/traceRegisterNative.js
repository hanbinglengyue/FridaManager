function Log(info) {
    Java.perform(function () {
        var LogClass = Java.use("android.util.Log");
        LogClass.e("FridaManager", info);
    })
}

function readStdString(str) {
    const isTiny = (str.readU8() & 1) === 0;
    if (isTiny)
        return str.add(1).readUtf8String();
    return str.add(2 * Process.pointerSize).readPointer().readUtf8String();
}

function hook_register_native() {
    var libartmodule = Process.getModuleByName("libart.so");
    var PrettyMethodaddr = null;
    var RegisterNativeaddr = null;
    libartmodule.enumerateExports().forEach(function (symbol) {
        //android7.1.2
        if (symbol.name == "_ZN3art12PrettyMethodEPNS_9ArtMethodEb") {
            PrettyMethodaddr = symbol.address;
        }
    });

    var PrettyMethodfunc = new NativeFunction(PrettyMethodaddr, ["pointer", "pointer", "pointer"], ["pointer", "int"]);
    Interceptor.attach(RegisterNativeaddr, {
        onEnter: function (args) {
            var ArtMethodptr = args[0];
            this.JniFuncaddr = args[1];
            var result = PrettyMethodfunc(ArtMethodptr, 1);
            var stdstring = Memory.alloc(3 * Process.pointerSize);
            ptr(stdstring).writePointer(result[0]);
            ptr(stdstring).add(1 * Process.pointerSize).writePointer(result[1]);
            ptr(stdstring).add(2 * Process.pointerSize).writePointer(result[2]);
            this.funcnamestring = readStdString(stdstring);
            Log("[RegisterJni begin]" + this.funcnamestring + "--addr:" + this.JniFuncaddr);
        }, onLeave: function (retval) {
            Log("[RegisterJni over]" + this.funcnamestring + "--addr:" + this.JniFuncaddr);
        }
    })
}

function main() {
    Log("hello fridamanager!");
    hook_register_native();
    Log("goodbye fridamanager!");
}

setImmediate(main);