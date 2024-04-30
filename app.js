const express = require('express');
const app = express();
const port = 3000; 

const products = [];

app.get('/products', (req, res) => {
    res.json(products);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
