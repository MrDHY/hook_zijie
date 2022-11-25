function hook_ssl(){
	var cronet = Module.findBaseAddress("libsscronet.so");
    console.log('libsscronet.so base', cronet);
    // var pAddr = cronet.add(0x2BDA14);
    // console.log(hexdump(pAddr, {
    //     offset: 0,
    //     length: 4,
    //     header: true,
    //     ansi: true,
    // }));
	var ver = Module.findExportByName("libttboringssl.so", "SSL_CTX_set_custom_verify");
	var custom_verify = new NativeFunction(ver, 'pointer', ['pointer', 'int', 'pointer']);
	var self = new NativeCallback(function(arg1, arg2, arg3) {
		hookCallBack(arg3);
		console.log('SSL_CTX_set_custom_verify called', arg2, arg3);
		return custom_verify(arg1, 0, arg3);
	}, 'pointer', ['pointer', 'int', 'pointer']);
	Interceptor.replace(ver, self);
}
 
function hookCallBack(p){
	var fun = new NativeFunction(p, 'int', ['pointer', 'pointer']);
	var self = new NativeCallback(function(arg1, arg2){
        var f = fun(arg1, arg2);
		//console.log("SSL_CTX_set_custom_verify callback", f);
		return 0;
	}, 'int', ['pointer', 'pointer']);
	Interceptor.replace(fun, self);
}

function hook_java() {
    Java.perform(function(){  
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
    });
}

function hook_native() {
    var android_dlopen_ext = Module.findExportByName(null, "android_dlopen_ext");
    console.log(android_dlopen_ext);
    if(android_dlopen_ext != null){
        Interceptor.attach(android_dlopen_ext,{
            onEnter: function(args){
                var soName = args[0].readCString();
                //console.log(soName);
                if(soName.indexOf("libsscronet.so") != -1){
                    this.hook1 = true;
                }
                if(soName.indexOf("libmetasec_ml.so") != -1){
                    this.hook2 = true;
                }
            },
            onLeave: function(retval){
                if (this.hook1){
                    hook_ssl();
                }
                if (this.hook2){
                    var ml = Module.findBaseAddress("libmetasec_ml.so");
                    console.log('libmetasec_ml.so base', ml);
                }
            }
        });
    }
}


function main() {
    hook_native();
    hook_java();
}

setImmediate(main)