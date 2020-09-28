const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const { expect } = require('chai')
const supertest = require('supertest')

describe('Wishes Endpoints', function() {
  let db

  const {
    testLists,
    testUsers,
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

  describe(`POST /api/wishes`, () => {
    beforeEach('insert lists', () =>
      helpers.seedListsTable(
        db,
        testUsers,
        testLists,
      )
    )

    it(`creates an wish, responding with 201 and the new wish`, () => {
      this.retries(3)
      const testList = testLists[0]
      const testUser = testUsers[0]
      const newWish = {
        title: 'Test new wish',
        url: 'Test wishURL',
        list_id: testList.id,
      }
      return supertest(app)
        .post('/api/wishes')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newWish)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.wish_title).to.eql(newWish.title)
          expect(res.body.wish_url).to.eql(newWish.url)
          expect(res.body.list_id).to.eql(newWish.list_id)
          expect(res.body.user.id).to.eql(testUser.id)
          expect(res.headers.location).to.eql(`/api/wishes/${res.body.id}`)
          const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
          const actualDate = new Date(res.body.date_added).toLocaleString()
          expect(actualDate).to.eql(expectedDate)
        })
        .expect(res =>
          db
            .from('listwish_wishes')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.wish_title).to.eql(newWish.title)
              expect(row.wish_url).to.eql(newWish.url)
              expect(row.list_id).to.eql(newWish.list_id)
              expect(row.user_id).to.eql(testUser.id)
              const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
              const actualDate = new Date(row.date_added).toLocaleString()
              expect(actualDate).to.eql(expectedDate)
            })
        )
    })

    const requiredFields = ['wish_title', 'list_id']

    requiredFields.forEach(field => {
      const testList = testLists[0]
      const testUser = testUsers[0]
      const newWish = {
        wish_title: 'Test new wish',
        list_id: testList.id,
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newWish[field]

        return supertest(app)
          .post('/api/wishes')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newWish)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          })
      })
    })
  })

  describe(`PATCH /api/wishes/:wish_id`, () => {
    const testList = testLists[0]
    const testUser = testUsers[0]
    const updatedTitle = { 
      wish_title: 'Testing update',
      list_id: testList.id
    }
    
    it(`responds 204`, () => {

      return supertest(app)
        .patch('/api/wishes/1')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(updatedTitle)
        .expect(204)
    })
  })

  describe(`DELETE /api/wishes/:wish_id`, () => {
    const testUser = testUsers[0]
    const testWish = testWishes[0]
    
    it(`responds 204`, () => {

      return supertest(app)
        .delete(`/api/wishes/${testWish.id}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(`${testWish.id}`)
        .expect(204)
    })
  })

})
