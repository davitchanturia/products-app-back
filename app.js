const express = require('express');
const sqlite3 = require('sqlite3').verbose(); 

const app = express();
const port = 3000; 
const db = new sqlite3.Database('./database.sqlite');

const products = [
    { name: 'Iphone 12', price: '1300', 
        image_one: 'https://s3.zoommer.ge/zoommer-images/thumbs/0127451_apple-iphone-12-64gb-black_550.png', 
        image_two: 'https://s3.zoommer.ge/zoommer-images/thumbs/0127452_apple-iphone-12-64gb-black_550.png', 
        image_three: null
    },
    { name: 'Iphone 13', price: '1400', 
        image_one: 'https://s3.zoommer.ge/zoommer-images/thumbs/0154537_apple-iphone-13-128gb-red_550.jpeg',
        image_two: 'https://s3.zoommer.ge/zoommer-images/thumbs/0154538_apple-iphone-13-128gb-red_550.jpeg', 
        image_three: null
    },
    { name: 'Iphone 15', price: '1500', 
        image_one: 'https://s3.zoommer.ge/site/1ced6132-0964-4c71-8898-58fb9dc54fd3_Thumb.jpeg', 
        image_two: 'https://s3.zoommer.ge/site/09282735-add9-4c57-898c-7bfbd5c4885c_Thumb.jpeg', 
        image_three: 'https://s3.zoommer.ge/site/f3df4a35-1891-4d0e-a8c6-98fe56067f36_Thumb.jpeg' 
    }
];

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
    db.all("SELECT * FROM products", (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.json(rows);
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
