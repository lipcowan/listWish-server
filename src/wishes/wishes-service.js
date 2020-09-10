const xss = require('xss')

const WishesService = {
    getById(db, id) {
        return db
          .from('listwish_wishes AS wsh')
          .select(
            'wsh.id',
            'wsh.wish_title',
            'wsh.wish_url',
            'wsh.purchased',
            'wsh.date_added',
            'wsh.list_id'
          )
          .where('wsh.id', id)
          .first()
    },

    insertWish(db, newWish) {
        return db
          .insert(newWish)
          .into('listwish_wishes')
          .returning('*')
          .then(([wish]) => wish)
          .then(wish => 
            WishesService.getById(db, wish.id)
          )
    },

    deleteWish(db, id) {
      return db('listwish_wishes')
        .where({id})
        .delete()

    },

    updateWish(db, id, newWishFields) {
      return db('listwish_wishes')
        .where({id})
        .update(newWishFields)
    },

    serializeWish(wish) {
        return {
            id: wish.id,
            wish_title: xss(wish.wish_title),
            wish_url: wish.wish_url || null,
            purchased: wish.purchased,
            date_added: wish.date_added,
            list_id: wish.list_id,
        }
    }
}

module.exports = WishesService