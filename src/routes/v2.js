'use strict';

const fs = require('fs');
const express = require('express');
const Collection = require('../models/data-collection.js');
const bearerAuth = require('../middleware/bearer')
const can = require('../middleware/acl')
const basicAuth = require('../middleware/basic')

const router = express.Router();

const models = new Map();

router.param('model', (req, res, next) => {
  const modelName = req.params.model;
  if (models.has(modelName)) {
    req.model = models.get(modelName);
    next();
  } else {
    const fileName = `${__dirname}/../models/${modelName}/model.js`;
    if (fs.existsSync(fileName)) {
      const model = require(fileName);
      models.set(modelName, new Collection(model));
      req.model = models.get(modelName);
      next();
    }
    else {
      next("Invalid Model");
    }
  }
});


router.get('/:model', bearerAuth, handleGetAll);
router.get('/:model/:id', bearerAuth, handleGetOne);
router.post('/:model', bearerAuth, can('create'), handleCreate);
router.put('/:model/:id', bearerAuth, can('update'), handleUpdate);
router.delete('/:model/:id', bearerAuth, can('delete'), handleDelete);

// router.get('/:model', basicAuth, can('read'), handleGetAll);
// router.get('/:model/:id', basicAuth, can('read'), handleGetOne);
// router.post('/:model', bearerAuth, can('create'), handleCreate);
// router.put('/:model/:id', bearerAuth, can('update'), handleUpdate);
// router.delete('/:model/:id', bearerAuth, can('delete'), handleDelete);

async function handleGetAll(req, res) {
  try {
    let allRecords = await req.model.get();
    res.status(200).json(allRecords);
  } catch (error) {
    throw new Error(error.message);
  }

};

async function handleGetOne(req, res) {
  try {
    const id = req.params.id;
    let theRecord = await req.model.get(id)
    res.status(200).json(theRecord);
  } catch (error) {
    throw new Error(error.message)
  }

};

async function handleCreate(req, res) {
  try {
    let obj = req.body;
    let newRecord = await req.model.create(obj);
    res.status(201).json(newRecord);
  } catch (error) {
    throw new Error(error.message)
  }

};




async function handleUpdate(req, res) {
  try {
    const id = req.params.id;
    const obj = req.body;
    let updatedRecord = await req.model.update(id, obj)
    res.status(200).json(updatedRecord);

  } catch (error) {
    throw new Error(error.message)
  }
};


async function handleDelete(req, res) {
  try {
    let id = req.params.id;
    let deletedRecord = await req.model.delete(id);
    res.status(200).json();
  }
  catch (error) {

    throw new Error(error.message)
  }
}


module.exports = router;