const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// DB Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'vit_results'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected');
});

// Add student
app.post('/students', (req, res) => {
  const { name, roll_no } = req.body;
  db.query('INSERT INTO Students (name, roll_no) VALUES (?, ?)', [name, roll_no], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ student_id: result.insertId });
  });
});

// Add MSE Marks
app.post('/mse', (req, res) => {
  const { student_id, s1, s2, s3, s4 } = req.body;
  db.query('INSERT INTO MSE (student_id, subject1, subject2, subject3, subject4) VALUES (?, ?, ?, ?, ?)',
    [student_id, s1, s2, s3, s4], (err) => {
      if (err) return res.status(500).send(err);
      res.send({ message: 'MSE marks added' });
    });
});

// Add ESE Marks
app.post('/ese', (req, res) => {
  const { student_id, s1, s2, s3, s4 } = req.body;
  db.query('INSERT INTO ESE (student_id, subject1, subject2, subject3, subject4) VALUES (?, ?, ?, ?, ?)',
    [student_id, s1, s2, s3, s4], (err) => {
      if (err) return res.status(500).send(err);
      res.send({ message: 'ESE marks added' });
    });
});

// Get Final Result
app.get('/result/:student_id', (req, res) => {
  const sid = req.params.student_id;
  const query = `
    SELECT s.name, s.roll_no,
      ROUND((m.subject1 * 0.3 + e.subject1 * 0.7), 2) AS subject1,
      ROUND((m.subject2 * 0.3 + e.subject2 * 0.7), 2) AS subject2,
      ROUND((m.subject3 * 0.3 + e.subject3 * 0.7), 2) AS subject3,
      ROUND((m.subject4 * 0.3 + e.subject4 * 0.7), 2) AS subject4
    FROM Students s
    JOIN MSE m ON s.id = m.student_id
    JOIN ESE e ON s.id = e.student_id
    WHERE s.id = ?
  `;
  db.query(query, [sid], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results[0]);
  });
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});


// CREATE DATABASE vit_results;

// USE vit_results;

// -- 1. Students Table
// CREATE TABLE Students (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   name VARCHAR(100),
//   roll_no VARCHAR(20)
// );

// -- 2. MSE Marks Table (30%)
// CREATE TABLE MSE (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   student_id INT,
//   subject1 INT,
//   subject2 INT,
//   subject3 INT,
//   subject4 INT,
//   FOREIGN KEY (student_id) REFERENCES Students(id)
// );

// -- 3. ESE Marks Table (70%)
// CREATE TABLE ESE (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   student_id INT,
//   subject1 INT,
//   subject2 INT,
//   subject3 INT,
//   subject4 INT,
//   FOREIGN KEY (student_id) REFERENCES Students(id)
// );
