const knex = require('../db')

module.exports = {
  getStudentById,
  getStudentGradesReportById,
  getAllGradesReport,
  parseStudentGradesReport
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
    .then(studentWithgradesReport => {
      if (!studentWithgradesReport?.id) return null
      delete studentWithgradesReport.password_hash
      studentWithgradesReport.course_grades =
        parseStudentGradesReport(studentWithgradesReport.course_grades)
      return studentWithgradesReport
    })
}

function parseStudentGradesReport (courseGrades) {
  if (!courseGrades || !courseGrades.length) return []
  courseGrades = courseGrades.trim()
  const grades = courseGrades.split(',')
    .reduce(function (accumulator, courseString) {
      courseString = courseString.trim()
      if (!courseString || !courseString.length) return accumulator
      let [course, grade] = courseString.split(':')
      course = course.trim().length ? course.trim() : null
      if (!course) return accumulator
      grade = grade.length ? Number(grade) : null
      accumulator.push({
        course: course,
        grade: isNaN(grade) ? null : grade
      })
      return accumulator
    }, [])
  return grades
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
