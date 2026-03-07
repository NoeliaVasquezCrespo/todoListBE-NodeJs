const express = require('express')
const dotenv = require('dotenv')

const app = express();

dotenv.config({ path: './src/.env' });

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hola mundo');
})

app.listen(port, () => {
    console.log(`Server corriendo en el puerto ${port}`)
})