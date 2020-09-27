const bread = require('../lib/bread');
const cache = require('../lib/cache');
const {
  assign,
  forEach,
  pick,
  omit,
  upperCase,
} = require('lodash');
const Joi = require('joi');

function makeQuery({ schema, viewOnly }) {
  const ns = {};
  forEach(assign({}, schema, viewOnly), (field, name) => {
    ns[name] = field.optional();
  });
  return omit(ns, 'id');
}

function makeQueryOptions({ schema, viewOnly }) {
  const ns = {};
  const cols = Object.keys(assign({}, schema, viewOnly));
  cols.push('created_at');
  ns.orderBy = Joi.string().valid(...cols);
  ns.orderBy = [ns.orderBy, Joi.array().items(ns.orderBy)];
  ns.sortOrder = Joi.string().valid('desc', 'asc').default('desc');
  ns.limit = Joi.number().integer();
  ns.offset = Joi.number().integer();
  return ns;
}

function makeBread(model) {
  const {
    name,
    viewName,
    schema,
    viewOnly,
    explicitId,
    softDelete
  } = model;

  function clearCache(id) {
    return cache.drop({ segment: upperCase(name), id: String(id) });
  }

  function read(id) {
    return bread.read(viewName || name, '*', { id });
  }

  return assign({
    autoincrements: () => {
      return !explicitId;
    },
    browse: (query) => {
      const filter = pick(query, Object.keys(assign({}, schema, viewOnly)));
      const options = pick(query, ['orderBy', 'sortOrder', 'limit', 'offset']);
      return bread.browse(viewName || name, '*', filter, options);
    },
    read,
    readCached: (id) => {
      return cache.getOrStore({ segment: upperCase(name), id: String(id) }, null, read, id);
    },
    clearCache,
    add: (payload) => {
      return bread.add(name, '*', payload);
    },
    remove: async (id) => {
      await clearCache(id);
      if (softDelete) {
        return bread.edit(name, '*', { is_deleted: true }, { id });
      }
      return bread.del(name, { id });
    },
    edit: async (id, payload) => {
      await clearCache(id);
      return bread.edit(name, '*', payload, { id });
    },
    getQueryOptions: () => {
      return makeQuery(model);
    },
    getQuerySchema: () => {
      return makeQueryOptions(model);
    },
    getFullQuerySchema: () => {
      return assign({}, makeQuery(model), makeQueryOptions(model));
    }
  }, model);
}

module.exports = makeBread;
