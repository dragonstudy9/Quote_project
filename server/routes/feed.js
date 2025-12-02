const express = require('express');
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../auth"); 
const multer = require('multer');

// 이미지 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ----------------------
// 피드 생성 + 이미지 + 태그 + 명언 작성자
// ----------------------
router.post('/', authMiddleware, upload.array('files', 5), async (req, res) => {
  const USER_ID = req.user.userId;
  const { feedTitle, feedContents, tags, QUOTE_BACKGROUND } = req.body; 
  const files = req.files || [];

  if (!feedTitle) { 
    return res.status(400).json({ msg: "제목은 필수 입력 항목입니다." });
  }

  const tagList = tags ? JSON.parse(tags) : []; 

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction(); 

    // 1) 피드 등록
    let feedSql = "INSERT INTO PTB_FEED (USER_ID, FEED_TITLE, FEED_CONTENTS, QUOTE_BACKGROUND) VALUES(?, ?, ?, ?)";
    let [feedResult] = await connection.query(feedSql, [USER_ID, feedTitle, feedContents, QUOTE_BACKGROUND || null]);
    const feedNo = feedResult.insertId;

    // 2) 이미지 등록
    if (files.length > 0) {
      let host = `${req.protocol}://${req.get("host")}/`;
      for (let file of files) {
        let imgQuery = "INSERT INTO PTB_FEED_IMG (FEED_NO, FEED_IMG_NAME, IMG_PATH) VALUES(?, ?, ?)";
        await connection.query(imgQuery, [feedNo, file.filename, host + file.destination + file.filename]);
      }
    }

    // 3) 태그 등록
    for (let tagName of tagList) {
      if (!tagName.trim()) continue;

      let [rows] = await connection.query("SELECT TAG_NO FROM PTB_TAG_LIST WHERE TAG_NAME = ?", [tagName]);
      let tagNo;
      if (rows.length > 0) {
        tagNo = rows[0].TAG_NO;
      } else {
        let [insertTag] = await connection.query("INSERT INTO PTB_TAG_LIST (TAG_NAME) VALUES (?)", [tagName]);
        tagNo = insertTag.insertId;
      }

      await connection.query("INSERT INTO PTB_FEED_TAG (FEED_NO, TAG_NO) VALUES (?, ?)", [feedNo, tagNo]);
    }

    await connection.commit();
    res.status(201).json({ msg: "✔️ 피드 등록 성공!", feedNo });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("피드 생성/업로드 중 오류:", err);
    res.status(500).json({ msg: "피드 등록 중 서버 오류가 발생했습니다." });
  } finally {
    if (connection) connection.release();
  }
});


// feed.js

// ----------------------
// 피드 목록 조회 
// ----------------------
router.get("/list", async (req, res) => {
  const q = req.query.q ? `%${req.query.q}%` : '%';

  try {
    let sql = `
      SELECT
        F.FEED_NO AS id, 
        F.USER_ID, 
        F.FEED_TITLE,      
        F.FEED_CONTENTS,     
        F.QUOTE_BACKGROUND,   
        F.CREATE_FEED_DATE AS CREATE_DATE, 
        GROUP_CONCAT(DISTINCT I.IMG_PATH) AS imgPaths,
        GROUP_CONCAT(DISTINCT T.TAG_NAME) AS tags,
        COUNT(DISTINCT L.FEED_LIKE_NO) AS TOTAL_LIKES 
      FROM PTB_FEED F
      JOIN PTB_USER U ON F.USER_ID = U.USER_ID
      LEFT JOIN PTB_FEED_IMG I ON F.FEED_NO = I.FEED_NO
      LEFT JOIN PTB_FEED_TAG FT ON F.FEED_NO = FT.FEED_NO
      LEFT JOIN PTB_TAG_LIST T ON FT.TAG_NO = T.TAG_NO
      LEFT JOIN PTB_FEED_LIKE L ON F.FEED_NO = L.FEED_NO 
      WHERE (F.FEED_TITLE LIKE ? OR F.FEED_CONTENTS LIKE ? OR T.TAG_NAME LIKE ? OR F.QUOTE_BACKGROUND LIKE ?)
      GROUP BY F.FEED_NO, F.USER_ID, F.FEED_TITLE, F.FEED_CONTENTS, F.QUOTE_BACKGROUND, F.CREATE_FEED_DATE
      ORDER BY F.CREATE_FEED_DATE DESC
    `;

    let [list] = await db.query(sql, [q, q, q, q]);

// ... (이후 코드는 동일)

    const formattedList = list.map(feed => ({
      ...feed,
      imgPaths: feed.imgPaths ? feed.imgPaths.split(',') : [],
      tags: feed.tags ? feed.tags.split(',') : []
    }));

    res.json({ list: formattedList, result: "success" });

  } catch (error) {
    console.error("피드 목록 조회 중 오류:", error);
    res.status(500).json({ list: [], result: "fail", msg: "서버 오류 발생" });
  }
});





