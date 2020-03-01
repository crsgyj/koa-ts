FROM node:12.6.0-buster-slim
# 用12.6.0-buster或 12.6.0-buster-slim(体积小)
ENV NODE_ENV development

RUN mkdir /devvdb2/ && mkdir /devvdb2/nodekoa2

WORKDIR /devvdb2/nodekoa2

COPY . .

RUN npm install --production --ignore-scripts --silent

EXPOSE 9091
CMD npm run apidoc && npm start

# sudo docker login --username=bsq0224 registry.cn-hangzhou.aliyuncs.com   # bsq@321321!
# docker pull registry.cn-hangzhou.aliyuncs.com/bsq_repo/bsq-server:<tag>
# docker run -tid --name bsqServer -p 30080:9091 --restart=always registry.cn-hangzhou.aliyuncs.com/bsq_repo/bsq-server:<tag>