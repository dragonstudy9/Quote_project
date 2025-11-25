const express = require('express');
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../auth");
const multer = require('multer');


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// 3. api 호출
router.post('/upload', upload.array('file'), async (req, res) => {
    let {feedId} = req.body;
    const files = req.files;
    // const filename = req.file.filename; 
    // const destination = req.file.destination; 
    try{
        let results = [];
        let host = `${req.protocol}://${req.get("host")}/`;
        for(let file of files){
            let filename = file.filename;
            let destination = file.destination;
            let query = "INSERT INTO TBL_FEED_IMG VALUES(NULL, ?, ?, ?)";
            let result = await db.query(query, [feedId, filename, host + destination + filename]);
            results.push(result);
        }
        res.json({
            message : "result",
            result : results
        });
    } catch(err){
        console.log(err);
        res.status(500).send("Server Error");
    }
});


router.get("/:userId", async (req, res) => {
    console.log(`${req.protocol}://${req.get("host")}`);
    let {userId} = req.params;
    try {
        let sql = "SELECT * "
                + "FROM PTB_FEED F "
                + "INNER JOIN PTB_FEED_IMG I ON F.ID = I.FEEDID "
                + "WHERE F.USER_ID = ? "
        ;
        let [list] = await db.query(sql, [userId]); //비동기적으로 동작 -> await 처리
        // console.log(list);
        res.json({
            list : list,
            result : "success"
        });
    } catch (error) {
        console.log("에러 발생!");
        console.log(error);
    }
})

router.delete('/:feedId', authMiddleware, async (req, res) => {
    let {feedId} = req.params;
    // console.log(id);
    try {
        let sql = "DELETE FROM PTB_FEED WHERE FEED_NO = " + feedId;
        let result = await db.query(sql); //비동기적으로 동작 -> await 처리
        // console.log("result ==> " , result);
        res.json({
            result : result,
            msg : "success"
        });
    } catch (error) {
        console.log(error);
    }
})

router.post('/', async (req, res) => {
    let {userId, content} = req.body;
    console.log(content);
    try {
        let sql = "INSERT INTO PTB_FEED VALUES (NULL, ?, ?, NOW())";
        let result = await db.query(sql, [userId, content]); //비동기적으로 동작 -> await 처리
        console.log(result);
        res.json({
            result : result,
            msg : "success"
        });
    } catch (error) {
        console.log(error);
    }
})



module.exports = router;