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

module.exports = wishesRouter