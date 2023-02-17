const fs = require('fs')
const request = require('request')
const knex = require('./db.js')

const gradesFilePath = './grades.json'

console.log('Fetching DB....')
request('https://outlier-coding-test-data.onrender.com/students.db')
  .pipe(fs.createWriteStream('students.db'))
  .on('finish', onDbFetched)

function onDbFetched () {
  console.log('db was fetched succesfully.')
  let grades = readGradesFile()
  if (grades) return populateGrades(grades)
  console.log('Fetching grades.json from source')
  request('https://outlier-coding-test-data.onrender.com/grades.json')
    .pipe(fs.createWriteStream('grades.json'))
    .on('finish', () => {
      grades = readGradesFile()
      if (grades) return populateGrades(grades)
      console.log('Could not read grades file : ', gradesFilePath)
    })
}

function readGradesFile () {
  let grades = null
  if (fs.existsSync(gradesFilePath)) {
    try {
      grades = JSON.parse(fs.readFileSync(gradesFilePath))
      return grades
    } catch (e) {
      console.log('error reading from file system or grades file is not a valid JSON file')
      knex.destroy()
    }
  }
  return null
}

const populateGrades = (grades) => {
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
