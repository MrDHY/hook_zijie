function hook_ssl_verify_callBack(p) {
    var fun = new NativeFunction(p, 'int', ['pointer', 'pointer']);
    var self = new NativeCallback(function (arg1, arg2) {
        var f = fun(arg1, arg2);
        // console.log('SSL_CTX_set_custom_verify_callback called', arg1, arg2);
        // console.log('SSL_CTX_set_custom_verify_callback return', f);
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
        //console.log('SSL_CTX_set_custom_verify called', arg1, arg2, arg3);
        var f = custom_verify(arg1, 0, arg3);
        //console.log('SSL_CTX_set_custom_verify return', f);
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

function byteToStr(by) {
    var JavaString = Java.use("java.lang.String");
    var JavaByte = Java.use("[B");
    var arr = Java.use("java.util.Arrays");
    var buffer = Java.cast(by, JavaByte);
    var result = Java.array('byte', buffer);
    return JSON.stringify(result);
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
                    hook_sign('0x438c1');
                }
                if (this.hook3) {
                    hook_tt();
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

function print_obj_list(obj_list, tag) {
    var ArrayClz = Java.use("java.lang.reflect.Array");
    var len = ArrayClz.getLength(obj_list);
    for (let i = 0; i != len; i++) {
        var cb = ArrayClz.get(obj_list, i).toString();
        console.log(tag, cb);
    }
}

function hook_java() {
    Java.perform(function () {
        let k = Java.use("ms.bd.c.k");
        k["a"].implementation = function (i, i2, j, str, obj) {
            if (i != 16777217) {
                //console.log('a is called' + ', ' + 'i: ' + i + ', ' + 'i2: ' + i2 + ', ' + 'j: ' + j + ', ' + 'str: ' + str + ', ' + 'obj: ' + obj);
                if (i == 83886081) {
                    print_obj_list(obj, "ms.bd.c.k.a 83886081");
                }
            }
            let ret = this.a(i, i2, j, str, obj);
            if (i != 16777217) {
                //console.log('a ret value is ' + ret);
            }
            return ret;
        };
        k["b"].implementation = function (i, i2, j, str, obj) {
            if (i == 196609) {
                //console.log('b is called' + ', ' + 'i: ' + i + ', ' + 'i2: ' + i2 + ', ' + 'j: ' + j + ', ' + 'str: ' + str + ', ' + 'obj: ' + obj);
                print_obj_list(obj, "ms.bd.c.k.b 196609");
            }
            let ret = this.b(i, i2, j, str, obj);
            if (i == 196609) {
                print_obj_list(ret, "ms.bd.c.k.b 196609");
            }
            return ret;
        };
        let AppLog = Java.use("com.ss.android.common.applog.AppLog");
        AppLog["getLogEncryptSwitch"].implementation = function () {
            let ret = this.getLogEncryptSwitch();
            return false;
        };
        let TTNetInitMetrics = Java.use("com.bytedance.frameworks.baselib.network.http.cronet.TTNetInitMetrics");
        TTNetInitMetrics["LIZJ"].implementation = function () {
            let ret = this.LIZJ();
            console.log('LIZJ ret value is ' + ret.toString());
            return ret;
        };
        TTNetInitMetrics["LIZ"].overload('android.content.Context', 'java.util.List').implementation = function (context, list) {
            console.log('LIZ is called' + ', ' + 'context: ' + context + ', ' + 'list: ' + list.toString());
            let ret = this.LIZ(context, list);
            console.log('LIZ ret value is ' + ret);
            return ret;
        };
    });
}

function find_RegisterNatives() {
    let symbols = Module.enumerateSymbolsSync("libart.so");
    let addrRegisterNatives = null;
    for (let i = 0; i < symbols.length; i++) {
        let symbol = symbols[i];
        if (symbol.name.indexOf("art") >= 0 &&
                symbol.name.indexOf("JNI") >= 0 && 
                symbol.name.indexOf("RegisterNatives") >= 0 && 
                symbol.name.indexOf("CheckJNI") < 0) {
            addrRegisterNatives = symbol.address;
            console.log("RegisterNatives is at ", symbol.address, symbol.name);
            hook_RegisterNatives(addrRegisterNatives)
        }
    }
}

function hook_RegisterNatives(addrRegisterNatives) {
    if (addrRegisterNatives != null) {
        Interceptor.attach(addrRegisterNatives, {
            onEnter: function (args) {
                console.log("[RegisterNatives] method_count:", args[3]);
                let java_class = args[1];
                let class_name = Java.vm.tryGetEnv().getClassName(java_class);
                let methods_ptr = ptr(args[2]);
                let method_count = parseInt(args[3]);
                for (let i = 0; i < method_count; i++) {
                    let name_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3));
                    let sig_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3 + Process.pointerSize));
                    let fnPtr_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3 + Process.pointerSize * 2));
                    let name = Memory.readCString(name_ptr);
                    let sig = Memory.readCString(sig_ptr);
                    let symbol = DebugSymbol.fromAddress(fnPtr_ptr);
                    let callee = DebugSymbol.fromAddress(this.returnAddress);
                    console.log("[RegisterNatives] java_class:", class_name, "name:", name, "sig:", sig, "fnPtr:", fnPtr_ptr,  " fnOffset:", symbol, " callee:", callee);
                }
            }
        });
    }
}

function main() {
    hook_native();
    hook_java();
    find_RegisterNatives();
}

setImmediate(main)
