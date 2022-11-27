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

## LIZJ
```shell
LIZJ is called
LIZJ ret value is {"mode":2,"is_main_process":true,"net_thread_priority":0,"ttnet_timestamp":{"ttnet_start":1669474192450,"ttnet_end":1669474192630,"engine_start":1669474192652,"engine_end":1669474192855,"init_start":1669474192805,"init_end":1669474192961,"network_start":1669474192995,"network_end":1669474193794,"exec_wait_end":1669474193794,"preconnect_start":1669474193547},"ttnet_duration":{"builder_build":59,"load_cronet":0,"init_mssdk":145,"init_ttnet":180,"init_metasec":40,"create_engine":203,"init_thread":156,"native_init_thread":20,"network_thread":799,"exec_tasks":0,"init_total":1344,"init_preconnect":1097,"nqe_init":9,"prefs_init":42,"channel_init":0,"context_build":55,"tnc_config":320,"update_appinfo":59,"netlog_init":11,"nqe_detect":64,"preconnect":178,"ssl_session":2,"ttnet_config":1,"install_cert":12}}
```
