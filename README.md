


## Docker Usage

First, create a local copy of your docker-compose:
`cp docker-compose.dist.yml docker-compose.yml`

And edit it as desired:
`nano docker-compose.yml`

Create the docker container for the api and database:
`docker-compose up`

To access the container's shell prompt:
`docker exec -it members_api sh`

To create basic db tables from within container shell:
`npm run up`
