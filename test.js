const tape = require('tape')
const jsonist = require('jsonist')
const knex = require('./db')
const {
  getStudentByIdUtilTest,
  getStudentGradesReportByIdUtilTest,
  getAllGradesReportUtilTest,
  parseStudentGradesReportUtilTest
} = require('./utils/utilsTests.js')

const port = (process.env.PORT = process.env.PORT || require('get-port-sync')())
const endpoint = `http://localhost:${port}`
const server = require('./server')

tape('DB : grades table', async function (t) {
  try {
    const exists = await knex.schema.hasTable('grades')
    if (!exists) throw new Error('Grades table is not available in students db')
    t.ok(exists, 'Should have grades table in students db')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('Util : getStudentById', getStudentByIdUtilTest)
tape('Util : getStudentGradesReportById', getStudentGradesReportByIdUtilTest)
tape('Util : parseStudentGradesReport', parseStudentGradesReportUtilTest)
tape('Util : getAllGradesReport', getAllGradesReportUtilTest)

tape('API : health', async function (t) {
  const url = `${endpoint}/health`
  try {
    const { data, response } = await jsonist.get(url)
    if (response.statusCode !== 200) {
      throw new Error(
        'Error connecting to sqlite database;' +
        'did you initialize it by running `npm run init-db`?'
      )
    }
    t.ok(data.success, 'should have successful healthcheck')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('API : /student/:id should return student by id', (t) => {
  const ExpectedStudentId = 1
  const url = `${endpoint}/student/${ExpectedStudentId}`
  jsonist.get(url, (err, student, res) => {
    if (err) return t.fail(err)
    t.equal(res.statusCode, 200, 'should return status code 200')
    t.equal(
      student.id,
      ExpectedStudentId,
      `should return student with id ${ExpectedStudentId}`
    )
    t.end()
  })
})

tape('API : /student/:id should return 404 if student not found', (t) => {
  const studentId = 0
  const url = `${endpoint}/student/${studentId}`
  jsonist.get(url, (err, student, res) => {
    if (err) return t.fail(err)
    t.equal(res.statusCode, 404, 'should return status code 404')
    t.end()
  })
})

tape(
  'API : /student/:id should return 400 if the student id is not a number',
  (t) => {
    const studentId = '{invalid}'
    const url = `${endpoint}/student/${studentId}`
    jsonist.get(url, (err, student, res) => {
      if (err) return t.fail(err)
      t.equal(res.statusCode, 400, 'should return status code 400')
      t.end()
    })
  })

tape('API : /student/:id/grades should return grades report by id', (t) => {
  const expectedStudentId = 1
  const url = `${endpoint}/student/${expectedStudentId}/grades`
  jsonist.get(url, (err, report, res) => {
    if (err) return t.fail(err)
    t.equal(res.statusCode, 200, 'should return status code 200')
    t.equal(
      report.id,
      expectedStudentId,
      `should return report for student with id ${expectedStudentId}`
    )
    t.ok(
      Array.isArray(report.course_grades),
      'should return report with grades array'
    )
    t.end()
  })
})

tape('API : /student/:id/grades should return 404 if report not found', (t) => {
  const expectedStudentId = 0
  const url = `${endpoint}/student/${expectedStudentId}/grades`
  jsonist.get(url, (err, report, res) => {
    if (err) return t.fail(err)
    t.equal(
      res.statusCode,
      404,
      `should return status code 404 for student with id ${expectedStudentId}`
    )
    t.end()
  })
})

tape(
  'API : ' +
  '/student/:id/grades should return 400 if the student id is not a number',
  (t) => {
    const studentId = '{invalid}'
    const url = `${endpoint}/student/${studentId}/grades`
    jsonist.get(url, (err, report, res) => {
      if (err) return t.fail(err)
      t.equal(res.statusCode, 400, 'should return status code 400')
      t.end()
    })
  })

tape('API : /course/all/grades should return all grades report', (t) => {
  const url = `${endpoint}/course/all/grades`
  jsonist.get(url, (err, report, res) => {
    if (err) return t.fail(err)
    t.equal(res.statusCode, 200, 'should return status code 200')
    t.ok(Array.isArray(report), 'should return the report as an array')
    t.end()
  })
})

tape('cleanup', function (t) {
  server.closeDB()
  server.close()
  t.end()
})
