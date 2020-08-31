const express = require('express');
const ListsService = require('./lists-service');
const path = require('path')
const { requireAuth } = require('../middleware/jwt-auth');

const listsRouter = express.Router()
const jsonBodyParser = express.Router()

listsRouter
  .route('/')
  .get((req, res, next) => {
      ListsService.getAllLists(req.app.get('db'))
        .then(lists => {
            res.json(ListsService.serializeLists(lists))
        })
        .catch(next)
  })

listsRouter
  .route('/:list_id')
  .all(requireAuth)
  .all(checkListExists)
  .get((req, res) => {
      res.json(ListsService.serializeList(res.list))
  })

listsRouter
  .route('/:list_id/wishes/')
  .all(requireAuth)
  .all(checkListExists)
  .get((req, res, next) => {
      ListsService.getWishesForList(
          req.app.get('db'),
          req.params.list_id
      )
        .then(wishes => {
            res.json(ListsService.serializeListWishes(wishes))
        })
        .catch(next)
  })

listsRouter
  .route('/')
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { list_title, list_description } = req.body
    const newList = { list_title, list_description }

      
    if (newList.list_title == null)
      return res.status(400).json({
        error: `Missing list title in request body`
      })

    newList.user_id = req.user.id

    ListsService.insertList(
      req.app.get('db'),
      newList
    )
      .then(list => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${list.id}`))
          .json(ListsService.serializeList(list))
      })
      .catch(next)
  })

async function checkListExists(req, res, next) {
    try {
        const list = await ListsService.getById(
            req.app.get('db'),
            req.params.list_id
        )

        if(!list)
          return res.status(404).json({
              error: `List doesn't exist`
          })

        res.list = list
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = listsRouter