// ----------------------
// 사용자별 피드 조회
// ----------------------
router.get("/:userId", async (req, res) => {
  let {userId} = req.params;
  try {
    let sql = `
      SELECT 
        F.FEED_NO AS id, 
        F.USER_ID, 
        F.FEED_TITLE,     
        F.FEED_CONTENTS,    
        F.QUOTE_BACKGROUND,    
        F.CREATE_FEED_DATE AS CREATE_DATE, 
        GROUP_CONCAT(DISTINCT I.IMG_PATH) AS imgPaths,
        GROUP_CONCAT(DISTINCT T.TAG_NAME) AS tags,
        COUNT(DISTINCT L.FEED_LIKE_NO) AS TOTAL_LIKES
      FROM PTB_FEED F 
      LEFT JOIN PTB_FEED_IMG I ON F.FEED_NO = I.FEED_NO
      LEFT JOIN PTB_FEED_TAG FT ON F.FEED_NO = FT.FEED_NO
      LEFT JOIN PTB_TAG_LIST T ON FT.TAG_NO = T.TAG_NO
      LEFT JOIN PTB_FEED_LIKE L ON F.FEED_NO = L.FEED_NO
      WHERE F.USER_ID = ? 
      GROUP BY F.FEED_NO, F.USER_ID, F.FEED_TITLE, F.FEED_CONTENTS, F.QUOTE_BACKGROUND, F.CREATE_FEED_DATE
      ORDER BY F.CREATE_FEED_DATE DESC
    `;

    let [list] = await db.query(sql, [userId]);

    const formattedList = list.map(feed => ({
      ...feed,
      imgPaths: feed.imgPaths ? feed.imgPaths.split(',') : [],
      tags: feed.tags ? feed.tags.split(',') : []
    }));

    res.json({ list: formattedList, result: "success" });

  } catch (error) {
    console.error("피드 조회 중 에러 발생:", error);
    res.status(500).json({ list: [], result: "fail", msg: "서버 오류" });
  }
});


// ----------------------
// 댓글 관련 API
// ----------------------
router.post('/comment', authMiddleware, async (req, res) => {
  const USER_ID = req.user.userId;
  const { feedNo, feedComment } = req.body; 
  if (!feedNo || !feedComment) return res.status(400).json({ msg: "피드 번호와 댓글 내용은 필수입니다." });

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const sql = `INSERT INTO PTB_FEED_COMMENT (FEED_NO, USER_ID, FEED_COMMENT, CREATE_COMMENT_DATE) VALUES (?, ?, ?, NOW())`;
    const [result] = await connection.query(sql, [feedNo, USER_ID, feedComment]);
    
    await connection.commit();
    res.status(201).json({ result: "success", msg: "댓글이 성공적으로 등록되었습니다.", insertId: result.insertId });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("댓글 등록 오류:", error);
    res.status(500).json({ msg: "서버 오류로 인해 댓글 등록에 실패했습니다." });
  } finally {
    if (connection) connection.release();
  }
});

router.get('/comments/:feedNo', async (req, res) => {
  const { feedNo } = req.params;
  if (!feedNo) return res.status(400).json({ msg: "피드 번호가 누락되었습니다." });

  try {
    const sql = `SELECT C.FEED_COMMENT_NO AS id, C.FEED_COMMENT AS text, C.USER_ID AS user, C.CREATE_COMMENT_DATE AS createDate
           FROM PTB_FEED_COMMENT C
           WHERE C.FEED_NO = ?
           ORDER BY C.CREATE_COMMENT_DATE ASC`;
    const [list] = await db.query(sql, [feedNo]);
    res.json({ result: "success", list });
  } catch (error) {
    console.error("댓글 목록 조회 오류:", error);
    res.status(500).json({ msg: "댓글 목록을 불러오는 중 서버 오류가 발생했습니다." });
  }
});

