const express = require('express');
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../auth"); // JWT 인증 미들웨어
const multer = require('multer');

// 이미지 저장 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// 1. 명언 생성 API: 피드 생성과 이미지 업로드를 통합 처리할 수 있도록 수정
// 파일을 포함한 POST 요청을 처리하고, 인증 미들웨어를 적용합니다.
// authMiddleware를 통해 req.user에 userId가 담깁니다.
router.post('/', authMiddleware, upload.array('files', 5), async (req, res) => {
    // 💡 JWT에서 USER_ID를 가져옵니다. (req.body.userId 대신)
    const USER_ID = req.user.userId;
    const { feedTitle, feedContents } = req.body;
    const files = req.files || []; // 업로드된 파일 배열

    if (!content) {
        return res.status(400).json({ msg: "내용은 필수 입력 항목입니다." });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction(); 

        // 2. PTB_FEED 테이블에 피드 데이터 삽입
        let feedSql = "INSERT INTO PTB_FEED (USER_ID, FEED_TITLE, FEED_CONTENTS) VALUES(?, ?, ?)";
        let [feedResult] = await connection.query(feedSql, [USER_ID, title, content]);
        const feedNo = feedResult.insertId;

        // 3. 🔑 파일이 있는 경우에만 PTB_FEED_IMG 테이블에 이미지 정보 저장
        const files = req.files || [];
        if (files.length > 0) { // 👈 files 배열의 길이가 0보다 클 때만 실행
            let host = `${req.protocol}://${req.get("host")}/`;
            for (let file of files) {
                let imgQuery = "INSERT INTO PTB_FEED_IMG (FEED_NO, FEED_IMG_NAME, IMG_PATH) VALUES(?, ?, ?)"; 
                await connection.query(imgQuery, [feedNo, file.filename, host + file.destination + file.filename]);
            }
        }
        
        await connection.commit(); // 트랜잭션 커밋
        res.status(201).json({ msg: "✔️ 피드 등록 성공!", feedNo: feedNo });

    } catch (err) {
        if (connection) {
            await connection.rollback(); // 오류 발생 시 롤백
        }
        console.error("피드 생성/업로드 중 오류:", err);
        res.status(500).json({ msg: "피드 등록 중 서버 오류가 발생했습니다." });
    } finally {
        if (connection) {
            connection.release(); // 연결 해제
        }
    }
});


// routes/feed.js 파일 내 router.get("/list", ...) 부분 수정

router.get("/list", async (req, res) => {
    try {
        let sql = 
            `SELECT
                F.FEED_NO AS id, 
                F.USER_ID, 
                F.FEED_TITLE,            
                F.FEED_CONTENTS,         
                F.CREATE_FEED_DATE AS CREATE_DATE, 
                GROUP_CONCAT(I.IMG_PATH) AS imgPaths    
            FROM PTB_FEED F
            JOIN PTB_USER U ON F.USER_ID = U.USER_ID
            LEFT JOIN PTB_FEED_IMG I ON F.FEED_NO = I.FEED_NO
            GROUP BY 
                F.FEED_NO, F.USER_ID, F.FEED_TITLE, F.FEED_CONTENTS, F.CREATE_FEED_DATE, U.USER_NAME 
            ORDER BY F.CREATE_FEED_DATE DESC
            `;
        let [list] = await db.query(sql);

        // ... (이후 formattedList 로직은 유지) ...
        const formattedList = list.map(feed => ({
            ...feed,
            imgPaths: feed.imgPaths ? feed.imgPaths.split(',') : []
        }));

        res.json({
            list : formattedList,
            result : "success"
        });

    } catch (error) {
        console.error("피드 목록 조회 중 오류:", error);
        res.status(500).json({ 
            list: [], 
            result: "fail", 
            msg: "서버 오류 발생" 
        });
    }
});

// 5. 🗑️ 피드 삭제 API: 인증 미들웨어와 작성자 권한 검사 추가
router.delete('/:feedId', authMiddleware, async (req, res) => {
    let { feedId } = req.params;
    let USER_ID_FROM_TOKEN = req.user.userId;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. 해당 피드의 작성자 ID 확인
        const [feed] = await connection.query("SELECT USER_ID FROM PTB_FEED WHERE FEED_NO = ?", [feedId]);

        if (feed.length === 0) {
            return res.status(404).json({ msg: "해당 피드가 존재하지 않습니다." });
        }
        
        // 2. 🔑 권한 검사: 토큰의 사용자 ID와 피드 작성자 ID 비교
        if (feed[0].USER_ID !== USER_ID_FROM_TOKEN) {
            return res.status(403).json({ msg: "삭제 권한이 없습니다." });
        }
        
        // 3. 이미지 삭제 (외래 키 제약 조건으로 자동 삭제되거나, 명시적으로 삭제)
        // 안전하게 명시적 삭제 (DB 스키마에 따라 필요)
        await connection.query("DELETE FROM TBL_FEED_IMG WHERE FEEDID = ?", [feedId]);

        // 4. 피드 삭제
        let sql = "DELETE FROM PTB_FEED WHERE FEED_NO = ?";
        let [result] = await connection.query(sql, [feedId]); 
        
        await connection.commit();

        res.json({
            result: result.affectedRows > 0 ? "success" : "fail",
            msg: result.affectedRows > 0 ? "삭제되었습니다." : "삭제 실패"
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error(error);
        res.status(500).json({ msg: "서버 오류로 인해 삭제에 실패했습니다." });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


router.get("/:userId", async (req, res) => {
    let {userId} = req.params;
    try {
        let sql = 
            `SELECT 
                F.FEED_NO AS id, 
                F.USER_ID, 
                F.FEED_TITLE,         
                F.FEED_CONTENTS,      
                F.CREATE_FEED_DATE AS CREATE_DATE, 
                GROUP_CONCAT(I.IMG_PATH) AS imgPaths     
            FROM PTB_FEED F 
            LEFT JOIN PTB_FEED_IMG I ON F.FEED_NO = I.FEED_NO /* 🔑 I.FEEDID -> I.FEED_NO로 수정 */
            WHERE F.USER_ID = ? 
            GROUP BY 
                F.FEED_NO, F.USER_ID, F.FEED_TITLE, F.FEED_CONTENTS, F.CREATE_FEED_DATE 
            ORDER BY F.CREATE_FEED_DATE DESC`;
        
        let [list] = await db.query(sql, [userId]); 
        
        // 프론트엔드에서 처리하기 쉽도록 문자열로 묶인 imgPaths를 배열로 변환
        const formattedList = list.map(feed => ({
            ...feed,
            imgPaths: feed.imgPaths ? feed.imgPaths.split(',') : []
        }));

        res.json({
            list : formattedList,
            result : "success"
        });
    } catch (error) {
        console.error("피드 조회 중 에러 발생:", error);
        // 에러 발생 시에도 클라이언트의 map 오류를 막기 위해 list:[] 반환
        res.status(500).json({ list: [], result: "fail", msg: "서버 오류" });
    }
});

module.exports = router;