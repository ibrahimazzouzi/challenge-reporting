const knex = require('./db')

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
  const id = +req.params.id
  knex('students').where({ id })
    .first()
    .then(student => {
      if (!student) return next({ statusCode: 404 })
      delete student.password_hash
      res.json(student)
    })
    .catch(e => {
      console.log(e)
      res.status(500).end()
    })
}

async function getStudentGradesReport (req, res, next) {
  const id = +req.params.id
  Promise.all([
    knex('students').where({ id }).first(),
    knex('grades').where({ student_id: id })
  ]).then(([student, grades]) => {
    if (!student || !grades) return next({ statusCode: 404 })
    delete student.password_hash
    res.json({
      student,
      grades
    })
  }).catch(e => {
    console.log(e)
    res.status(500).end()
  })
}

async function getCourseGradesReport (req, res, next) {
  knex('grades')
    .select('course')
    .max('grade', { as: 'max' })
    .min('grade', { as: 'min' })
    .avg('grade', { as: 'avg' })
    .groupBy('course')
    .then(stats => res.json(stats))
    .catch(e => {
      console.log(e)
      res.status(500).end()
    })
}
