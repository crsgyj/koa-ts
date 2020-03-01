FROM node:12.6.0-buster-slim
# 用12.6.0-buster或 12.6.0-buster-slim(体积小)
ENV NODE_ENV production

RUN mkdir /app

WORKDIR /app

COPY . .

RUN npm install --production --ignore-scripts --silent

EXPOSE 9091
# 部署的时候可以将apidoc文件夹挂载到外边用nginx输出文档
CMD npm run apidoc && npm start
