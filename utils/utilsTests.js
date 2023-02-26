const {
  nonExistentId,
  studentWithoutGradesId,
  validStudentInfo,
  expectedReport,
  expectedAllGradesReportProps,
  expectedCourseStats
} = require('./testConstants.js')
const {
  getStudentById,
  getStudentGradesReportById,
  getAllGradesReport,
  parseStudentGradesReport
} = require('./utils.js')

module.exports = {
  getStudentByIdUtilTest,
  getStudentGradesReportByIdUtilTest,
  getAllGradesReportUtilTest,
  parseStudentGradesReportUtilTest
}

async function getStudentByIdUtilTest (t) {
  try {
    let student = await getStudentById(nonExistentId)
    t.equal(student, null, 'should return null for non existent student ids')
    student = await getStudentById(validStudentInfo.id)
    t.equal(typeof student, 'object', 'should return an object type')
    t.deepEquals(
      student,
      validStudentInfo, 'should return the correct student info'
    )
    t.notOk(student.password_hash, 'should remove the password hash field')
  } catch (e) {
    t.error(e)
  }
}

async function getStudentGradesReportByIdUtilTest (t) {
  try {
    const nullReport =
      await getStudentGradesReportById(studentWithoutGradesId)
    t.equal(
      nullReport,
      null,
      'should return null when the student has no grades'
    )
    const actualReport = await getStudentGradesReportById(expectedReport.id)
    t.equal(typeof actualReport, 'object', 'should return an object type')
    t.equal(
      Array.isArray(actualReport.course_grades),
      true,
      'should return an array type for course_grades key'
    )
    t.deepEqual(
      actualReport,
      expectedReport,
      'should return the correct student grades report'
    )
  } catch (e) {
    t.error(e)
  }
}

async function parseStudentGradesReportUtilTest (t) {
  let courseGradesString = ''
  let expectedGrades = []
  let actualGrades = parseStudentGradesReport(courseGradesString)
  t.deepEqual(
    actualGrades,
    expectedGrades,
    'should return an empty grades array'
  )
  courseGradesString = ' Math : 90 , Science : 85, English : 80 '
  expectedGrades = [
    { course: 'Math', grade: 90 },
    { course: 'Science', grade: 85 },
    { course: 'English', grade: 80 }
  ]
  actualGrades = parseStudentGradesReport(courseGradesString)
  t.deepEqual(
    actualGrades,
    expectedGrades,
    'should handle extra spaces in course string'
  )
  courseGradesString = 'Math:, Science: 85, English:'
  expectedGrades = [
    { course: 'Math', grade: null },
    { course: 'Science', grade: 85 },
    { course: 'English', grade: null }
  ]
  actualGrades = parseStudentGradesReport(courseGradesString)
  t.deepEqual(
    actualGrades,
    expectedGrades,
    'should handle courses with missing grades'
  )
  courseGradesString = 'Math:22, : 85, : 44'
  expectedGrades = [
    { course: 'Math', grade: 22 }
  ]
  actualGrades = parseStudentGradesReport(courseGradesString)
  t.deepEqual(
    actualGrades,
    expectedGrades,
    'should handle courses with missing course names'
  )
}

async function getAllGradesReportUtilTest (t) {
  try {
    const allGradesReportResult = await getAllGradesReport()
    t.ok(Array.isArray(allGradesReportResult), 'result should be an array')
    t.ok(
      allGradesReportResult.every(obj => typeof obj === 'object'),
      'every element should be an object'
    )
    t.ok(
      allGradesReportResult.every(obj => (
        expectedAllGradesReportProps.every(prop => prop in obj)
      )),
      'every object should have the expected properties'
    )
    const uniqueCourses = [
      ...new Set(allGradesReportResult.map(obj => obj.course))
    ]
    t.equal(
      allGradesReportResult.length,
      uniqueCourses.length,
      'should group results by course'
    )
    allGradesReportResult.forEach(obj => {
      const course = obj.course
      t.equal(
        obj.max,
        expectedCourseStats[course].max,
        `max value for ${course} is correct`
      )
      t.equal(
        obj.min,
        expectedCourseStats[course].min,
        `min value for ${course} is correct`
      )
      t.equal(
        obj.avg,
        expectedCourseStats[course].avg,
        `avg value for ${course} is correct`
      )
    })
  } catch (e) {
    t.error(e)
  }
}
