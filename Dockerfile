FROM node:14 AS builder
WORKDIR /home/build
COPY src ./src
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
RUN npm install
RUN npm run build

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

COPY --from=builder /home/build /home/app
WORKDIR /home/app
VOLUME [ "/home/app/dist/public", "/home/app/dist/logs" ]

CMD ["npm", "start"]