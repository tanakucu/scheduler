const db = require('../config/db');

// Query to count lotteries starting with a prefix
const getLotteryPossibleNumber = (startsWith, callback) => {
    console.log(`getLotteryPossibleNumber called with startsWith: ${startsWith}`);
    const query = `SELECT DISTINCT 
                        SUBSTR(phone_number, ${startsWith.length + 1}, 1) AS next_digit
                    FROM
                        lottos1
                    WHERE 
                        phone_number LIKE ?
                    AND 
                        phone_number NOT IN (SELECT DISTINCT phone_number FROM lotto_winners)
                    ORDER BY 
                        next_digit`;

    db.query(query, [`${startsWith}%`], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
        } else {
            console.log('Query results:', results);
        }
        callback(err, results);
    });
};

const getPossibleLottos = (startsWith, callback) => {
    console.log(`getPossibleLottos called with startsWith: ${startsWith}`);
    const query = `SELECT count(phone_number) as possibleLottos FROM lottos1 WHERE phone_number LIKE ? AND phone_number NOT IN (SELECT DISTINCT phone_number FROM lotto_winners)`;

    db.query(query, [`${startsWith}%`], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
        } else {
            console.log('Query results:', results);
        }
        callback(err, results);
    });
}

// Query to fetch all winners
const getWinners = (callback) => {
    console.log('getWinners called');
    const query = 'SELECT * FROM lotto_winners';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
        } else {
            console.log('Query results:', results);
        }
        callback(err, results);
    });
};

// Query to fetch winner details based on prefix
const getWinnerByPrefix = (startsWith, callback) => {
    console.log(`getWinnerByPrefix called with startsWith: ${startsWith}`);
    const query = 'SELECT * FROM lottos1 WHERE phone_number LIKE ?';

    db.query(query, [`${startsWith}%`], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
        } else {
            console.log('Query results:', results);
        }
        callback(err, results);
    });
};

const addWinner = (winner, callback) => {
    console.log('addWinner called with:', winner);
    const query = 'INSERT INTO lotto_winners SET ?';
    db.query(query, winner, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
        } else {
            console.log('Query results:', results);
        }
        callback(err, results);
    });
};

module.exports = {
    getLotteryPossibleNumber,
    getPossibleLottos,
    getWinners,
    getWinnerByPrefix,
    addWinner
};
