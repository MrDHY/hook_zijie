# hook_dy_ssl

## zijie 通用绕过 ssl pinning 脚本

```shell
frida -U -f "com.ss.android.ugc.aweme" -l .\hook_dy_ssl.js
```

## zijie 签名相关 java hook

```shell
frida -U -f "com.ss.android.ugc.aweme" -l .\hook_dy_sign.js
```
