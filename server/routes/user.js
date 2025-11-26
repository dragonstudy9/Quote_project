const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require("../db");
const jwt = require('jsonwebtoken');

//아주 긴 랜덤한 문자 사용 권장
const JWT_KEY = "zB7fE9X1yR4vT0qH3mC8wL5sJ2dK6pUaGbNcZdEfHgIjKlMnOpQrStUvWxY";

router.get("/:userId", async (req, res) => {
    let {userId} = req.params;
    try {
        //방법 1. 두 개 쿼리 써서 리턴
        // let [list] = await db.query("SELECT * FROM TBL_USER WHERE USERID = ?", [userId]);
        // let [cnt] = await db.query("SELECT COUNT(*) WHERE USERID = ?", [userId]);
        // res.json({
        //     user : list[0],
        //     cnt : cnt[0]
        // })

        //방법 2. 조인쿼리 만들어서 하나로 리턴
        let sql = 
            "SELECT U.*, IFNULL(T.CNT, 0) cnt " +
            "FROM PTB_USER U " +
            "LEFT JOIN ( " +
            "    SELECT USER_ID, COUNT(*) CNT " +
            "    FROM PTB_FEED " +
            "    GROUP BY USER_ID " +
            ") T ON U.USER_ID = T.USER_ID " +
            "WHERE U.USER_ID = ?";
        
        let [list] = await db.query(sql, [userId]); //비동기적으로 동작 -> await 처리
        // console.log(list);
        res.json({
            user : list[0],
            result : "success"
        });
    } catch (error) {
        console.log("에러 발생!");
        console.log(error);
    }
})

// routes/user.js 파일에 다음 API를 추가합니다.

// 4. 🔑 아이디 중복 확인 API (GET /user/check-id/:userId)
router.get("/check-id/:userId", async (req, res) => {
    let { userId } = req.params;
    
    try {
        const [existing] = await db.query("SELECT USER_ID FROM PTB_USER WHERE USER_ID = ?", [userId]);
        
        let isDuplicate = existing.length > 0;
        
        if (isDuplicate) {
            // 중복되는 아이디가 있는 경우 (회원가입 불가)
            return res.status(200).json({ 
                isDuplicate: true, 
                msg: "이미 사용 중인 아이디입니다." 
            });
        } else {
            // 중복되는 아이디가 없는 경우 (회원가입 가능)
            return res.status(200).json({ 
                isDuplicate: false, 
                msg: "사용 가능한 아이디입니다." 
            });
        }
    } catch (error) {
        console.error("아이디 중복 확인 중 오류 발생:", error);
        res.status(500).json({ 
            isDuplicate: true, // 오류 발생 시 안전하게 중복으로 처리
            msg: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." 
        });
    }
});


router.post("/join", async (req, res) => {
    let {userId, pwd, userName, userEmail, userPhoneNumber, userAddr} = req.body;
    
    try {
        let hashPwd = await bcrypt.hash(pwd, 10);//숫자는 암호화 반복횟수
        // INSERT 쿼리 수정 권장
        let sql = "INSERT INTO PTB_USER (USER_ID, USER_PASSWORD, USER_NAME, USER_EMAIL, USER_PHONE_NUMBER, USER_ADDR, USER_STATUS, USER_DATE) VALUES (?, ?, ?, ?, ?, ?, 'U', NOW())";
        let result = await db.query(sql, [userId, hashPwd, userName, userEmail, userPhoneNumber, userAddr]); //비동기적으로 동작 -> await 처리
        
        res.json({
            result : result,
            msg : "가입되었습니다!"
        });
    } catch (error) {
        console.log(error);
    }
})


// routes/user.js 파일의 router.post('/login', ...) 부분 수정

router.post('/login', async (req, res) => {
    let {userId, userPassword} = req.body
    console.log("login ==> ", req.body);
    try {
        let sql = "SELECT * FROM PTB_USER WHERE USER_ID = ?";
        let [list] = await db.query(sql, [userId]); //비동기적으로 동작 -> await 처리
        let msg = "";
        let result = false;
        let token = null;

        if(list.length > 0){
            // 아이디 존재
            const match = await bcrypt.compare(userPassword, list[0].USER_PASSWORD); //해시화된 암호를 꺼내서 입력된 값과 비교
            
            if(match){
                // 1. ✅ 로그인 성공 (ID 및 비밀번호 일치)
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
        return res.status(500).json({ 
            result : false,
            msg : "서버 오류가 발생했습니다."
        });
    }
});

router.delete("/:userId", async (req, res) => {
    
})

module.exports = router;