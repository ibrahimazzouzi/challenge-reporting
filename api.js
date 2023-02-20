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
  knex.select(
    'students.*',
    knex.raw(
      'GROUP_CONCAT(grades.course || ":" || grades.grade ,", ") AS course_grades'
    )
  ).from('students')
    .innerJoin('grades', 'students.id', '=', 'grades.student_id')
    .where('students.id', '=', id).first()
    .then(studentData => {
      if (!studentData?.id) {
        return next({ statusCode: 404 })
      }
      let grades = []
      if (studentData?.course_grades?.length) {
        studentData.course_grades = studentData.course_grades.split(',')
        grades = studentData.course_grades.map(courseString => {
          if (courseString.length) {
            courseString = courseString.trim()
            const parts = courseString.split(':')
            return ({ course: parts[0], grade: Number(parts[1]) })
          }
          return null
        })
      }
      delete studentData.password_hash
      delete studentData.course_grades
      res.json({ student: studentData, grades })
    }).catch(err => {
      console.log(err)
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
