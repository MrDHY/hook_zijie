# hook_zijie

> hook_ssl: skip ssl pinning

> hook_java: hook ms.bd.c.k.a, ms.bd.c.k.b, com.ss.android.common.applog.AppLog.getLogEncryptSwitch

> hook_sign: hook X-Helios, X-Medusa

> hook ms.bd.c.k.a: ws_callback, http_callback

> hook ms.bd.c.k.b: try mssdk


```shell
frida -U -f "com.ss.android.ugc.aweme" -l .\hook_zijie.js
```

## ms.bd.c.k.a(67108865)
```shell
["1128","","","bo95dJizD1WFcV03zOuLzN5Pn1sFtVa3szqiVQmflMJTNW0p0Kpqfw8D4i0zUlfrou4kuYt\/i0521YRygM83dwv\/wn3DD+TMJF+QFzW9wb8Qq2\/1B4jPMbObrDNdyMMukpAYqy1fLWtbLGVIPxsFsZegwQy5lsRX9h49PH\/Qx8MwgYvWvH7ZTFLV28LwTWZiljQyBPaBE+TsyumEu0Y+JRkeidHFEYcVs0yRoa+xC004hugQhdPupIt6dBiWA4phsB3fNJZjFTAKGE1lPB4gzt6Qf+FmlgZBbRvT8zekxTV2HZ5dUvSutB2\/0QpbHKAvWL4DRA==","v04.04.02","","","","","","0","-1","99999",[],["tk_key","douyin"]]
```

## ms.bd.c.k.a(83886081)
```shell
ms.bd.c.k.a 83886081 http_callback
ms.bd.c.k.a 83886081 2888736837
ms.bd.c.k.a 83886081 ws_callback
ms.bd.c.k.a 83886081 2888811849
```
