const jwt = require('jsonwebtoken');
const JWT_SECRET = 'zB7fE9X1yR4vT0qH3mC8wL5sJ2dK6pUaGbNcZdEfHgIjKlMnOpQrStUvWxY'; // .env 없이 하드코딩

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: '인증 토큰 없음', isLogin: false });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // 이후 라우터에서 req.user로 사용자 정보 사용 가능
        next(); // 다음 함수 실행
    } catch (err) {
        return res.status(403).json({ message: '유효하지 않은 토큰', isLogin: false });
    }
};
