function Log(info) {
    Java.perform(function () {
        var LogClass = Java.use("android.util.Log");
        LogClass.e("FridaManager", info);
    })
}

function main() {
    Log("hello fridamanager!");
    Log("goodbye fridamanager!");
}

setImmediate(main);