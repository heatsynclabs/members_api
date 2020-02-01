FROM node:12.9.1-alpine
EXPOSE 3000 9229

RUN apk update

RUN apk add \
  build-base \
  python=2.7

WORKDIR /home/app

COPY package.json /home/app/
#COPY package-lock.json /home/app/

#RUN npm ci

# Temporary copy that will likely be overwritten by a volume
COPY . /home/app

#RUN npm run build
RUN npm install

CMD /home/app/docker/run.sh
