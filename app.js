const express = require('express');
const products = require('./data');
const sqlite3 = require('sqlite3').verbose(); 

const app = express();
const port = 3000; 
const db = new sqlite3.Database('./database.sqlite');

const allowCrossDomain = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type'); 
    next();
};

// Use the middleware function for all routes
app.use(allowCrossDomain);

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, price REAL NOT NULL, image_one TEXT NOT NULL, image_two TEXT, image_three TEXT)");

    db.run("DELETE FROM products");

    const stmt = db.prepare("INSERT INTO products (name, price, image_one, image_two, image_three) VALUES (?, ?, ?, ?, ?)");    

    products.forEach((product) => {
        stmt.run(product.name, product.price, product.image_one, product.image_two, product.image_three);
    });

    stmt.finalize();
});

app.get('/products', (req, res) => {
    const pageSize = 5; 
    const page = parseInt(req.query.page) || 1; 

    // Query the database to count the total number of records
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (err) {
            res.status(500).json({ error: 'Internal server error' });
        } else {
            const totalRecords = row.count; 
            const totalPages = Math.ceil(totalRecords / pageSize);

            const offset = (page - 1) * pageSize; 

            // Query the database to fetch paginated products
            db.all(`SELECT * FROM products LIMIT ? OFFSET ?`, [pageSize, offset], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).json({ error: 'Internal server error' });
                } else {
                    res.json({ totalPages, currentPage: page, pageSize, products: rows });
                }
            });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
