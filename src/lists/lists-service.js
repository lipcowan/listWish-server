const xss = require('xss')
const Treeize = require('treeize')

const ListsService = {
    getAllLists(db) {
        return db
            .from('listwish_lists AS lists')
            .select(
                lists.id,
                lists.list_title,
                lists.list_description,
                lists.date_created,
                ...userFields,
                db.raw(
                    `count(DISTINCT wsh) AS number_of_wishes`
                ),
            )
            .leftJoin(
                'listwish_wishes AS wsh',
                'lists.id',
                'wsh.list_id',
            )
            .leftJoin(
                'listwish_users AS usr',
                'lists.user_id',
                'usr.id',
            )
            .groupBy('usr.id', 'lists.id')
    },

    getById(db, id) {
        return ListsService.getAllLists(db)
            .where('lists.id', id)
            .first()
    },

    getByUser(db, user_name) {
        return ListsService.getAllLists(db)
            .where('usr.user_name', user_name)
            .first()
    },

    getWishesForList(db, list_id) {
        return db
          .from('listwish_wishes AS wsh')
          .select(
              'wsh.id',
              'wsh.wish_title',
              'wsh.wish_url',
              'wsh.purchased',
              'wsh.date_added',
              ...userFields,
          )
          .where('wsh.list_id', list_id)
          .join(
              'listwish_lists AS lists',
              'wsh.list_id',
              'lists.id',
          )
          .join(
              'listwish_users AS usr',
              'lists.user_id',
              'usr.id',
          )
          .groupBy('wsh.id', 'usr.id')
    },

    insertList(db, newList) {
        return db
          .insert(newList)
          .into('listwish_lists')
          .returning('*')
          .then(([list]) => list)
          .then(list => 
            ListsService.getById(db, list.id)
          )
    },

    serializeLists(lists) {
        return lists.map(this.serializeList)
    },

    serializeList(list) {
        const listTree = new Treeize()
        const listData = listTree.grow([ list ]).getData()[0]

        return{
            id: listData.id,
            list_title: xss(listData.list_title),
            list_description: xss(listData.list_description),
            date_created: listData.date_created,
            user_id: listData.user_id,
        }
    },

    serializeListWishes(wishes) {
        return wishes.map(this.serializeListWish)
    },

    serializeListWish(wish) {
        const wishTree = new Treeize()
        const wishData = wishTree.grow([ wish ]).getData()[0]

        return {
            id: wishData.id,
            wish_title: wishData.wish_title,
            wish_url: wishData.wish_url || {},
            purchased: wishData.purchased,
            date_added: wishData.date_added,
            list_id: wishData.list_id,
        }
    },
}

const userFields = [
    'usr.id AS user:id',
    'usr.signup_date AS user:signup_date',
    'usr.preferred_name AS user:preferred_name',
    'usr.user_name AS user:user_name'
]

module.exports = ListsService