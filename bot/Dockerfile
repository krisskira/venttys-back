FROM node:14 AS builder
WORKDIR /home/build
COPY src ./src
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
RUN npm install
RUN npm run build

FROM node:14-slim

WORKDIR /home/app

RUN apt-get update && \
    apt-get install -yq \
    curl nano gconf-service libasound2 libatk1.0-0 libc6 libcairo2 \
    libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 \
    libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
    libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
    libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
    libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation \
    libappindicator1 libnss3 lsb-release xdg-utils wget build-essential \
    apt-transport-https libgbm-dev

COPY --from=builder /home/build/build /home/app/build
COPY --from=builder /home/build/package.json /home/app
RUN npm install --production

ENV PHONE=''
ENV COMMERCE=''
ENV NODE_ENV='production'
ENV EXTERNAL_PUBSUB_SERVER='kafka:9092'
ENV DB_CONNECTION_STRING="mongodb://venttys:dmVudHR5cw@venttys-mongo:27017/venttys-bot?authSource=admin"
VOLUME ["/home/app/public", "/home/app/tokens"]
CMD ["npm", "start"]
