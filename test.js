const tape = require('tape')
const jsonist = require('jsonist')

const port = (process.env.PORT = process.env.PORT || require('get-port-sync')())
const endpoint = `http://localhost:${port}`

const server = require('./server')
const knex = require('./db')

tape('health', async function (t) {
  const url = `${endpoint}/health`
  try {
    const { data, response } = await jsonist.get(url)
    if (response.statusCode !== 200) {
      throw new Error('Error connecting to sqlite database; did you initialize it by running `npm run init-db`?')
    }
    t.ok(data.success, 'should have successful healthcheck')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('grades table', async function (t) {
  try {
    const exists = await knex.schema.hasTable('grades')
    if (!exists) throw new Error('Grades table is not available in students db')
    t.ok(exists, 'Should have grades table in students db')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('/student/:id', async function (t) {
  const userId = 1
  const url = `${endpoint}/student/${userId}`
  try {
    const { data: student, response } = await jsonist.get(url)
    if (response.statusCode !== 200 || userId !== student.id) {
      throw new Error('Error getting valid user data')
    }
    t.ok(student.id, 'Should return correct user id')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('/student/:id/grades', async function (t) {
  const userId = Math.floor(Math.random() * 100) + 1
  const url = `${endpoint}/student/${userId}/grades`
  try {
    const { data, response } = await jsonist.get(url)
    const [student, grades] = Object.keys(data)
    if (
      response.statusCode !== 200 ||
      [student, grades].some(i => typeof i === 'undefined') ||
      data.student.id !== userId
    ) {
      throw new Error('Error getting valid user data')
    }
    t.ok(data, 'Should have correct user id and grades')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('/course/all/grades', async function (t) {
  const url = `${endpoint}/course/all/grades`
  try {
    const { data, response } = await jsonist.get(url)
    const [record] = data
    const { min, max, avg, course } = record
    if (
      response.statusCode !== 200 ||
      typeof course !== 'string' ||
      [min, max, avg].some(isNaN)
    ) {
      throw new Error('Error getting valid grade stats')
    }
    t.ok(data, 'Should have correct course grade stats')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('cleanup', function (t) {
  server.closeDB()
  server.close()
  t.end()
})
