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
            "    FROM PTB_USER " +
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


router.post("/join", async (req, res) => {
    let {userId, pwd, userName, userEmail, userPhoneNumber, userAddr} = req.body;
    
    try {
        let hashPwd = await bcrypt.hash(pwd, 10);//숫자는 암호화 반복횟수
        let sql = "INSERT INTO PTB_USER VALUES (?, ?, ?, ?, ?, ?, NOW())";
        let result = await db.query(sql, [userId, hashPwd, userName, userEmail, userPhoneNumber, userAddr]); //비동기적으로 동작 -> await 처리
        console.log("result =========> ", result);
        res.json({
            result : result,
            msg : "가입되었습니다!"
        });
    } catch (error) {
        console.log(error);
    }
})


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
                msg = list[0].USER_ID + " 님 환영합니다!";
                result = true;
                let user = {
                    userId : list[0].USER_ID,
                    userName : list[0].USER_NAME,
                    status : "A" //토큰 권한 일단 하드코딩
                    //권한 등 필요한 정보 추가
                };

                token = jwt.sign(user, JWT_KEY, {expiresIn : '1h'}); //첫번째 파라미터, 두번째 토큰, 세번째 만료시간
                console.log(token);
            }
            else {
                msg = "비밀번호를 확인해주세요.";
            }
        } else {
            //아이디 없음
            msg = "해당 아이디가 존재하지 않습니다.";
        }

        res.json({
            result : result,
            msg : msg,
            token : token
            
        });
    } catch (error) {
        console.log(error);
    }
   
})

router.delete("/:userId", async (req, res) => {
    
})

module.exports = router;