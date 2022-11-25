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

function main() {
    hook_java();
}

setImmediate(main)