# Member Management API

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

[![Build Status](https://travis-ci.com/heatsynclabs/members_api.svg?branch=master)](https://travis-ci.com/heatsynclabs/members_api)

This is the API component of the [members_app](https://github.com/heatsynclabs/members_app). See that repo for full project info and general readme information.

## Normal Docker Dev Usage

**Consider following the Docker instructions in the `members_app` repo instead of here, to get a full environment going instead of piecemeal with just the API.**

If you need to override some of the default environment variables or ports in from the docker-compose.yml file, you can create a docker-compose.override.yml and add your own environment variables or ports there. This file is automatically used by docker-compose and is ignored by git, so you can safely add it to your local repo.

  > **Warning, this docker image is intended for dev mode** attached to a destroyable Postgres server and npm-install-able project folder. ***Running this in critical/prod environments is strongly discouraged without lots of testing!!!***

Take note of port numbers, DATABASE_URL, SENDGRID_API_KEY, and volume paths.

You can add the following parameters to the docker-compose file if desired:
  - `NPMINSTALL: 1`
    - allows you to re-run npm install on boot so that if you're using volumes your local filesystem is prepared to run the app (not just the filesystem inside the docker image)
  - `volumes:`
      - `.:/home/app`
      - mounts "this" folder in the /home/app directory of the docker image so that you can edit files locally and have them appear inside docker.

If you have issues with docker volumes (i.e. local file changes don't affect the docker filesystem), try rebuilding:
  - delete all images and containers locally with `docker rm <container_id> && docker rmi <image_id>`
  - `docker-compose down`
  - `docker-compose build --no-cache`
  - `docker-compose up --verbose`

Review the `Dockerfile` so you know what's about to be booted. For example, the working directory, package.json, and CMD (including npm install and fixture-installation commands) lines which by default will affect your environment.

Create the docker container for the api and database:
`docker-compose up`

To access the container's shell prompt:
`docker exec -it members_api /bin/sh`

To create basic db tables from within container shell:
`npm run up`

To view this container's website from the docker host machine: `http://localhost:3004`

To access the database directly, use your docker host's `psql` or `pgadmin` client on `localhost:5432` (assuming you've forwarded the port in docker-compose.yml)

Note that this app is just the API, so again if you want a working app you probably want to check out the `members_app` repo.

### Debugging Docker Dev Usage

You can build this container directly with: `docker build -t members_api .`
You can run this container directly with: `docker run -it members_api /bin/sh`
You'll then have to manually run commands like `npm install` or `npm run start` (see Dockerfile and docker-compose.yml for various assumptions and env vars we use during normal runtime.)

## Tests

To run tests or coverage, we use lab:

  - `npm run test`
  - `npm run coverage`

## Manual testing/usage

Assuming your docker and/or node are on port 3004, you can run:

Authenticate:

  `curl -X POST -d 'email=admin@example.com&password=Testing1!' localhost:3004/auth`
  `export MY_AUTH_TOKEN=PASTE_YOUR_AUTH_TOKEN_HERE`

All users:

  `curl -H "Authorization: Bearer $MY_AUTH_TOKEN" localhost:3004/users/all`

All events:

  `curl -H "Authorization: Bearer $MY_AUTH_TOKEN" localhost:3004/events`

Create an event:
  `curl -X POST -H "Authorization: Bearer $MY_AUTH_TOKEN" -d "name=Foo Bar&start_date=2020-07-01" localhost:3004/events`

Delete an event:
  `curl -X DELETE -H "Authorization: Bearer $MY_AUTH_TOKEN" localhost:3004/events/YOUR_EVENT_ID_HERE`
