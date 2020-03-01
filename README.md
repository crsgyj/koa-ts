# Koa-ts example project

### 目录

​	本项目主要基于 koa, koa-router, sequelize, typescript, node-websocket等模块编写。

```html
|
|—— index.js // 入口文件
|—— src      // 代码目录
	  |—— controller   // 控制层
	  |—— middleware   // 中间件层
	  |—— models       // Model层
    |—— router       // 路由层
	  |—— service	     // 服务层
	  |—— utils		     // 工具类
	  |—— wsImpl.ts    // 基本websocket实现
|—— config           // 配置文件
|—— apidoc           // 文档目录，npm run apidoc生成
|—— scripts          // 脚本
```



## 基本组织:
  * [router](src/router/router.md)
  * [controller](src/controller/controller.md)
  * [service](src/service/service.md)
  * [models](src/models/models.md)
  * [middleware](src/middleware/middleware.md)
  * [utils](src/utils/utils.md)



## 文档

文档使用apidoc. 注释编写在 [router](src/router/router.md) 层， 文档地址: 暂无。

文档命令:

```bash
$ api run apidoc
```



### 启动

```bash
  $ npm run build && npm start 
```

### 编译

编译方式 typescript ->  js + sourcemap

编译目录src, 目标目录dist

```bash
  $ npm run build 
  // or
  $ npm run watch
```

### 部署

> 镜像容器为 node:12.6.0-buster-slim (体积较小)，若未满足要求，可以选择node:12.6.0-buster

```bash
  # 登录阿里云仓库
  $ docker login --username=username registry.cn-hangzhou.aliyuncs.com  
  # 构建image
  $ docker build registry.cn-hangzhou.aliyuncs.com/<repo>/apiServer:<tag> .
  # 推送image
  $ docker build registry.cn-hangzhou.aliyuncs.com/<repo>/apiServer:<tag> .
  # 在远端服务器:
  $ docker pull registry.cn-hangzhou.aliyuncs.com/<repo>/apiServer:<tag> \
    && docker run -tid --name apiServer -p 30080:9091 --restart=always registry.cn-hangzhou.aliyuncs.com/<repo>/apiServer:<tag>
```
