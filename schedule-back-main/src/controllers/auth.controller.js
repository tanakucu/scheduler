const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
    try{
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ status: 'error', message: 'Email and password are required' });
        }

        const emailRegex = /^[^\s@]+@stud\.num\.edu\.mn$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Зөвхөн NUM-ийн цахим шуудан хаяг ашиглах боломжтой' });
        }

        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Энэ цахим шуудан хаяг бүртгэлтэй байна' });
        }

        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await pool.query(
            'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
            [email, hashedPassword, email]
        );

        const token = jwt.sign(
            { id: result.rows[0].id, email: result.rows[0].email },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'Хэрэглэгч амжилттай бүртгэгдлээ',
            user: {
                id: result.rows[0].id,
                email: result.rows[0].email,
                name: result.rows[0].email
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Бүртгэх үйл явцад алдаа гарлаа' });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Хэрэглэгчийн нэр эсвэл нууц үг буруу байна' });
        }
        
        const user = result.rows[0];
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Хэрэглэгчийн нэр эсвэл нууц үг буруу байна' });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        res.status(200).json({
            message: 'Амжилттай нэвтэрлээ',
            user: {
                id: user.id,
                email: user.email,
                name: user.email
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Нэвтрэх үйл явцад алдаа гарлаа' });
    }
}

const verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Нэвтрэх токен байхгүй байна' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const result = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [decoded.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Хэрэглэгч олдсонгүй' });
        }
        
        res.status(200).json({ user: result.rows[0] });
    } catch (error) {
        console.error('Auth verification error:', error);
        res.status(401).json({ error: 'Хүчингүй эсвэл идэвхгүй болсон токен' });
    }
}

module.exports = {
    register,
    login,
    verifyToken
}