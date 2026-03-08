const express = require('express')
const dotenv = require('dotenv')

const app = express();

dotenv.config({ path: './.env' });

const pool = require('./db/connection');
const port = process.env.PORT || 3000;
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hola mundo');
})

app.use((req, res) => {
    res.status(404).json({
        message: 'Ruta no encontrada'
    });
});

async function testConnection() {
    try {
        await pool.query('SELECT 1');
        console.log('DB conectada correctamente');
    } catch (error) {
        console.error('Error de conexión DB:', error);
    }
}

testConnection();

app.listen(port, () => {
    console.log(`Server corriendo en el puerto ${port}`)
})