//typed by hanbingle,just for fun!!
//email:edunwu@gmail.com
//由于FridaManager加载js脚本的时机较早，此时application实例还没有创建完成，因此需要特别注意

function LOG(info) {
    Java.perform(function () {
        var LogClass = Java.use("android.util.Log");
        LogClass.e("fridamanager", info);
    })
}

function Toast() {
    Java.perform(function () {
        LOG("go into Toast");
        var LoadedApkClass = Java.use("android.app.LoadedApk");
        LOG(LoadedApkClass.toString());
        LoadedApkClass.makeApplication.implementation = function (arg0, arg1) {
            var application = this.makeApplication(arg0, arg1);
            LOG(LoadedApkClass.toString());
            if (application != null) {
                var context = application.getApplicationContext();
                if (context != null) {
                    Java.scheduleOnMainThread(function () {
                        var toast = Java.use("android.widget.Toast");
                        toast.makeText(context, Java.use("java.lang.String").$new("hello fridamanager"), 1).show();
                    });
                }
            } else {
                LOG("application is null!");
            }
            return application;
        }
    });
    LOG("leave Toast");
}

function main() {
    LOG("go into main");
    Toast();
    LOG("leave main");
}

setImmediate(main);
