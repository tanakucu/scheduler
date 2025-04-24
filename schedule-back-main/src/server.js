const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const numApiRoute = require('./routers/num-api.route');
const authRoute = require('./routers/auth.route');

// const db = require('./config/db');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/num-api', numApiRoute);
app.use('/auth', authRoute);

// Default Route
app.get('/', (req, res) => {
    res.send('Backend API');
});

// app.get('/test-db', (req, res) => {
//     db.getConnection((err, connection) => {
//         if (err) {
//             console.error('Database connection failed:', err.message);
//             return res.status(500).json({ status: 'error', message: err.message });
//         }
//         connection.release();
//         res.json({ status: 'success', message: 'Database connected successfully' });
//     });
// });

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
