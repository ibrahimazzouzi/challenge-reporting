const fs = require('fs')
const request = require('request')
const knex = require('./db.js')

const gradesFilePath = './grades.json'
const dbFilePath = './students.db';

(async function () {
  console.log('Fetching DB....')
  request('https://outlier-coding-test-data.onrender.com/students.db')
    .pipe(fs.createWriteStream(dbFilePath))
    .on('error', e => handleError(e, 'Error saving db file'))
    .on('finish', fetchGrades)
}())

function fetchGrades () {
  console.log('Fetching grades...')
  request('https://outlier-coding-test-data.onrender.com/grades.json')
    .pipe(fs.createWriteStream(gradesFilePath))
    .on('error', e => handleError(e, 'Error saving grades.json'))
    .on('finish', addGrades)
}

async function addGrades () {
  console.log('Adding grades table...')
  try {
    await createTable('grades')
    const grades = JSON.parse(fs.readFileSync(gradesFilePath, 'utf8'))
    const chunks = []
    const chunkSize = 500
    for (let i = 0; i < grades.length; i += chunkSize) {
      chunks.push(grades.slice(i, i + chunkSize))
    }
    await addRecords(chunks, chunkSize)
    console.log('finished adding grades table')
    knex.destroy()
  } catch (e) {
    handleError(e, 'error adding grades data to db')
  }
}

function createTable (tableName) {
  return knex.schema.createTable(tableName, table => {
    table.increments()
    table.integer('student_id')
    table.string('course')
    table.integer('grade')
  })
}

async function addRecords (chunks, chunkSize) {
  for (let chunk of chunks) {
    chunk = chunk.map(gradeRecord => ({
      student_id: gradeRecord.id,
      course: gradeRecord.course,
      grade: gradeRecord.grade
    }))
    await knex.batchInsert('grades', chunk, chunkSize)
  }
}

function handleError (error, errorStr) {
  console.log('error message : ', errorStr)
  console.log(error)
  knex.destroy()
}
