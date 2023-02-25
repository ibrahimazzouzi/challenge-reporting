const knex = require('./db')

module.exports = {
  getStudentById,
  getStudentGradesReportById,
  getAllGradesReport
}

async function getStudentById (id) {
  return knex('students').where({ id })
    .first()
    .then(student => {
      if (!student) return null
      delete student.password_hash
      return student
    })
}

async function getStudentGradesReportById (id) {
  return knex.select(
    'students.*',
    knex.raw(
      'GROUP_CONCAT(grades.course || ":"' +
      ' || grades.grade ,", ") AS course_grades'
    ))
    .from('students')
    .innerJoin('grades', 'students.id', '=', 'grades.student_id')
    .where('students.id', '=', id).first()
    .then(parseStudentGradesReport)
}

async function getAllGradesReport () {
  return knex('grades')
    .select('course')
    .max('grade', { as: 'max' })
    .min('grade', { as: 'min' })
    .avg('grade', { as: 'avg' })
    .groupBy('course')
    .then(stats => stats)
}

function parseStudentGradesReport ({
  password_hash: passwordHash,
  course_grades: courseGrades,
  ...studentInfo
}) {
  if (!studentInfo?.id) return null
  if (!courseGrades.length) return ({ student: studentInfo, grades: [] })
  const grades = courseGrades.split(',')
    .reduce(buildStudentGradesCallback, [])
  return ({ student: studentInfo, grades })
}

function buildStudentGradesCallback (accumulator, courseString) {
  if (!courseString) return accumulator
  courseString = courseString.trim()
  const [course, grade] = courseString.split(':')
  accumulator.push({ course, grade: Number(grade) })
  return accumulator
}