router.delete('/comment/:commentNo', authMiddleware, async (req, res) => {
  const { commentNo } = req.params;
  const USER_ID = req.user.userId; 
  if (!commentNo) return res.status(400).json({ msg: "댓글 번호가 누락되었습니다." });

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const checkSql = "SELECT USER_ID FROM PTB_FEED_COMMENT WHERE FEED_COMMENT_NO = ?";
    const [commentRows] = await connection.query(checkSql, [commentNo]);
    if (commentRows.length === 0) return res.status(404).json({ msg: "존재하지 않는 댓글입니다." });
    if (commentRows[0].USER_ID !== USER_ID) return res.status(403).json({ msg: "댓글 삭제 권한이 없습니다." });

    const deleteSql = "DELETE FROM PTB_FEED_COMMENT WHERE FEED_COMMENT_NO = ?";
    const [result] = await connection.query(deleteSql, [commentNo]);
    
    await connection.commit();
    res.status(200).json({ result: "success", msg: "댓글이 성공적으로 삭제되었습니다." });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("댓글 삭제 오류:", error);
    res.status(500).json({ msg: "서버 오류로 인해 댓글 삭제에 실패했습니다." });
  } finally {
    if (connection) connection.release();
  }
});

// ----------------------
// 피드 태그 삭제 (⭐️ feedId -> feedNo로 수정)
// ----------------------
router.delete('/tag/:feedNo/:tagName', authMiddleware, async (req, res) => {
  const { feedNo, tagName } = req.params; // ⭐️ feedId -> feedNo로 수정
  const currentUserId = req.user.userId;
  const currentUserStatus = req.user.status;

  if (!feedNo || !tagName) return res.status(400).json({ msg: "피드 번호와 태그명이 필요합니다." });

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1) 피드 존재 여부 확인
    const [feedRows] = await connection.query("SELECT USER_ID FROM PTB_FEED WHERE FEED_NO = ?", [feedNo]); // ⭐️ feedId -> feedNo로 수정
    if (feedRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ msg: "해당 피드가 존재하지 않습니다." });
    }

    const feedOwnerId = feedRows[0].USER_ID;
    if (currentUserStatus !== 'A' && currentUserId !== feedOwnerId) {
      await connection.rollback();
      return res.status(403).json({ msg: "❌ 태그 삭제 권한이 없습니다." });
    }

    // 2) 태그 존재 여부 확인
    const [tagRows] = await connection.query("SELECT TAG_NO FROM PTB_TAG_LIST WHERE TAG_NAME = ?", [tagName]);
    if (tagRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ msg: "삭제할 태그가 존재하지 않습니다." });
    }

    const tagNo = tagRows[0].TAG_NO;

    // 3) 피드-태그 연결 삭제
    const [deleteResult] = await connection.query(
      "DELETE FROM PTB_FEED_TAG WHERE FEED_NO = ? AND TAG_NO = ?",
      [feedNo, tagNo] // ⭐️ feedId -> feedNo로 수정
    );

    if (deleteResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ msg: "삭제할 태그 연결이 존재하지 않습니다." });
    }

    await connection.commit();
    res.json({ result: "success", msg: `태그 '${tagName}'가 삭제되었습니다.` });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("태그 삭제 오류:", err);
    res.status(500).json({ msg: "서버 오류로 태그 삭제에 실패했습니다." });
  } finally {
    if (connection) connection.release();
  }
}); 

// ----------------------
// 피드 태그 추가 (⭐️ feedId -> feedNo로 수정)
// ----------------------
router.post('/tag', authMiddleware, async (req, res) => {
  const { feedNo, tagName } = req.body; // ⭐️ feedId -> feedNo로 수정
  const currentUserId = req.user.userId;

  if (!feedNo || !tagName || !tagName.trim()) return res.status(400).json({ msg: "피드 번호와 태그명을 입력해주세요." }); // ⭐️ 에러 메시지 텍스트 변경

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1) 피드 존재 여부 확인
    const [feedRows] = await connection.query("SELECT USER_ID FROM PTB_FEED WHERE FEED_NO = ?", [feedNo]); // ⭐️ feedId -> feedNo로 수정
    if (feedRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ msg: "해당 피드가 존재하지 않습니다." });
    }

    const feedOwnerId = feedRows[0].USER_ID;
    if (currentUserId !== feedOwnerId) {
      await connection.rollback();
      return res.status(403).json({ msg: "❌ 태그 추가 권한이 없습니다." });
    }

    // 2) 태그 존재 여부 확인 후 없으면 추가
    let [tagRows] = await connection.query("SELECT TAG_NO FROM PTB_TAG_LIST WHERE TAG_NAME = ?", [tagName]);
    let tagNo;
    if (tagRows.length === 0) {
      const [insertTag] = await connection.query("INSERT INTO PTB_TAG_LIST (TAG_NAME) VALUES (?)", [tagName]);
      tagNo = insertTag.insertId;
    } else {
      tagNo = tagRows[0].TAG_NO;
    }

    // 3) 피드-태그 연결 확인 후 추가
    const [exists] = await connection.query("SELECT * FROM PTB_FEED_TAG WHERE FEED_NO = ? AND TAG_NO = ?", [feedNo, tagNo]); // ⭐️ feedId -> feedNo로 수정
    if (exists.length > 0) {
      await connection.rollback();
      return res.status(400).json({ msg: "이미 존재하는 태그입니다." });
    }

    await connection.query("INSERT INTO PTB_FEED_TAG (FEED_NO, TAG_NO) VALUES (?, ?)", [feedNo, tagNo]); // ⭐️ feedId -> feedNo로 수정

    await connection.commit();
    res.json({ result: "success", msg: `태그 '${tagName}'가 추가되었습니다.` });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("태그 추가 오류:", err);
    res.status(500).json({ msg: "서버 오류로 태그 추가에 실패했습니다." });
  } finally {
    if (connection) connection.release();
  }
});

