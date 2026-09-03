const jwt = require('jsonwebtoken')
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decodedToken
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
}
module.exports = authMiddleware