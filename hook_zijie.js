function hook_ssl_verify_callBack(p) {
    var fun = new NativeFunction(p, 'int', ['pointer', 'pointer']);
    var self = new NativeCallback(function (arg1, arg2) {
        var f = fun(arg1, arg2);
        console.log('SSL_CTX_set_custom_verify_callback called', arg1, arg2);
        console.log('SSL_CTX_set_custom_verify_callback return', f);
        return 0;
    }, 'int', ['pointer', 'pointer']);
    Interceptor.replace(fun, self);
}

function hook_ssl() {
    var cronet = Module.findBaseAddress("libsscronet.so");
    console.log('libsscronet.so base', cronet);
    var ver = Module.findExportByName("libttboringssl.so", "SSL_CTX_set_custom_verify");
    var custom_verify = new NativeFunction(ver, 'pointer', ['pointer', 'int', 'pointer']);
    var self = new NativeCallback(function (arg1, arg2, arg3) {
        hook_ssl_verify_callBack(arg3);
        console.log('SSL_CTX_set_custom_verify called', arg1, arg2, arg3);
        var f = custom_verify(arg1, 0, arg3);
        console.log('SSL_CTX_set_custom_verify return', f);
    }, 'pointer', ['pointer', 'int', 'pointer']);
    Interceptor.replace(ver, self);
}

function hook_sign(ml_offset) {
    var ml = Module.findBaseAddress("libmetasec_ml.so");
    console.log('libmetasec_ml.so base', ml);
    var addr = ml.add(ml_offset);
    Interceptor.attach(addr, {
        onEnter: function (args) {
            console.log("args 1 ", args[0].readCString());
            console.log("args 2 ", args[1].readCString());
        }, onLeave: function (retval) {
            console.log("retval is ", retval.readCString());
        }
    })
}

function hook_native() {
    var android_dlopen_ext = Module.findExportByName(null, "android_dlopen_ext");
    console.log(android_dlopen_ext);
    if (android_dlopen_ext != null) {
        Interceptor.attach(android_dlopen_ext, {
            onEnter: function (args) {
                var soName = args[0].readCString();
                if (soName.indexOf("libsscronet.so") != -1) {
                    this.hook1 = true;
                }
                if (soName.indexOf("libmetasec_ml.so") != -1) {
                    this.hook2 = true;
                }
                if (soName.indexOf("libEncryptor.so") != -1) {
                    this.hook3 = true;
                }
                if (soName.indexOf("libttboringssl.so") != -1) {
                    this.hook4 = true;
                }
                if (soName.indexOf("llibttcrypto.so") != -1) {
                    this.hook5 = true;
                }
            },
            onLeave: function (retval) {
                if (this.hook1) {
                    hook_ssl();
                }
                if (this.hook2) {
                    //different libmetasec_ml.so, different offset for sign
                    //hook_sign('0x11111');
                }
                if (this.hook3) {
                    var m = Module.findBaseAddress("libEncryptor.so");
                    console.log('libEncryptor.so.so base', m);
                }
                if (this.hook4) {
                    var m = Module.findBaseAddress("libttboringssl.so");
                    console.log('libttboringssl.so base', m);
                }
                if (this.hook5) {
                    var m = Module.findBaseAddress("libttcrypto.so");
                    console.log('libttcrypto.so base', m);
                }
            }
        });
    }
}

function bytes2Hex(arrBytes) {
    var str = "";
    for (var i = 0; i < arrBytes.length; i++) {
        var tmp;
        var num = arrBytes[i];
        if (num < 0) {
            tmp = (255 + num + 1).toString(16);
        } else {
            tmp = num.toString(16);
        }
        if (tmp.length === 1) {
            tmp = "0" + tmp;
        }
        if (i > 0) {
            str += " " + tmp;
        } else {
            str += tmp;
        }
    }
    return str.replace(' ', '');
}

function hook_java() {
    Java.perform(function () {
        let k = Java.use("ms.bd.c.k");
        k["a"].implementation = function (i, i2, j, str, obj) {
            if (i != 16777217) {
                console.log('a is called' + ', ' + 'i: ' + i + ', ' + 'i2: ' + i2 + ', ' + 'j: ' + j + ', ' + 'str: ' + str + ', ' + 'obj: ' + obj);
                if (i == 83886081) {
                    var ArrayClz = Java.use("java.lang.reflect.Array");
                    var len = ArrayClz.getLength(obj);
                    for (let i = 0; i != len; i++) {
                        var cb = ArrayClz.get(obj, i).toString();
                        console.log("ms.bd.c.k.a 83886081", cb);
                    }
                }
            }
            let ret = this.a(i, i2, j, str, obj);
            if (i != 16777217) {
                console.log('a ret value is ' + ret);
            }
            return ret;
        };
        k["b"].implementation = function (i, i2, j, str, obj) {
            if (i == 196609) {
                console.log('b is called' + ', ' + 'i: ' + i + ', ' + 'i2: ' + i2 + ', ' + 'j: ' + j + ', ' + 'str: ' + str + ', ' + 'obj: ' + obj);
            }
            let ret = this.b(i, i2, j, str, obj);
            if (i == 196609) {
                console.log('b ret value is ' + ret);
                console.log('b ret value is ' + bytes2Hex(ret));
            }
            return ret;
        };
        let AppLog = Java.use("com.ss.android.common.applog.AppLog");
        AppLog["getLogEncryptSwitch"].implementation = function () {
            let ret = this.getLogEncryptSwitch();
            return false;
        };
    });
}

function main() {
    hook_native();
    hook_java();
}

setImmediate(main)
