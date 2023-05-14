# Member Management API

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) [![Lint](https://github.com/heatsynclabs/members_api/actions/workflows/lint.yml/badge.svg)](https://github.com/heatsynclabs/members_api/actions/workflows/lint.yml) [![Test](https://github.com/heatsynclabs/members_api/actions/workflows/test.yml/badge.svg)](https://github.com/heatsynclabs/members_api/actions/workflows/test.yml)

This is the API component of the [members_app](https://github.com/heatsynclabs/members_app). See that repo for full project info and general readme information.

See the CONTRIBUTING file for information on helping out, or our [Wiki](https://wiki.heatsynclabs.org/wiki/HSL_API) for project governance.

## Normal Docker Dev Usage

### Prerequisites

- Docker Compose v2 or higher (run `docker compose version` or `docker-compose version`)
- If using your own database server vs the builtin Docker, Postgres 15.

### ARM vs x86 Considerations

Due to the way npm handles binary packages across different CPU architectures, **if you run add a new dependency** (npm install ...), you will have to remove the volume and recreate the image, so something like:

```
docker compose rm -fsv members_api
docker volume rm members_api_nm
docker compose up -d members_api
```

### Instructions

<!--**Consider following the Docker instructions in the `members_app` repo instead of here, to get a full environment going instead of piecemeal with just the API.**-->

If you need to override some of the default environment variables or ports in from the docker-compose.yml file, you can create a docker-compose.override.yml and add your own environment variables or ports there.

  > **Warning, this docker image is intended for dev mode** attached to a destroyable Postgres server and npm-install-able project folder. ***Running this in critical/prod environments is strongly discouraged without lots of testing!!!***

Take note of port numbers, DATABASE_URL, SENDGRID_API_KEY, and volume paths. For production environments, REDIS_URL is used for cache but for dev/test we use in-memory cache.

You can add the following parameters to a new docker-compose.override.yml file if desired:
  - `NPMINSTALL: 1`
    - allows you to re-run npm install on boot so that if you're using volumes your local filesystem is prepared to run the app (not just the filesystem inside the docker image)
  - `volumes:`
      - `.:/home/app`
      - mounts "this" folder in the /home/app directory of the docker image so that you can edit files locally and have them appear inside docker.

If you have issues with docker volumes (i.e. local file changes don't affect the docker filesystem), try rebuilding:
  - delete all images and containers locally with `docker rm <container_id> && docker rmi <image_id>`
  - `docker compose down`
  - `docker compose build --no-cache`
  - `docker compose up --verbose`

Review the `Dockerfile` so you know what's about to be booted. For example, the working directory, package.json, and CMD (including npm install and fixture-installation commands) lines which by default will affect your environment.

Create the docker container for the api and database:
`docker compose up`

To access the container's shell prompt for the following npm commands:
`docker exec -it members_api /bin/sh`

If you **do** have an existing db and want to upgrade its schema to the latest structure:
`npm run db_migrate_latest`

***OR***

If you **don't** have an existing db and want to create basic sample database structure and entries:
`npm run db_seed`

Other npm tasks include db_migrate_rollback_all, db_migrate_down, db_migrate_up, and db_clear.

To view this container's website from the docker host machine: `http://localhost:3004`

To access the database directly, use your docker host's `psql` or `pgadmin` client on `localhost:5432` (assuming you've forwarded the port in docker-compose.yml)

<!--Note that this app is just the API, so again if you want a working app you probably want to check out the `members_app` repo.-->

### Debugging Docker Dev Usage

You can build this container directly with: `docker build -t members_api .`
You can run this container directly with: `docker run -it members_api /bin/sh`
You'll then have to manually run commands like `npm install` or `npm run start` (see Dockerfile and docker-compose.yml for various assumptions and env vars we use during normal runtime.)

### Emails/SMTP

[Inbucket](https://inbucket.org) is running on http://localhost:10001 by default in dev mode so that you can receive emails without actually sending anything.

### Development

As you make file changes, you may need to restart Docker to get the webserver to detect those changes.

## Database

Under Docker, a single container runs two databases; `members_api_db_development` and `members_api_db_test`.
The test database `members_api_db_test` is managed by Docker scripts, and is migrated up and down as part of each test run.
The development database is migrated each time it is booted up.
Migrations and data seeds against the development database may be run manually with the `./scripts/docker-exec.sh` script.

  - `docker exec members_api npm run db_migrate_up`
  - `docker exec members_api npm run db_seed`

## Tests

To run tests or coverage, we use [lab](https://hapi.dev/module/lab/):

  - `npm run test`
  - `npm run coverage`

Via Docker:

  - `docker-compose build`
  - `NODE_ENV=test docker compose run --rm members_api`
  - `docker stop members_api_postgres && docker container rm members_api_postgres && docker volume rm members_api_db_data`

  or one specific test only:

  - `docker-compose build`
  - `NODE_ENV=test docker-compose run --rm members_api npm run test test/routes/events/browse.js`

## Manual testing/usage

Assuming your docker and/or node are on port 3004, you can run:

Authenticate with email:

`curl 'localhost:3004/users/email_login' -X POST -H 'Content-Type: application/json' --data-raw '{"email":"admin@example.com"}'`

> Check Inbucket or your email account for the login link (token)

`curl 'localhost:3004/users/oauth_token' -X POST -H 'Content-Type: application/json' --data-raw '{"token":"57bsnip6-6snip4-4snip7-bsnipd-47snipsnip1fd"}'`

> Expected response: {"id":"6d1b52cf-snip-snip-snip-9ed80f8f7050","name":"Admin","scope":["ADMIN","USER"],"email":"admin@example.com","is_validated":true,"is_deleted":false,"version":10,"token":"eyJhbGsnipsnipsnipJ9.eyJpZCsnipsnipsnipsnipsnipsnipcyODh9.sTRsnipqY-ojmsnipsnipsnipsnipWo"}
> Use your token as the auth token from then on.

Authenticate with password:

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

## API Documentation
API Swagger documentation can be accessed from the docker host machine: `http://localhost:3004/documentation`

## Heroku Deploy

- See `app.json`
