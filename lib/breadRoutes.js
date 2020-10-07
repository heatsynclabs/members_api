const { omit, includes } = require('lodash');
const Joi = require('joi');

function makeRoutes({
  model,
  strategies = ['auth', 'jwt'],
  scopes = { default: ['ADMIN'] },
  skip = [],
}) {
  const {
    browse,
    read,
    add,
    edit,
    remove,
    name,
    postBrowse,
    postAdd,
    postEdit,
    postDelete,
    postRead,
  } = model;

  const routes = [];

  if (!includes(skip, 'browse')) {
    routes.push({
      method: 'GET',
      path: `/${name}`,
      handler: async (req) => {
        const results = await browse(req.query);
        if (postBrowse) {
          await postBrowse(results, req);
        }
        return results;
      },
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
    });
  }

  if (!includes(skip, 'read')) {
    routes.push({
      method: 'GET',
      path: `/${name}/{id}`,
      config: {
        auth: {
          strategies,
          scope: scopes.read || scopes.default,
        },
        handler: async (req) => {
          const results = read(req.params.id);
          if (postRead) {
            await postRead(results, req);
          }
          return results;
        },
        description: `Reads a ${name} record by Id`,
        notes: `Reads a ${name} record by Id`,
        tags: ['api', name],
        validate: {
          params: Joi.object({
            id: model.schema.id
          }),
        },
      },
    });
  }

  if (!includes(skip, 'edit')) {
    routes.push({
      method: 'PUT',
      path: `/${name}/{id}`,
      config: {
        auth: {
          strategies,
          scope: scopes.edit || scopes.default,
        },
        handler: async (req) => {
          const results = edit(req.params.id, req.payload);
          if (postEdit) {
            await postEdit(results, req);
          }
          return results;
        },
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
    });
  }

  if (!includes(skip, 'add')) {
    routes.push({
      method: 'POST',
      path: `/${name}`,
      handler: async (req) => {
        const results = add(req.payload);
        if (postAdd) {
          await postAdd(results, req);
        }
        return results;
      },
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
    });
  }

  if (!includes(skip, 'delete')) {
    routes.push({
      method: 'DELETE',
      path: `/${name}/{id}`,
      config: {
        auth: {
          strategies,
          scope: scopes.remove || scopes.default,
        },
        handler: async (req) => {
          const results = remove(req.params.id);
          if (postDelete) {
            await postDelete(results, req);
          }
          return results;
        },
        description: `Removes a ${name} record`,
        notes: `Removes a ${name} record byd id`,
        tags: ['api', name],
        validate: {
          params: Joi.object({
            id: model.schema.id
          })
        },
      },
    });
  }

  return routes;
}


module.exports = makeRoutes;

