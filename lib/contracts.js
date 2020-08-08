// Copyright 2019 Iced Development, LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const debug = require('debug')('contracts');
const bread = require('./bread');
const {
  isUndefined,
  omitBy
} = require('lodash');
const knex = require('../knex');
const cache = require('./cache');
const { allContracts } = require('./queries');

const {
  throwDatabaseError,
  throwNotFound
} = require('../lib/errors');

  // has_attached_file :document,
  // { :styles =>
  //   {
  //     :medium => "300x300>",
  //     :large => "900x900>"
  //   },
  //   :storage => :s3,
  //   :s3_protocol => :https,
  //   :s3_credentials => { :access_key_id     => ENV['S3_KEY'],
  //                      :secret_access_key => ENV['S3_SECRET'] },
  //   :path => ":attachment/:id/:style.:extension",
  //   :bucket => ENV['S3_BUCKET']
  // }

const contractFields = [
  'id',
  'user_id', // owning user foreign key
  'first_name',
  'last_name',
  'cosigner',
  'signed_at',
  'document_file_name',

  'created_by', // creating user foreign key

  'is_deleted',
  'created_at',
  'updated_at',
];

async function add(data) {
  console.log(data);
  const fields = [
    'first_name',
    'last_name',
    'signed_at',
  ];
  const contractData = omitBy({
    first_name: data.first_name,
    last_name: data.last_name,
    signed_at: data.signed_at,
  }, isUndefined);

  try {
    const breadAdd = await bread.add('contracts', fields, contractData);
    return { id: breadAdd.id };
  } catch (err) {
    return err;
  }
}

async function edit(data) {
  console.log(data);
  const fields = [
    'id',
    'first_name',
    'last_name',
    'signed_at',
  ];
  const contractData = omitBy({
    first_name: data.first_name,
    last_name: data.last_name,
    signed_at: data.signed_at,
  }, isUndefined);

  try {
    const breadEdit = await bread.edit('contracts', fields, contractData, {id: data.id});
    return breadEdit;
  } catch (err) {
    return err;
  }
}

function del(id) {
  const filter = {
    id,
    is_deleted: false,
  };

  return knex('contracts')
    .where(filter)
    .update({
      is_deleted: true,
    })
    .returning(['id', 'is_deleted'])
    .catch((err) => {
      debug(err);
      return throwDatabaseError(err);
    })
    .then((row) => {
      if (row.length !== 1) {
        return throwNotFound();
      }
      clearCache(id);
      return row[0];
    });
}

async function byId(id) {
  const contract = await bread.read('contracts', null, { id });
  if (contract) {
    return contract;
  }
  return null;
}

async function byIdCached(id) {
  const contract = await cache.getOrStore({ segment: 'CONTRACT', id: String(id) }, null, byId, id);
  if (contract) {
    return contract;
  }
  return throwNotFound();
}

function clearCache(id) {
  return cache.drop({ segment: 'CONTRACT', id: String(id) });
}

function browse(query) {
  const filter = omitBy({
    is_deleted: false,
  }, isUndefined);

  return bread.browse('contracts', contractFields, filter);
}

module.exports = {
  add,
  del,
  edit,
  byId,
  byIdCached,
  clearCache,
  browse
};
