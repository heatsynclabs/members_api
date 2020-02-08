# Member Management API

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

[![Build Status](https://travis-ci.com/heatsynclabs/members_api.svg?branch=master)](https://travis-ci.com/heatsynclabs/members_api)

This is the API component of the [members_app](https://github.com/heatsynclabs/members_app). See that repo for full project info.

## Normal Docker Dev Usage

**Consider following the Docker instructions in the `members_app` repo instead of here, to get a full environment going instead of piecemeal with just the API.**

First, create a local copy of your docker-compose:
`cp docker-compose.dist.yml docker-compose.yml`

And edit it as desired:
`nano docker-compose.yml`

  > **Warning, this docker image is intended for dev mode** attached to a destroyable Postgres server and npm-install-able project folder. ***Running this in critical/prod environments is strongly discouraged without lots of testing!!!***

Take note of port numbers, DATABASE_URL, SENDGRID_API_KEY, and volume paths.

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
