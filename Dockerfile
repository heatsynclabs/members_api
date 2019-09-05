FROM node:12.9.1-alpine
EXPOSE 3000 9229

RUN apk update

RUN apk add \
  build-base \
  python=2.7.16-r1

WORKDIR /home/app

COPY package.json /home/app/
#COPY package-lock.json /home/app/

#RUN npm ci

COPY . /home/app

#RUN npm run build
RUN npm install

CMD npm run start
