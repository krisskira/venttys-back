FROM node:14 AS builder
WORKDIR /home/build
COPY src ./src
COPY package.json ./
COPY tsconfig.json ./
RUN npm install
RUN npm run build
 
FROM node:14-alpine AS App
WORKDIR /home/app
COPY --from=builder /home/build/dist /home/app/dist
COPY --from=builder /home/build/package.json /home/app
RUN npm install --production

FROM ubuntu:latest
RUN apt update && apt install -y docker.io

RUN apt-get update && apt-get install -y \
    ca-certificates \
    nano \
    curl

ARG NODE_VERSION=14.16.0
ARG NODE_PACKAGE=node-v$NODE_VERSION-linux-x64
ARG NODE_HOME=/opt/$NODE_PACKAGE

ENV NODE_PATH $NODE_HOME/lib/node_modules
ENV PATH $NODE_HOME/bin:$PATH

RUN curl https://nodejs.org/dist/v$NODE_VERSION/$NODE_PACKAGE.tar.gz | tar -xzC /opt/

ENV EXTERNAL_PUBSUB_SERVER='venttys-kafka:9092'
ENV ENV='production'
ENV PORT='80'
EXPOSE 80

COPY --from=App /home/app /home/app
WORKDIR /home/app
VOLUME [ "/home/app/public", "/home/app/logs" ]

CMD ["npm", "start"]