require('dotenv').config({ path: './src/.env' });

const fs = require('fs');
const pool = require('./connection.js');

async function runMigrations() {
    try {
        const files = fs.readdirSync('./src/db/migrations');

        for (const file of files) {
            const sql = fs.readFileSync(`./src/db/migrations/${file}`, 'utf8');
            await pool.query(sql);
            console.log(`Migración ejecutada: ${file}`);
        }

        console.log('Migraciones completadas');
    } catch (error) {
        console.error(error);
    }
}

runMigrations();
