const express = require('express');

const { addStudent, addMark, fetchAllStudents, fetchStudentsMakrs, updateStudent, deleteStudent, fetchSingleStudent } = require('../controller/studentController');

const router = express.Router();

router.route("/student")
.get(fetchAllStudents)
.post(addStudent);

router.route("/student/:id")
.get(fetchSingleStudent)
.put(updateStudent)
.delete(deleteStudent)

router.post('/marks', addMark);

module.exports = router;
