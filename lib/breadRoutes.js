const { omit } = require('lodash');
const Joi = require('joi');

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
      path: `/${name}`,
      handler: req => browse(req.query),
      config: {
        auth: {
          strategies,
          scope: scopes.browse || scopes.default,
        },
        description: `Browse for ${name}`,
        notes: `Browse for ${name}`,
        tags: ['api', name],
        validate: {
          query: Joi.object(model.getFullQuerySchema())
        },
      },
    },
    {
      method: 'POST',
      path: `/${name}`,
      handler: req => add(req.payload),
      config: {
        auth: {
          strategies,
          scope: scopes.add || scopes.default,
        },
        description: `Adds an ${name}`,
        notes: `Adds an ${name} record`,
        tags: ['api', name],
        validate: {
          payload: Joi.object(model.autoincrements() ? omit(model.schema, 'id') : model.schema).label(`${name}AddModel`),
        },
      },
    },
    {
      method: 'PUT',
      path: `/${name}/{id}`,
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
            id: model.schema.id
          }),
          payload: Joi.object(omit(model.schema, 'id')),
        },
      },
    },
    {
      method: 'GET',
      path: `/${name}/{id}`,
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
            id: model.schema.id
          }),
        },
      },
    },
    {
      method: 'DELETE',
      path: `/${name}/{id}`,
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
            id: model.schema.id
          })
        },
      },
    },
  ];

  return routes;
}


module.exports = makeRoutes;

