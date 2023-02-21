const tape = require('tape')
const jsonist = require('jsonist')
const knex = require('./db')

const port = (process.env.PORT = process.env.PORT || require('get-port-sync')())
const endpoint = `http://localhost:${port}`
const server = require('./server')

const {
  getOneStudent,
  getOneStudentGradesReport
} = require('./utils.js')

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

tape('DB - grades table', async function (t) {
  try {
    const exists = await knex.schema.hasTable('grades')
    if (!exists) throw new Error('Grades table is not available in students db')
    t.ok(exists, 'DB - Should have grades table in students db')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('API - /student/:id - student exists', async function (t) {
  const studentId = 80 // this student exist in the db
  const url = `${endpoint}/student/${studentId}`
  try {
    const { data: student, response } = await jsonist.get(url)
    if (response.statusCode !== 200 || studentId !== student.id) {
      throw new Error('Error getting valid student data')
    }
    t.ok(student.id, 'API - Should return correct student data/id')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('Unit - getOneStudent', async function (t) {
  const studentId = 1 // this student exists
  try {
    const student = await getOneStudent(studentId)
    if (!student || student.id !== studentId) {
      throw new Error('Error getting valid student data')
    }
    t.ok(student.id, 'API - Should return correct student data/id')
    t.end()
  } catch (err) {
    t.error(err)
  }
})

tape('API - /student/:id - student does not exist', async function (t) {
  const studentId = 0 // this student id is not valid
  const url = `${endpoint}/student/${studentId}`
  try {
    const { response } = await jsonist.get(url)
    if (response.statusCode !== 404) {
      throw new Error('Error getting valid student data')
    }
    t.ok(response.statusCode, 'API - Should return 404 not found')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('Unit - getOneStudent - student does not exist', async function (t) {
  const studentId = 0 // this student id is not valid
  try {
    const student = await getOneStudent(studentId)
    if (student !== null) {
      throw new Error('Error getting null back')
    }
    t.ok({ student }, 'API - Should return null')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('API - /student/:id/grades', async function (t) {
  const studentId = 11 // this student has grades
  const url = `${endpoint}/student/${studentId}/grades`
  try {
    const { data: { grades, student }, response } = await jsonist.get(url)
    if (
      response.statusCode !== 200 ||
      [student, grades].some(i => typeof i !== 'object') ||
      student.id !== studentId
    ) {
      throw new Error('Error getting valid student data')
    }
    t.ok({ student, grades }, 'API - Should have correct student id and grades')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('Unit - getOneStudentGradesReport', async function (t) {
  const studentId = 11 // this student has grades
  try {
    const { student, grades } = await getOneStudentGradesReport(studentId)
    if (
      [student, grades].some(i => typeof i !== 'object') ||
      student.id !== studentId
    ) {
      throw new Error('Error getting valid student data')
    }
    t.ok({ student, grades }, 'Unit - Should return correct student id and grades')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('API - /student/:id/grades', async function (t) {
  const studentId = 9 // this student has no grades
  const url = `${endpoint}/student/${studentId}/grades`
  try {
    const { response } = await jsonist.get(url)
    if (response.statusCode !== 404) {
      throw new Error('Error getting a valid response code')
    }
    t.ok(response.statusCode, 'API - Should return 404')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('Unit - getOneStudentGradesReport', async function (t) {
  const studentId = 9 // this student has no grades
  try {
    const data = await getOneStudentGradesReport(studentId)
    if (data !== null) {
      throw new Error('Error getting valid student data')
    }
    t.ok({ data }, 'Unit - Should return null')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('API - /course/all/grades', async function (t) {
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
    t.ok(data, 'API - Should have correct course grade stats format')
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
