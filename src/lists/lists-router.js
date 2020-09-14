const express = require('express');
const ListsService = require('./lists-service');
const path = require('path')
const { requireAuth } = require('../middleware/jwt-auth');

const listsRouter = express.Router()
const jsonBodyParser = express.json()

listsRouter
  .route('/')
  .get((req, res, next) => {
      ListsService.getAllLists(req.app.get('db'))
        .then(lists => {
            res.json(ListsService.serializeLists(lists))
        })
        .catch(next)
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { list_title, list_description } = req.body
    const newList = { list_title, list_description }

    for(const [key, value] of Object.entries(newList))
    if (value == null)
      return res.status(400).json({
          error: `Missing '${key}' in request body`
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
  

listsRouter
  .route('/:list_id')
  .all(requireAuth)
  .all(checkListExists)
  .get((req, res) => {
      res.json(ListsService.serializeList(res.list))
  })
  .delete((req, res, next) => {
    ListsService.deleteList(
      req.app.get('db'),
      req.params.list_id
    )
    .then(numRowsAffected => {
      res.status(204).end()
    })
    .catch(next)
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

  
async function checkListExists(req, res, next) {
    try {
        console.log('middleware')
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