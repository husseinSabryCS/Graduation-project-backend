// authMiddleware.js

const jwt = require('jsonwebtoken');
const config = require('./config');

// Middleware function to check if the user is authorized
const authMiddleware = (req, res, next) => {
    // Get the token from request headers, query parameters, or cookies
    const token = req.headers.authorization;

    // Check if token exists
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    // Verify the token
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        } else {
            // If token is valid, attach user information to request object for later use
            req.user = decoded;
            next();
        }
    });
};

module.exports = authMiddleware;
