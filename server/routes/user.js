const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require("../db");
const jwt = require('jsonwebtoken');
// 🔑 추가 1: JWT 인증 미들웨어 불러오기
const authMiddleware = require("../auth"); 

//아주 긴 랜덤한 문자 사용 권장
const JWT_KEY = "zB7fE9X1yR4vT0qH3mC8wL5sJ2dK6pUaGbNcZdEfHgIjKlMnOpQrStUvWxY";

// 📝 사용자 정보 조회 API (GET /user/:userId)
router.get("/:userId", async (req, res) => {
    let {userId} = req.params;
    try {
        // 🔑 쿼리 수정: USER_INTRODUCTION 컬럼을 'intro' 별칭으로 명시적으로 선택
        let sql = 
            "SELECT U.USER_ID AS userId, U.USER_NAME AS userName, U.USER_EMAIL, U.USER_PHONE_NUMBER, U.USER_ADDR, U.USER_STATUS, " +
            "U.USER_INTRODUCTION AS intro, " + 
            "IFNULL(T.CNT, 0) cnt " + 
            "FROM PTB_USER U " +
            "LEFT JOIN ( " +
            "    SELECT USER_ID, COUNT(*) CNT " +
            "    FROM PTB_FEED " +
            "    GROUP BY USER_ID " +
            ") T ON U.USER_ID = T.USER_ID " +
            "WHERE U.USER_ID = ?";
        
        let [list] = await db.query(sql, [userId]); 
        
        if (list.length > 0) {
            res.json({
                user : list[0],
                result : "success"
            });
        } else {
            res.status(404).json({ msg: "사용자를 찾을 수 없습니다." });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "서버 오류가 발생했습니다." });
    }
});


// 📝 자기소개 수정 API (PUT /user/intro)
router.put('/intro', authMiddleware, async (req, res) => {
    // 🔑 JWT 미들웨어를 통해 추출된 사용자 ID (본인 확인용)
    const USER_ID = req.user.userId; 
    // 클라이언트에서 보낸 새로운 자기소개 내용
    const { newIntro } = req.body; 

    if (newIntro === undefined) {
        return res.status(400).json({ msg: "자기소개 내용이 필요합니다." });
    }

    let connection;
    try {
        connection = await db.getConnection();
        
        // 🔑 PTB_USER 테이블의 USER_INTRODUCTION 컬럼 업데이트
        let sql = "UPDATE PTB_USER SET USER_INTRODUCTION = ? WHERE USER_ID = ?";
        let [result] = await connection.query(sql, [newIntro, USER_ID]);

        if (result.affectedRows > 0) {
            res.json({
                result: "success",
                msg: "자기소개가 성공적으로 업데이트되었습니다."
            });
        } else {
            res.status(404).json({ msg: "사용자 정보를 찾을 수 없거나 변경된 내용이 없습니다." });
        }

    } catch (error) {
        console.error("자기소개 업데이트 DB 에러:", error);
        res.status(500).json({ msg: "서버 내부 오류로 업데이트에 실패했습니다." });
    } finally {
        if (connection) connection.release();
    }
});


// 📝 회원가입 API (POST /user/join)
router.post('/join', async (req, res) => {
    let {userId, pwd, userName, userEmail, userPhoneNumber, userAddr} = req.body
    console.log("join ==> ", req.body);
    
    // 필수 필드 체크 (추가)
    if (!userId || !pwd || !userName) {
        return res.status(400).json({ msg: "필수 입력 항목이 누락되었습니다." });
    }

    try {
        // 1. 비밀번호 해싱
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(pwd, saltRounds);

        // 2. DB 삽입 쿼리 (USER_INTRODUCTION은 DEFAULT NULL이므로 생략)
        let sql = "INSERT INTO PTB_USER (USER_ID, USER_PASSWORD, USER_NAME, USER_EMAIL, USER_PHONE_NUMBER, USER_ADDR, USER_INTRODUCTION) VALUES(?, ?, ?, ?, ?, ?, '자기소개입니다.')";
        let [result] = await db.query(sql, [userId, hashedPassword, userName, userEmail, userPhoneNumber, userAddr]);
        
        console.log(result);

        res.json({
            result : result,
            msg : userId + "님 환영합니다!"
        });

    } catch (error) {
        console.log(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ msg: "이미 존재하는 아이디입니다." }); // 409 Conflict
        }
        res.status(500).json({ msg: "서버 오류로 회원가입에 실패했습니다." });
    }
});

// 📝 로그인 API (POST /user/login)
router.post('/login', async (req, res) => {
    let {userId, userPassword} = req.body
    console.log("login ==> ", req.body);
    try {
        let sql = "SELECT * FROM PTB_USER WHERE USER_ID = ?";
        let [list] = await db.query(sql, [userId]); 
        let msg = "";
        let result = false;
        let token = null;
        if(list.length > 0){
            // 아이디 존재
            
            const match = await bcrypt.compare(userPassword, list[0].USER_PASSWORD); 
            if(match){
                msg = list[0].USER_ID + " 님 환영합니다!";
                result = true;
                let user = {
                    userId : list[0].USER_ID,
                    userName : list[0].USER_NAME,
                    status : list[0].USER_STATUS
                    //권한 등 필요한 정보 추가
                };

                token = jwt.sign(user, JWT_KEY, {expiresIn : '1h'}); 
                console.log(token);
                
                // 2. ✅ 200 OK 상태 코드 반환
                return res.status(200).json({ 
                    result : result,
                    msg : msg,
                    token : token
                });
            }
            else {
                // 3. ❌ 비밀번호 불일치
                msg = "비밀번호를 확인해주세요.";
                
                // 4. ❌ 401 Unauthorized 상태 코드 반환
                return res.status(401).json({ 
                    result : false,
                    msg : msg
                });
            }
        } else {
            // 5. ❌ 아이디 없음
            msg = "해당 아이디가 존재하지 않습니다.";

            // 6. ❌ 401 Unauthorized 상태 코드 반환
            return res.status(401).json({ 
                result : false,
                msg : msg
            });
        }

    } catch (error) {
        console.log(error);
        // 서버 내부 오류 시 500 Internal Server Error 반환
        return res.status(500).json({ msg: "서버 오류가 발생했습니다." });
    }
});

// 📝 아이디 중복 확인 API (GET /user/check-id/:userId)
router.get('/check-id/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const sql = "SELECT COUNT(*) AS count FROM PTB_USER WHERE USER_ID = ?";
        const [rows] = await db.query(sql, [userId]);
        const isDuplicate = rows[0].count > 0;

        if (isDuplicate) {
            res.json({ isDuplicate: true, msg: "이미 사용 중인 아이디입니다." });
        } else {
            res.json({ isDuplicate: false, msg: "사용 가능한 아이디입니다." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "아이디 중복 확인 중 서버 오류가 발생했습니다." });
    }
});


module.exports = router;