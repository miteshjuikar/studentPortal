// models/Marks.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Student = require('./student');
const Subject = require('./subject'); 

const Marks = sequelize.define('Marks', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  marks: {
    type: DataTypes.INTEGER,
    allowNull: false, 
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'marks',
  timestamps: false, 
});

Marks.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
Marks.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

module.exports = Marks;
