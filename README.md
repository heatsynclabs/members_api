


## Docker Usage

First, create a local copy of your docker-compose:
`cp docker-compose.dist.yml docker-compose.yml`

And edit it as desired:
`nano docker-compose.yml`

  > Note that by default **a volume is mounted** from some folder (ideally this folder) on your machine to the `/home/app` folder in the container for development purposes, but that line can be removed in production.
  > Also, **npm install** is run at every container bootup, so think about the consequences in the mounted environment before running.

Create the docker container for the api and database:
`docker-compose up`

To access the container's shell prompt:
`docker exec -it members_api /bin/sh`

To create basic db tables from within container shell:
`npm run up`

## Tests

To run tests or coverage, we use lab:

  - `npm run test`
  - `npm run coverage`