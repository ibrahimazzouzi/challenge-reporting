const knex = require('./db')
const {
  getStudentById,
  getStudentGradesReportById,
  getAllGradesReport
} = require('./utils/utils.js')

module.exports = {
  getHealth,
  getStudent,
  getStudentGradesReport,
  getCourseGradesReport
}

async function getHealth (req, res, next) {
  try {
    await knex('students').first()
    res.json({ success: true })
  } catch (e) {
    console.log(e)
    res.status(500).end()
  }
}

async function getStudent (req, res, next) {
  try {
    const id = +req.params.id
    if (isNaN(id)) return next({ statusCode: 400 })
    const student = await getStudentById(id)
    if (!student) return next({ statusCode: 404 })
    res.json(student)
  } catch (err) {
    console.log(err)
    res.status(500).end()
  }
}

async function getStudentGradesReport (req, res, next) {
  try {
    const id = +req.params.id
    if (isNaN(id)) return next({ statusCode: 400 })
    const report = await getStudentGradesReportById(id)
    if (!report) return next({ statusCode: 404 })
    res.json(report)
  } catch (err) {
    console.log(err)
    res.status(500).end()
  }
}

async function getCourseGradesReport (req, res, next) {
  try {
    const report = await getAllGradesReport()
    res.json(report)
  } catch (err) {
    console.log(err)
    res.status(500).end()
  }
}
