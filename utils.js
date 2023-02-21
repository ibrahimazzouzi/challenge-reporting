const knex = require('./db')

module.exports = {
  getOneStudent,
  getOneStudentGradesReport,
  getAllGradesReport
}

async function getOneStudent (id) {
  return knex('students').where({ id })
    .first()
    .then(student => {
      if (!student) return null
      delete student.password_hash
      return student
    })
}

async function getOneStudentGradesReport (id) {
  return knex.select(
    'students.*',
    knex.raw(
      'GROUP_CONCAT(grades.course || ":" || grades.grade ,", ") AS course_grades'
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

// helper function to parse database report
function parseStudentGradesReport (studentData) {
  if (!studentData?.id) {
    return null
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
  return ({ student: studentData, grades })
}
