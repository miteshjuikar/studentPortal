const Student= require('../models/student');
const Mark= require('../models/mark');
const Subject = require('../models/subject');
const Marks = require('../models/mark');

const addStudent = async (req, res) => {
    try {
      const { name, email, age, parent_id } = req.body;
  
      if (!name || !email || age === undefined) {
        return res.status(400).json({ message: "Member name, email, and age are required." });
      }

      if (email && !/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
      }

      const existingStudent = await Student.findOne({
        where: { email: email },
      });
  
      if (existingStudent) {
        return res.status(400).json({ message: "A student with this email already exists." });
      }
  
      const newStudent = await Student.create({
        name,
        email,
        age,
        parent_id: parent_id || null,
      });
  
      return res.status(201).json({
        message: "Student added successfully",
        student: newStudent,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error. Please try again later." });
    }
};

const addMark = async (req, res) => {
  const { studentId, marksList } = req.body;

  if (!studentId || !marksList || !Array.isArray(marksList) || marksList.length === 0) {
    return res.status(400).json({ message: 'Invalid input. studentId and marksList are required.' });
  }

  for (const item of marksList) {
    if (!item.subjectId || typeof item.marks !== 'number' || item.marks < 0) {
      return res.status(400).json({ message: 'Each entry in marksList must contain valid subjectId and marks.' });
    }
  }

  try {
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const subjectIds = marksList.map(item => item.subjectId);

    const subjects = await Subject.findAll({
      where: { id: subjectIds },
    });

    // Ensure that all subjects exist
    if (subjects.length !== subjectIds.length) {
      return res.status(404).json({ message: 'One or more subjects not found' });
    }

    //entry in marksList to check for existing marks and update or create new
    for (const item of marksList) {
      // Check for already exists
      const existingMark = await Marks.findOne({
        where: {
          student_id: studentId,
          subject_id: item.subjectId,
        },
      });

      if (existingMark) {
        // If a record exists
        existingMark.marks = item.marks;
        existingMark.date = new Date();
        await existingMark.save();
        return res.status(201).json({ message: 'Marks updated successfully for all subjects.' });


      } else {
        // If no record exists
        await Marks.create({
          student_id: studentId,
          subject_id: item.subjectId,
          marks: item.marks,
          date: new Date(),
        });
        return res.status(201).json({ message: 'Marks added successfully for all subjects.' });
    }
    }

  } catch (error) {
    console.error('Error adding marks:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
  
const fetchAllStudents =  async (req, res) => {
    try {
      const students = await Student.findAll();
  
      if (!students || students.length === 0) {
        return res.status(404).json({ message: 'No students found' });
      }
  
      return res.status(200).json({
        message: 'Students fetched successfully',
        data: students,
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      return res.status(500).json({
        message: 'Internal server error',
        error: error.message,
      });
    }
}

const fetchSingleStudent = async (req, res) => {

  const studentId = req.params.id; 
  try {
    const singleStudent = await Student.findByPk(studentId);

    if (!singleStudent) {
      return res.status(404).json({ message: 'Student data not found.' });
    }

    return res.status(200).json({
      message: 'Student data fetched successfully',
      data: singleStudent,
    });
  } catch (error) {
    console.error('Error fetching student data:');
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
}

const fetchStudentsMakrs = async (req, res) => {
    const studentId = req.params.id; 
  
    try {
      // Fetch marks associated with the student, including subject details
      const marks = await Marks.findAll({
        where: { student_id: studentId },
        include: [
          {
            model: Subject,
            as: 'subject',
            attributes: ['id', 'name'],
          },
        ],
      });
  
      if (!marks || marks.length === 0) {
        return res.status(404).json({ message: 'No marks found for this student.' });
      }

      return res.status(200).json({
        message: 'Marks fetched successfully',
        data: marks,
      });
    } catch (error) {
      console.error('Error fetching marks:', error);
      return res.status(500).json({
        message: 'Internal server error',
        error: error.message,
      });
    }
}
const updateStudent = async (req, res) => {
    const studentId = req.params.id;
    const { name, email, age, parent_id } = req.body;

    if (!name && !email && age === undefined && parent_id === undefined) {
      return res.status(400).json({
        message: 'No data provided to update. Please provide at least one field (name, email, age, or parent_id).',
      });
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    if (age !== undefined && (isNaN(age) || age <= 0)) {
      return res.status(400).json({ message: 'Age must be a positive number.' });
    }
  
    try {
      const student = await Student.findByPk(studentId);
      
      if (!student) {
        return res.status(404).json({ message: 'Student not found.' });
      }
  
      // Check new info with previous info   
      if (email == student.email && name == student.name && age == student.age) {
          return res.status(400).json({ message: 'Same information provided' });
      }

      const updatedStudent = await student.update({
        name: name || student.name, 
        email: email || student.email, 
        age: age !== undefined ? age : student.age,
        parent_id: parent_id !== undefined ? parent_id : student.parent_id, 
      });
  

      return res.status(200).json({
        message: 'Student updated successfully.',
        student: updatedStudent,
      });
    } catch (error) {
      console.error(error, 'Error updating student:');
      return res.status(500).json({
        message: 'Server error. Please try again later.',
        error: error.message,
      });
    }
};

const deleteStudent = async (req, res) => {
    const studentId = req.params.id;
  
    try {
      const student = await Student.findByPk(studentId);

      if (!student) {
        return res.status(404).json({ message: 'Student not found.' });
      }
      const marksDeleted = await Marks.destroy({
        where: { student_id: studentId },
      });
  
      await student.destroy();

      return res.status(200).json({
        message: 'Student and their marks deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting student and marks:', error);
      return res.status(500).json({
        message: 'Server error. Please try again later.',
        error: error.message,
      });
    }
}

module.exports = { addStudent, addMark, fetchAllStudents, fetchSingleStudent, fetchStudentsMakrs, updateStudent, deleteStudent }