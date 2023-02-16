const fs = require('fs')
const request = require('request')
const knex = require('./db.js')

const gradesFilePath = './grades.json'
let grades = (
  fs.existsSync(gradesFilePath) ? require(gradesFilePath) : null
)

console.log('Fetching DB....')
request('https://outlier-coding-test-data.onrender.com/students.db')
  .pipe(fs.createWriteStream('students.db'))
  .on('finish', onDbFetched)

function onDbFetched () {
  console.log('db was fetched succesfully.')
  if (grades) return populateGrades()
  console.log('Fetching grades.json from source')
  request('https://outlier-coding-test-data.onrender.com/grades.json')
    .pipe(fs.createWriteStream('grades.json'))
    .on('finish', () => {
      grades = require(gradesFilePath)
      populateGrades()
    })
}

const populateGrades = () => {
  console.log('Adding grades table...')
  createTable('grades').then(async _ => {
    console.log('grades table added.')
    console.log('adding records...')
    let added = 0
    for (const record of grades) {
      try {
        await addRecord(record)
      } catch (e) {
        console.error('Error adding records to db : ', e)
        knex.destroy()
      }
      added += 1
    }
    console.log(
     `Added ${added} records | remote file has : ${grades.length} records
    `)
    knex.destroy()
  })
}

const createTable = tableName => (
  knex.schema.createTable(tableName, table => {
    table.increments()
    table.integer('student_id')
    table.string('course')
    table.integer('grade')
  })
)

const addRecord = student => (
  knex('grades').insert({
    student_id: student.id,
    course: student.course,
    grade: student.grade
  })
)
