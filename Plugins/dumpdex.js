//typed by hanbingle,just for fun!!
//email:edunwu@gmail.com
//基于FridaManager的简单dumpdex脚本插件,对app加载的所有dex进行简单的dump

var ishook_libart = false;
var addrLoadMethod = null;
//默认保存到sdcard根目录下
var savepath = "/sdcard";
var version = 0;
function LOG(info) {
    Java.perform(function () {
        var LogClass = Java.use("android.util.Log");
        LogClass.e("fridamanager", info);
    })
}

function getversion() {
    Java.perform(function () {
        var ver = Java.use('android.os.Build$VERSION');
        version = ver.SDK_INT.value;
        LOG("Version: " + version);
    })
}
function hookart() {
    if (ishook_libart === true) {
        return;
    }
    var symbols = Module.enumerateSymbolsSync("libart.so");
    for (var i = 0; i < symbols.length; i++) {
        var symbol = symbols[i];
        //_ZN3art11ClassLinker10LoadMethodERKNS_7DexFileERKNS_21ClassDataItemIteratorENS_6HandleINS_6mirror5ClassEEEPNS_9ArtMethodE
        if (symbol.name.indexOf("ClassLinker") >= 0
            && symbol.name.indexOf("LoadMethod") >= 0
            && symbol.name.indexOf("DexFile") >= 0
            && symbol.name.indexOf("ClassDataItemIterator") >= 0
            && symbol.name.indexOf("ArtMethod") >= 0) {
            addrLoadMethod = symbol.address;
            break;
        }
    }
    /*Android11	11	API 级别 30
      Android10	10	API 级别 29
      Pie	9	API 级别 28
      Oreo	8.1.0	API 级别 27
      Oreo	8.0.0	API 级别 26
      Nougat	7.1	API 级别 25
      Nougat	7.0	API 级别 24
    */
    if (addrLoadMethod != null) {
        Interceptor.attach(addrLoadMethod, {
            onEnter: function (args) {
                //android 7.0 7.1
                if (version == 24 || version == 25) {
                    this.dexfileptr = args[2];
                    this.artmethodptr = args[5];
                } else {
                    this.dexfileptr = args[1];
                    this.artmethodptr = args[4];
                }

            },
            onLeave: function (retval) {
                var dexfilebegin = null;
                var dexfilesize = null;
                if (this.dexfileptr != null) {
                    dexfilebegin = Memory.readPointer(ptr(this.dexfileptr).add(Process.pointerSize * 1));
                    dexfilesize = Memory.readU32(ptr(this.dexfileptr).add(Process.pointerSize * 2));
                    var dexfile_path = savepath + "/" + dexfilesize + "_loadMethod.dex";
                    var dexfile_handle = null;
                    try {
                        dexfile_handle = new File(dexfile_path, "r");
                        if (dexfile_handle && dexfile_handle != null) {
                            dexfile_handle.close()
                        }

                    } catch (e) {
                        dexfile_handle = new File(dexfile_path, "a+");
                        if (dexfile_handle && dexfile_handle != null) {
                            var dex_buffer = ptr(dexfilebegin).readByteArray(dexfilesize);
                            dexfile_handle.write(dex_buffer);
                            dexfile_handle.flush();
                            dexfile_handle.close();
                            LOG("[dumpdex]:"+dexfile_path);
                        }
                    }
                }
            }
        });
    }
    ishook_libart = true;
}
function main() {
    getversion();
    hookart();
}

setImmediate(main);
