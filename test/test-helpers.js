const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
    return [
        {
            id: 1,
            preferred_name: 'test-user-1',
            user_name: 'Test user 1',
            password: 'password',
            signup_date: new Date('2029-01-22T16:28:32.615Z'),
        },
        {
            id: 2,
            preferred_name: 'test-user-2',
            user_name: 'Test user 2',
            password: 'password',
            signup_date: new Date('2029-01-22T16:28:32.615Z'),
        },
        {
            id: 3,
            preferred_name: 'test-user-3',
            user_name: 'Test user 3',
            password: 'password',
            signup_date: new Date('2029-01-22T16:28:32.615Z'),
        },
        {
            id: 4,
            preferred_name: 'test-user-4',
            user_name: 'Test user 4',
            password: 'password',
            signup_date: new Date('2029-01-22T16:28:32.615Z'),
        },

    ]
}

function makeListsArray(users) {
   return [
        {
            id: 1,
            list_title: 'Test-List-1',
            list_description: 'List of items for test list 1',
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[0].id,
        },
        {
            id: 2,
            list_title: 'Test-List-2',
            list_description: 'List of items for test list 2',
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[1].id,
        },
        {
            id: 3,
            list_title: 'Test-List-3',
            list_description: 'List of items for test list 3',
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[2].id,
        },
        {
            id: 4,
            list_title: 'Test-List-4',
            list_description: 'List of items for test list 4',
            date_created: new Date('2029-01-22T16:28:32.615Z'),
            user_id: users[3].id,
        },
   ]
}

function makeWishesArray(users, lists) {
    return [
        {
            id: 1,
            wish_title: 'Test-Wish-1',
            wish_url: 'TestWishURL.com',
            purchased: false,
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            list_id: lists[0].id,
            user_id: users[0].id,
        },
        {
            id: 2,
            wish_title: 'Test-Wish-2',
            wish_url: 'TestWishURL.com',
            purchased: false,
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            list_id: lists[1].id,
            user_id: users[1].id,
        },
        {
            id: 3,
            wish_title: 'Test-Wish-3',
            wish_url: 'TestWishURL.com',
            purchased: false,
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            list_id: lists[2].id,
            user_id: users[2].id,
        },
        {
            id: 4,
            wish_title: 'Test-Wish-4',
            wish_url: 'TestWishURL.com',
            purchased: false,
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            list_id: lists[3].id,
            user_id: users[3].id,
        },
        {
            id: 5,
            wish_title: 'Test-Wish-5',
            wish_url: 'TestWishURL.com',
            purchased: false,
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            list_id: lists[1].id,
            user_id: users[1].id,
        },
        {
            id: 6,
            wish_title: 'Test-Wish-6',
            wish_url: 'TestWishURL.com',
            purchased: false,
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            list_id: lists[3].id,
            user_id: users[3].id,
        },
    ]
}

function makeListsFixtures() {
    const testUsers = makeUsersArray()
    const testLists = makeListsArray(testUsers)
    const testWishes = makeWishesArray(testUsers, testLists)
    return { testUsers, testLists, testWishes}
}

function cleanTables(db) {
    return db.transaction(trx => 
        trx.raw(
            `TRUNCATE
              listwish_lists,
              listwish_users,
              list_wishes
            `
        )
        .then(() => 
          Promise.all([
            trx.raw(`ALTER SEQUENCE listwish_lists_id_seq minvalue 0 START WITH 1`),
            trx.raw(`ALTER SEQUENCE listwish_users_id_seq minvalue 0 START WITH 1`),
            trx.raw(`ALTER SEQUENCE listwish_wishes_id_seq minvalue 0 START WITH 1`),
            trx.raw(`SELECT setval('listwish_lists_id_seq', 0)`),
            trx.raw(`SELECT setval('listwish_users_id_seq', 0)`),
            trx.raw(`SELECT setval('listwish_wishes_id_seq', 0)`),
          ])
        )
    )
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('listwish_users').insert(preppedUsers)
      .then(() => 
        db.raw(
            `SELECT setval('listwish_users_id_seq', ?)`,
            [users[users.length - 1].id],
        )
      )
}

function seedListsTable(db, users, lists, wishes=[]) {
    return db.transaction(async trx => {
        await seedUsers(trx, users)
        await trx.into('listwish_lists').insert(lists)
        await trx.raw(
            `SELECT setval('listwish_lists_id_seq', ?)`,
            [lists[lists.length - 1].id],
        )
        if (wishes.length) {
            await trx.into('listwish_wishes').insert(wishes)
            await trx.raw(
                `SELECT setval('listwish_wishes_id_seq', ?)`,
                [wishes[wishes.length - 1].id],
            )
        }
    })
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({user_id: user.id}, secret, {
        subject: user.user_name,
        algorithm: 'HS256',
    })
    return `Bearer ${token}`
}

module.exports = {
    makeUsersArray,
    makeListsArray,
    makeWishesArray,

    makeListsFixtures,
    cleanTables,
    seedUsers,
    seedListsTable,
    makeAuthHeader,
}

