const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// DB Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'electricity_db'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected');
});

// Calculate Bill Function
function calculateBill(units) {
  let amount = 0;
  if (units <= 50) amount = units * 3.5;
  else if (units <= 150) amount = (50 * 3.5) + (units - 50) * 4.0;
  else if (units <= 250) amount = (50 * 3.5) + (100 * 4.0) + (units - 150) * 5.2;
  else amount = (50 * 3.5) + (100 * 4.0) + (100 * 5.2) + (units - 250) * 6.5;
  return amount;
}

// API to add consumer
app.post('/consumer', (req, res) => {
  const { name, email, address } = req.body;
  const sql = 'INSERT INTO Consumer (name, email, address) VALUES (?, ?, ?)';
  db.query(sql, [name, email, address], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ id: result.insertId, message: 'Consumer Added' });
  });
});

// API to add billing and calculate amount
app.post('/bill', (req, res) => {
  const { consumer_id, units } = req.body;
  const amount = calculateBill(units);
  const sql = 'INSERT INTO Billing (consumer_id, units, amount) VALUES (?, ?, ?)';
  db.query(sql, [consumer_id, units, amount], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Bill Added', amount });
  });
});

// API to get all bills
app.get('/bills', (req, res) => {
  const sql = `
    SELECT c.name, c.email, b.units, b.amount, b.date
    FROM Billing b JOIN Consumer c ON b.consumer_id = c.id
    ORDER BY b.date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

app.listen(3000, () => {
  console.log('Server started at http://localhost:3000');
});


// CREATE DATABASE electricity_db;

// USE electricity_db;

// -- Consumer Table
// CREATE TABLE Consumer (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   name VARCHAR(100),
//   email VARCHAR(100),
//   address TEXT
// );

// -- Billing Table
// CREATE TABLE Billing (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   consumer_id INT,
//   units INT,
//   amount DECIMAL(10,2),
//   date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (consumer_id) REFERENCES Consumer(id)
// );

// Test in Postman/Thunder Client
// ✅ Add Consumer:
// Method: POST

// URL: http://localhost:3000/consumer

// Body (JSON):

// json
// Copy code
// {
//   "name": "Sagar Patil",
//   "email": "sagar@example.com",
//   "address": "VIT, Pune"
// }
// ✅ Add Bill:
// Method: POST

// URL: http://localhost:3000/bill

// Body:

// json
// Copy code
// {
//   "consumer_id": 1,
//   "units": 275
// }
// ✅ Get All Bills:
// Method: GET

// URL: http://localhost:3000/bills
