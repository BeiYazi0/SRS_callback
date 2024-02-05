# SRS 回调管理

适用于 SRS 5.0

管理页面来自 [autopcr](https://github.com/cc004/autopcr)。

使用数据库存储身份验证信息。

## 配置 conf

需要修改 SRS 的启动配置文件，在 vhost 下增加 http_hook。

```python
vhost your_vhost {
    http_hooks {
        enabled         on;
        on_publish      http://127.0.0.1:7777/api/publish;
        on_play         http://127.0.0.1:7777/api/play;
    }
}
```
## 回调

未对停止推流和停止播放事件进行监听。

包含两个个参数，app 和 strea m所对应的 username 和 key。

SRS post 的形式似乎是 ...&url=rtmp...&...，因此username 和 key 暂且用 ？ 而不是 & 隔开。

### 推流

rtmp://ip/app/stream?username=xxx?key=xxx

### 拉流

port 默认8080

rtmp: rtmp://ip/app/stream?username=xxx?key=xxx

http-flv: http://ip:port/app/stream.flv?username=xxx?key=xxx

hls: http://ip:port/app/stream.m3u8?username=xxx?key=xxx

## 管理

http://127.0.0.1:7777/

账户: admin 密码:123456

包括添加配置、修改配置、删除配置、查看所有配置、查看推拉流情况。

目前需要操作后刷新才能查看所有配置、查看推拉流情况。
