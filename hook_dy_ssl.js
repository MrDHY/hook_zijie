function hook_ssl() {
    var cronet = Module.findBaseAddress("libsscronet.so");
    console.log('libsscronet.so base', cronet);
    var ver = Module.findExportByName("libttboringssl.so", "SSL_CTX_set_custom_verify");
    var custom_verify = new NativeFunction(ver, 'pointer', ['pointer', 'int', 'pointer']);
    var self = new NativeCallback(function (arg1, arg2, arg3) {
        hookCallBack(arg3);
        console.log('SSL_CTX_set_custom_verify called', arg2, arg3);
        return custom_verify(arg1, 0, arg3);
    }, 'pointer', ['pointer', 'int', 'pointer']);
    Interceptor.replace(ver, self);
}

function hookCallBack(p) {
    var fun = new NativeFunction(p, 'int', ['pointer', 'pointer']);
    var self = new NativeCallback(function (arg1, arg2) {
        var f = fun(arg1, arg2);
        //console.log("SSL_CTX_set_custom_verify callback", f);
        return 0;
    }, 'int', ['pointer', 'pointer']);
    Interceptor.replace(fun, self);
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
                    var m = Module.findBaseAddress("libmetasec_ml.so");
                    console.log('libmetasec_ml.so base', m);
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

function bytes2String(arr) {
    if (typeof arr === 'string') {
        return arr;
    }
    var str = '',
        _arr = arr;
    for (var i = 0; i < _arr.length; i++) {
        var one = _arr[i].toString(2),
            v = one.match(/^1+?(?=0)/);
        if (v && one.length === 8) {
            var bytesLength = v[0].length;
            var store = _arr[i].toString(2).slice(7 - bytesLength);
            for (var st = 1; st < bytesLength; st++) {
                store += _arr[st + i].toString(2).slice(2);
            }
            try {
                str += String.fromCharCode(parseInt(store, 2));
            } catch (error) {
                str += parseInt(store, 2).toString();
                console.log(error);
            }
            i += bytesLength - 1;
        } else {
            try {
                str += String.fromCharCode(_arr[i]);
            } catch (error) {
                str += parseInt(store, 2).toString();
                console.log(error);
            }

        }
    }
    return str;
}

function hook_java() {
    Java.perform(function () {
        let k = Java.use("ms.bd.c.k");
        k["a"].implementation = function (i, i2, j, str, obj) {
            if(i != 16777217) {
                console.log('a is called' + ', ' + 'i: ' + i + ', ' + 'i2: ' + i2 + ', ' + 'j: ' + j + ', ' + 'str: ' + str + ', ' + 'obj: ' + obj);
                if (i == 83886081) {
                    var ArrayClz = Java.use("java.lang.reflect.Array");
                    var len = ArrayClz.getLength(obj);
                    for(let i=0;i!=len;i++){
                        var cb = ArrayClz.get(obj,i).toString();
                        console.log("ms.bd.c.k.a 83886081", cb);
                    }
                }
            }
            let ret = this.a(i, i2, j, str, obj);
            if(i != 16777217) {
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
            console.log('getLogEncryptSwitch is called');
            let ret = this.getLogEncryptSwitch();
            console.log('getLogEncryptSwitch ret value is ' + ret);
            return false;
        };
        // let EncryptorUtil = Java.use("com.bytedance.frameworks.encryptor.EncryptorUtil");
        // EncryptorUtil["ttEncrypt"].implementation = function (bArr, i) {
        //     console.log('ttEncrypt is called i: ' + i);
        //     var arr = Java.use("java.util.Arrays");
        //     console.log("ttEncrypt bArr=" + arr.toString(bArr));
        //     console.log("ttEncrypt bArr=" + bytes2String(bArr));
        //     console.log("ttEncrypt bArr=" + bytes2Hex(bArr));
        //     let ret = this.ttEncrypt(bArr, i);
        //     console.log('ttEncrypt ret value is ' + arr.toString(ret));
        //     console.log('ttEncrypt ret value is ' + bytes2String(ret));
        //     console.log('ttEncrypt ret value is ' + bytes2Hex(ret));
        //     return ret;
        // };
    });
}


function main() {
    hook_native();
    hook_java();
}

setImmediate(main)