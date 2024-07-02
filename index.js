
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 8000;

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rahul@4495',
    database: 'placement'
});

con.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

app.use(bodyParser.json());

// Register
app.post('/app/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO user (username, hashedPassword, email) VALUES (?, ?, ?)';
        con.query(sql, [name, hashedPassword, email], (err, result) => {
            if (err) throw err;
            res.send('User registered successfully');
        });
    } catch (err) {
        res.status(500).send('Error registering user');
    }
});

// Login
app.post('/app/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';
    con.query(sql, [email], async (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.status(400).send('User not found');
        }
        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).send('Invalid password');
        }
        const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '1h' });
        res.json({ token });
    });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
