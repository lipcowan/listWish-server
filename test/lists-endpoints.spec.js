const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Lists Endpoints', () => {
  let db

  const {
    testUsers,
    testLists,
    testWishes,
  } = helpers.makeListsFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`GET /api/lists`, () => {
    context(`Given no lists`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/lists')
          .expect(200, [])
      })
    })

    context('Given there are lists in the database', () => {
      beforeEach('insert lists', () =>
        helpers.seedListsTable(
          db,
          testUsers,
          testLists,
          testWishes,
        )
      )

      it('responds with 200 and all of the lists', () => {
        const expectedLists = testLists.map(list =>
          helpers.makeExpectedList(
            testUsers,
            list,
          )
        )
        return supertest(app)
          .get('/api/lists')
          .expect(200, expectedLists)
      })
    })
  })


  describe(`GET /api/lists/:list_id`, () => {
    context(`Given no lists`, () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers)
      )

      it(`responds with 404`, () => {
        const listId = 123456
        return supertest(app)
          .get(`/api/lists/${listId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `List doesn't exist` })
      })
    })

    context('Given there are lists in the database', () => {
      beforeEach('insert lists', () =>
        helpers.seedListsTable(
          db,
          testUsers,
          testLists,
          testWishes,
        )
      )

      it('responds with 200 and the specified list', () => {
        const listId = 2
        const expectedList = helpers.makeExpectedList(
          testUsers,
          testLists[listId - 1],
          testWishes,
        )

        return supertest(app)
          .get(`/api/lists/${listId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedList)
      })
    })
  })

  describe(`GET /api/lists/:list_id/wishes`, () => {
    context(`Given no lists`, () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers)
      )

      it(`responds with 404`, () => {
        const listId = 123456
        return supertest(app)
          .get(`/api/lists/${listId}/wishes`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `list doesn't exist` })
      })
    })

    context('Given there are wishes for list in the database', () => {
      beforeEach('insert lists', () =>
        helpers.seedListsTable(
          db,
          testUsers,
          testLists,
          testWishes,
        )
      )

      it('responds with 200 and the specified wishes', () => {
        const listId = 1
        const expectedWishes = helpers.makeExpectedListWishes(
          testUsers, listId, testWishes
        )

        return supertest(app)
          .get(`/api/lists/${listId}/wishes`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedWishes)
      })
    })
  })

  describe(`DELETE /api/lists/:list_id`, () => {

    it(`responds 204`, () => {
      const listId = 1

      return supertest(app)
        .delete(`/api/lists/${listId}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(listId)
        .expect(204)
    })
  })

})