// 좋아요 추가
router.post('/like', authMiddleware, async (req, res) => {
  const { feedNo, userId } = req.body;
  if (!feedNo || !userId) return res.status(400).json({ msg: "피드 번호와 사용자 ID 필요" });

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 중복 확인
    const [exists] = await connection.query(
      "SELECT * FROM PTB_FEED_LIKE WHERE FEED_NO = ? AND USER_ID = ?", 
      [feedNo, userId]
    );
    if (exists.length > 0) {
      await connection.rollback();
      return res.status(400).json({ msg: "이미 좋아요를 누르셨습니다." });
    }

    // 좋아요 추가
    await connection.query(
      "INSERT INTO PTB_FEED_LIKE (FEED_NO, USER_ID) VALUES (?, ?)",
      [feedNo, userId]
    );

    await connection.commit();
    res.json({ result: "success", msg: "좋아요가 등록되었습니다." });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("좋아요 추가 오류:", err);
    res.status(500).json({ msg: "서버 오류로 좋아요 등록 실패" });
  } finally {
    if (connection) connection.release();
  }
});


// 특정 사용자가 좋아요 누른 피드 목록 조회
router.get('/likes/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  try {
    const sql = "SELECT FEED_NO FROM PTB_FEED_LIKE WHERE USER_ID = ?";
    const [list] = await db.query(sql, [userId]);
    res.json({ result: "success", list });
  } catch (err) {
    console.error("좋아요 목록 조회 오류:", err);
    res.status(500).json({ result: "fail", list: [], msg: "서버 오류" });
  }
});

// ----------------------
// 좋아요 해제 (DELETE)
// ----------------------
router.delete('/like', authMiddleware, async (req, res) => {
    const { feedNo, userId } = req.query; 
    
    if (!feedNo || !userId) return res.status(400).json({ msg: "피드 번호와 사용자 ID 필요" });

    try {
      const [result] = await db.query(
          "DELETE FROM PTB_FEED_LIKE WHERE FEED_NO = ? AND USER_ID = ?",
          [feedNo, userId]
      );
      res.json({ result: result.affectedRows > 0 ? "success" : "fail", msg: result.affectedRows > 0 ? "좋아요 취소됨" : "좋아요가 없습니다." });
    } catch (err) {
      console.error("좋아요 삭제 오류:", err);
      res.status(500).json({ msg: "서버 오류" });
    }
});


// ----------------------
// 피드 삭제
// ----------------------
router.delete('/:feedNo', authMiddleware, async (req, res) => {
  let {feedNo} = req.params;
  const currentUserId = req.user.userId;
  const currentUserStatus = req.user.status;

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [feed] = await connection.query("SELECT USER_ID FROM PTB_FEED WHERE FEED_NO = ?", [feedNo]);
    if (feed.length === 0) {
      await connection.rollback();
      return res.status(404).json({ result: "fail", msg: "해당 피드가 존재하지 않습니다." });
    }

    const feedOwnerId = feed[0].USER_ID;
    if (currentUserStatus !== 'A' && currentUserId !== feedOwnerId) {
      await connection.rollback();
      return res.status(403).json({ result: "fail", msg: "❌ 피드 작성자 또는 관리자만 삭제할 수 있습니다." });
    }

    await connection.query("DELETE FROM PTB_FEED_COMMENT WHERE FEED_NO = ?", [feedNo]);
    await connection.query("DELETE FROM PTB_FEED_IMG WHERE FEED_NO = ?", [feedNo]);
    await connection.query("DELETE FROM PTB_FEED_TAG WHERE FEED_NO = ?", [feedNo]);
    const [result] = await connection.query("DELETE FROM PTB_FEED WHERE FEED_NO = ?", [feedNo]);

    await connection.commit();
    res.json({ result: result.affectedRows > 0 ? "success" : "fail", msg: result.affectedRows > 0 ? "삭제되었습니다." : "삭제 실패" });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error(error);
    res.status(500).json({ msg: "서버 오류로 인해 삭제에 실패했습니다." });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;