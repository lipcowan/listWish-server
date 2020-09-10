const express = require('express');
const path = require('path');
const WishesService = require('./wishes-service');
const { requireAuth } = require('../middleware/jwt-auth');

const wishesRouter = express.Router()
const jsonBodyParser = express.json()

wishesRouter
  .route('/')
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
      const { list_id, wish_title, wish_url } = req.body
      const newWish = {list_id, wish_title, wish_url}

      for(const [key, value] of Object.entries(newWish))
        if (value == null)
          return res.status(400).json({
              error: `Missing '${key}' in request body`
          })

      newWish.user_id = req.user.id

      WishesService.insertWish(
        req.app.get('db'),
        newWish
      )
        .then(wish => {
            res
              .status(201)
              .location(path.posix.join(req.originalUrl, `/${wish.id}`))
              .json(WishesService.serializeWish(wish))
        })
        .catch(next)
  })

wishesRouter
  .route('/:wish_id')
  .all((req,res, next) => {
    WishesService.getById(
      req.app.get('db'),
      req.params.wish_id
    )
      .then(wish => {
        if (!wish) {
          return res.status(404).json({
            error: { message: `Wish doesn't exist`}
          })
        }
        res.wish = wish
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(WishesService.serializeWish(res.wish))
  })
  .delete((req, res, next) => {
    WishesService.deleteWish(
      req.app.get('db'),
      req.params.wish_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(requireAuth, jsonBodyParser, (req, res, next) => {
    const { list_id, wish_title, wish_url } = req.body
    const wishToUpdate = { list_id, wish_title, wish_url}

    const numberOfValues = Object.values(wishToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: { message: `Request body must contain eith 'title' or 'url'`}
      })

    WishesService.updateWish(
      req.app.get('db'),
      req.params.wish_id,
      wishToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = wishesRouter