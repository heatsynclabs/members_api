const Joi = require('joi');
const bread = require('../lib/bread');
const breadModel = require('../lib/breadModel');
const { activeCards } = require('../lib/queries');
const { publish } = require('../lib/mqtt');

function updateDoors() {
  publish('/door/updates', { status: 'updated' });
}

const model = breadModel({
  name: 'cards',
  schema: {
    id: Joi.number().integer().required(),
    user_id: Joi.string().uuid().required(),
    card_number: Joi.string(),
    note: Joi.string(),
    permissions: Joi.number(),
  },
  activeCards: () => bread.raw(activeCards),
  postEdit: updateDoors,
  postDelete: updateDoors,
  postAdd: updateDoors,
});

module.exports = model;
