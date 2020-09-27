const Joi = require('joi');
const { omit } = require('lodash');

function makeRoutes({ model, strategies = ['auth', 'jwt'], scopes = { default: ['ADMIN'] } }) {
  const {
    browse,
    read,
    add,
    edit,
    remove,
    name,
  } = model;

  const routes = [
    {
      method: 'GET',
      path: `/users/{user_id}/${name}`,
      handler: req => browse(req.query),
      config: {
        auth: {
          strategies,
          scope: scopes.browse || scopes.default,
        },
        description: `Browse for a user's ${name}`,
        notes: `Browse for a user's ${name}`,
        tags: ['api', name],
        validate: {
          params: Joi.object({
            user_id: Joi.string().uuid().required()
          }),
          query: Joi.object(model.getFullQuerySchema())
        },
      },
    },
    {
      method: 'POST',
      path: `/users/{user_id}/${name}`,
      handler: req => add(req.payload),
      config: {
        auth: {
          strategies,
          scope: scopes.add || scopes.default,
        },
        description: `Adds an user's ${name}`,
        notes: `Adds a user ${name} record`,
        tags: ['api', name],
        validate: {
          params: Joi.object({
            user_id: Joi.string().uuid().required()
          }),
          payload: Joi.object(model.autoincrements() ? omit(model.schema, 'id') : model.schema),
        },
      },
    },
    {
      method: 'PUT',
      path: `/users/{user_id}/${name}/{id}`,
      config: {
        auth: {
          strategies,
          scope: scopes.edit || scopes.default,
        },
        handler: req => edit(req.params.id, req.payload),
        description: `Edits a ${name} record`,
        notes: `Edits a ${name} record`,
        tags: ['api', name],
        validate: {
          params: Joi.object({
            user_id: Joi.string().uuid().required(),
            id: model.schema.id,
          }),
          payload: Joi.object(omit(model.schema, 'id')),
        },
      },
    },
    {
      method: 'GET',
      path: `/users/{user_id}/${name}/{id}`,
      config: {
        auth: {
          strategies,
          scope: scopes.read || scopes.default,
        },
        handler: req => read(req.params.id),
        description: `Reads a ${name} record by Id`,
        notes: `Reads a ${name} record by Id`,
        tags: ['api', name],
        validate: {
          params: Joi.object({
            user_id: Joi.string().uuid().required(),
            id: model.schema.id,
          }),
        },
      },
    },
    {
      method: 'DELETE',
      path: `/users/{user_id}/${name}/{id}`,
      config: {
        auth: {
          strategies,
          scope: scopes.remove || scopes.default,
        },
        handler: req => remove(req.params.id),
        description: `Removes a ${name} record`,
        notes: `Removes a ${name} record byd id`,
        tags: ['api', name],
        validate: {
          params: Joi.object({
            user_id: Joi.string().uuid().required(),
            id: model.schema.id,
          }),
        },
      },
    },
  ];

  return routes;
}


module.exports = makeRoutes;

