const Joi = require('joi');
const { omit } = require('lodash');
const { getCreds, userOrAdmin } = require('../lib/util');
const boom = require('boom');

const anyUser = async (req) => {
  return !!getCreds(req);
};

function makeRoutes({
  model,
  strategies = ['auth', 'jwt'],
  scopes = { default: ['ADMIN'] },
  canBrowse = anyUser,
  canRead = anyUser,
  canEdit = userOrAdmin,
  canAdd = userOrAdmin,
  canDelete = userOrAdmin,
}) {
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
      handler: async (req) => {
        const auth = await canBrowse(req);
        if (!auth) {
          throw boom.unauthorized();
        }
        return browse(req.query);
      },
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
          query: Joi.object(omit(model.getFullQuerySchema(), ['user_id'])).label(`${name}QueryModel`)
        },
      },
    },
    {
      method: 'POST',
      path: `/users/{user_id}/${name}`,
      handler: async (req) => {
        const auth = await canAdd(req);
        if (!auth) {
          throw boom.unauthorized();
        }
        return add(req.payload);
      },
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
          payload: Joi.object(model.autoincrements() ? omit(model.schema, 'id') : model.schema).label(`${name}AddModel`),
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
        handler: async (req) => {
          const auth = await canEdit(req);
          if (!auth) {
            throw boom.unauthorized();
          }
          return edit(req.params.id, req.payload);
        },
        description: `Edits a ${name} record`,
        notes: `Edits a ${name} record`,
        tags: ['api', name],
        validate: {
          params: Joi.object({
            user_id: Joi.string().uuid().required(),
            id: model.schema.id,
          }),
          payload: Joi.object(omit(model.schema, 'id')).label(`${name}EditModel`),
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
        handler: async (req) => {
          const auth = await canRead(req);
          if (!auth) {
            throw boom.unauthorized();
          }
          return read(req.params.id);
        },
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
        handler: async (req) => {
          const auth = await canDelete(req);
          if (!auth) {
            throw boom.unauthorized();
          }
          return remove(req.params.id);
        },
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

