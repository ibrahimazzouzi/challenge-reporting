module.exports = {
  nonExistentId: -1,
  studentWithoutGradesId: 9,
  validStudentInfo: {
    id: 1,
    first_name: 'Scotty',
    last_name: 'Quigley',
    email: 'Scotty79@hotmail.com',
    is_registered: 1,
    is_approved: 1,
    address: '241 Denesik Knolls Apt. 955',
    city: 'Buffalo',
    state: 'ME',
    zip: '04710',
    phone: '1-503-560-6954',
    created: '1628767983203.0',
    last_login: '1628770445749.0',
    ip_address: '2.137.18.155'
  },
  expectedReport: {
    id: 1,
    first_name: 'Scotty',
    last_name: 'Quigley',
    email: 'Scotty79@hotmail.com',
    is_registered: 1,
    is_approved: 1,
    address: '241 Denesik Knolls Apt. 955',
    city: 'Buffalo',
    state: 'ME',
    zip: '04710',
    phone: '1-503-560-6954',
    created: '1628767983203.0',
    last_login: '1628770445749.0',
    ip_address: '2.137.18.155',
    course_grades: [
      { course: 'Calculus', grade: 50 },
      { course: 'Microeconomics', grade: 43 },
      { course: 'Statistics', grade: 50 },
      { course: 'Astronomy', grade: 63 }
    ]
  },
  expectedAllGradesReportProps: ['course', 'max', 'min', 'avg'],
  expectedCourseStats: {
    Astronomy: { max: 100, min: 0, avg: 50.03889013536759 },
    Calculus: { max: 100, min: 0, avg: 50.09270747689165 },
    Microeconomics: { max: 100, min: 0, avg: 49.81138092966023 },
    Philosophy: { max: 100, min: 0, avg: 50.01606355689488 },
    Statistics: { max: 100, min: 0, avg: 50.017376820961566 }
  }
}
