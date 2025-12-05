-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        8.0.44 - MySQL Community Server - GPL
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.13.0.7147
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- mysqldb 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `mysqldb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `mysqldb`;

-- 테이블 mysqldb.ptb_feed 구조 내보내기
CREATE TABLE IF NOT EXISTS `ptb_feed` (
  `FEED_NO` int NOT NULL AUTO_INCREMENT,
  `USER_ID` varchar(200) NOT NULL,
  `FEED_TITLE` varchar(100) NOT NULL,
  `FEED_CONTENTS` text,
  `QUOTE_BACKGROUND` text,
  `FEED_COUNT` int NOT NULL DEFAULT '0',
  `CREATE_FEED_DATE` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FEED_NO`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mysqldb.ptb_feed:~8 rows (대략적) 내보내기
INSERT INTO `ptb_feed` (`FEED_NO`, `USER_ID`, `FEED_TITLE`, `FEED_CONTENTS`, `QUOTE_BACKGROUND`, `FEED_COUNT`, `CREATE_FEED_DATE`) VALUES
	(32, 'user01', '변화에 대한 태도', '변화를 원하지 않는 사람은 운명이 있다고 믿고, 변화를 원하는 사람은 기회가 있다고 믿는다.', '벤저민 디즈레일리', 0, '2025-12-03 00:23:42'),
	(33, 'user01', '마음', '무사태평으로 보이는 사람들도 마음 속 깊은 곳을 두드려보면 어딘가 슬픈 소리가 난다.', '나쓰메 소세키 <나는 고양이로소이다>', 0, '2025-12-03 00:27:12'),
	(34, 'user02', '아버지의 가르침', '"누구든 남을 비판하고 싶을 때면 언제나 이 점을 명심하여라." 아버지는 이렇게 말씀하셨다. "이 세상 사람이 다 너처럼 유리한 입장에 놓여 있지는 않다는 것을 말이다."', '스콧 피츠제럴드 <위대한 개츠비>', 0, '2025-12-03 00:39:17'),
	(35, 'user02', '상대방의 관점에서 봐라', '여름이 오면 나는 가끔 메인 주에 낚시를 간다. 나는 딸기와 초콜릿을 좋아하는데, 물고기는 지렁이가 더 좋은 모양이다. 그래서 낚시 갈 때에는 내가 좋아하는 것보다 물고기가 좋아하는 것을 더 생각하게 되고 챙기게 된다. 낚시 바늘에는 딸기나 초콜릿을 매달지 않고 지렁이나 메뚜기를 드리워 놓고 맛있게 먹어라 하고 말한다. 그런데 왜 사람들에게는 이와 같은 방법으로 대하지 않는가?', '데일 카네기 <인간관계론>', 0, '2025-12-03 00:44:58'),
	(36, 'user04', '니체의 말', '살아야 할 이유를 가진 사람은 어떤 어려움도 견뎌낼 수 있다.', '프리드리히 니체', 0, '2025-12-03 00:50:33'),
	(37, 'user04', '아름다운 질문', '끊임없이 생각하고 아름다운 질문을 찾자.\r\n아름다운 질문을 하는 사람은 언제나 아름다운 대답을 얻는다.', 'E. E. 커밍스', 0, '2025-12-03 00:51:23'),
	(38, 'user05', '얽매이지 마라.', '무언가에 얽매여 살기는 쉽다. 남들이 믿는 대로 따라 하면 그만이다. 하지만 그건 자신의 눈으로 세상을 봐야 하는 책임을 버리는 짓이며 스스로를 포기하는 일이다.', '<조커게임> 유키중령', 0, '2025-12-03 01:29:52'),
	(39, 'user05', '이 또한 지나가리라.', '이 또한 지나가리라.', '고대 페르시아 속담', 0, '2025-12-03 01:36:01');

-- 테이블 mysqldb.ptb_feed_comment 구조 내보내기
CREATE TABLE IF NOT EXISTS `ptb_feed_comment` (
  `FEED_COMMENT_NO` int NOT NULL AUTO_INCREMENT,
  `FEED_NO` int NOT NULL,
  `USER_ID` varchar(200) NOT NULL,
  `FEED_COMMENT` text NOT NULL,
  `FEED_COMMENT_LIKE` int NOT NULL DEFAULT '0',
  `CREATE_COMMENT_DATE` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FEED_COMMENT_NO`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mysqldb.ptb_feed_comment:~1 rows (대략적) 내보내기
INSERT INTO `ptb_feed_comment` (`FEED_COMMENT_NO`, `FEED_NO`, `USER_ID`, `FEED_COMMENT`, `FEED_COMMENT_LIKE`, `CREATE_COMMENT_DATE`) VALUES
	(27, 39, 'user02', '시간은 언제나 흘러가지요.', 0, '2025-12-03 01:43:23');

-- 테이블 mysqldb.ptb_feed_img 구조 내보내기
CREATE TABLE IF NOT EXISTS `ptb_feed_img` (
  `FEED_IMG_NO` int NOT NULL AUTO_INCREMENT,
  `FEED_NO` int NOT NULL,
  `FEED_IMG_NAME` varchar(255) NOT NULL,
  `IMG_PATH` varchar(500) NOT NULL,
  `UPLOAD_FILE_DATE` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FEED_IMG_NO`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mysqldb.ptb_feed_img:~8 rows (대략적) 내보내기
INSERT INTO `ptb_feed_img` (`FEED_IMG_NO`, `FEED_NO`, `FEED_IMG_NAME`, `IMG_PATH`, `UPLOAD_FILE_DATE`) VALUES
	(10, 32, '1764721422073-ë³í.jpg', 'http://localhost:3010/uploads/1764721422073-ë³í.jpg', '2025-12-03 00:23:42'),
	(11, 33, '1764721632549-ë§ì.jpg', 'http://localhost:3010/uploads/1764721632549-ë§ì.jpg', '2025-12-03 00:27:12'),
	(12, 34, '1764722357899-ìë²ì§.jpg', 'http://localhost:3010/uploads/1764722357899-ìë²ì§.jpg', '2025-12-03 00:39:17'),
	(13, 35, '1764722698725-ëì.jpg', 'http://localhost:3010/uploads/1764722698725-ëì.jpg', '2025-12-03 00:44:58'),
	(14, 36, '1764723033418-ì´ìì¼í  ì´ì .jpg', 'http://localhost:3010/uploads/1764723033418-ì´ìì¼í  ì´ì .jpg', '2025-12-03 00:50:33'),
	(15, 37, '1764723083963-ìë¦ë¤ì´ ì§ë¬¸.jpg', 'http://localhost:3010/uploads/1764723083963-ìë¦ë¤ì´ ì§ë¬¸.jpg', '2025-12-03 00:51:23'),
	(16, 38, '1764725392814-í´ë°©.jpg', 'http://localhost:3010/uploads/1764725392814-í´ë°©.jpg', '2025-12-03 01:29:52'),
	(17, 39, '1764725761292-ìê°.jpg', 'http://localhost:3010/uploads/1764725761292-ìê°.jpg', '2025-12-03 01:36:01');

-- 테이블 mysqldb.ptb_feed_like 구조 내보내기
CREATE TABLE IF NOT EXISTS `ptb_feed_like` (
  `FEED_LIKE_NO` int NOT NULL AUTO_INCREMENT,
  `USER_ID` varchar(200) NOT NULL,
  `FEED_NO` int NOT NULL,
  `FEED_LIKE_DATE` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`FEED_LIKE_NO`),
  UNIQUE KEY `user_feed_like_unique` (`USER_ID`,`FEED_NO`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mysqldb.ptb_feed_like:~25 rows (대략적) 내보내기
INSERT INTO `ptb_feed_like` (`FEED_LIKE_NO`, `USER_ID`, `FEED_NO`, `FEED_LIKE_DATE`) VALUES
	(1, 'seeker_u2', 1, '2025-11-25 03:58:07'),
	(2, 'seeker_u2', 2, '2025-11-25 03:58:07'),
	(3, 'developer_u3', 1, '2025-11-25 03:58:07'),
	(4, 'user04', 22, '2025-12-01 09:04:11'),
	(6, 'user04', 21, '2025-12-01 09:04:19'),
	(9, 'user05', 23, '2025-12-01 09:24:45'),
	(10, 'user05', 22, '2025-12-01 09:29:12'),
	(11, 'user05', 21, '2025-12-01 09:29:39'),
	(12, 'user05', 1, '2025-12-01 09:39:45'),
	(13, 'user05', 2, '2025-12-01 09:54:51'),
	(14, 'user05', 24, '2025-12-01 10:05:45'),
	(15, 'user05', 25, '2025-12-01 10:08:53'),
	(16, 'user05', 26, '2025-12-01 10:10:45'),
	(38, 'user05', 29, '2025-12-02 04:02:08'),
	(39, 'user05', 28, '2025-12-02 04:02:12'),
	(55, 'user04', 1, '2025-12-02 05:56:21'),
	(56, 'user04', 26, '2025-12-02 08:19:19'),
	(57, 'user05', 32, '2025-12-03 01:38:19'),
	(58, 'user05', 33, '2025-12-03 01:38:21'),
	(59, 'user05', 34, '2025-12-03 01:38:22'),
	(60, 'user05', 35, '2025-12-03 01:38:22'),
	(61, 'user05', 36, '2025-12-03 01:38:24'),
	(64, 'user05', 37, '2025-12-03 01:39:53'),
	(65, 'user02', 38, '2025-12-03 01:44:23'),
	(66, 'user02', 39, '2025-12-03 01:44:25');

-- 테이블 mysqldb.ptb_feed_tag 구조 내보내기
CREATE TABLE IF NOT EXISTS `ptb_feed_tag` (
  `FEED_TAG_NO` int NOT NULL AUTO_INCREMENT,
  `FEED_NO` int NOT NULL,
  `TAG_NO` int NOT NULL,
  PRIMARY KEY (`FEED_TAG_NO`),
  UNIQUE KEY `feed_tag_unique` (`FEED_NO`,`TAG_NO`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mysqldb.ptb_feed_tag:~11 rows (대략적) 내보내기
INSERT INTO `ptb_feed_tag` (`FEED_TAG_NO`, `FEED_NO`, `TAG_NO`) VALUES
	(45, 32, 35),
	(46, 33, 36),
	(47, 34, 37),
	(48, 34, 38),
	(49, 35, 39),
	(50, 35, 40),
	(51, 36, 41),
	(52, 37, 42),
	(53, 38, 41),
	(54, 38, 43),
	(55, 39, 44);

-- 테이블 mysqldb.ptb_tag_list 구조 내보내기
CREATE TABLE IF NOT EXISTS `ptb_tag_list` (
  `TAG_NO` int NOT NULL AUTO_INCREMENT,
  `TAG_NAME` varchar(50) NOT NULL,
  PRIMARY KEY (`TAG_NO`),
  UNIQUE KEY `TAG_NAME` (`TAG_NAME`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mysqldb.ptb_tag_list:~40 rows (대략적) 내보내기
INSERT INTO `ptb_tag_list` (`TAG_NO`, `TAG_NAME`) VALUES
	(1, '성장'),
	(2, '동기부여'),
	(3, '개발'),
	(4, '스포츠'),
	(5, '여'),
	(6, '행'),
	(11, '바다'),
	(12, '음식'),
	(13, '여행'),
	(14, '섬'),
	(15, '해양'),
	(16, '자연'),
	(17, '가'),
	(18, '나'),
	(19, '다'),
	(20, '라'),
	(21, '마'),
	(22, '바'),
	(23, '사'),
	(24, '책'),
	(25, '자바'),
	(26, '잡아'),
	(27, '사사'),
	(28, '로렘입숨'),
	(29, '아무말'),
	(30, 'df'),
	(31, '사과'),
	(32, '과주'),
	(33, '2112'),
	(34, '123'),
	(35, '변화'),
	(36, '마음'),
	(37, '개츠비'),
	(38, '아버지'),
	(39, '낚시'),
	(40, '관계'),
	(41, '삶'),
	(42, '질문'),
	(43, '얽매임'),
	(44, '속담');

-- 테이블 mysqldb.ptb_user 구조 내보내기
CREATE TABLE IF NOT EXISTS `ptb_user` (
  `USER_ID` varchar(200) NOT NULL,
  `USER_PASSWORD` varchar(500) NOT NULL,
  `USER_NAME` varchar(100) NOT NULL,
  `USER_EMAIL` varchar(100) DEFAULT NULL,
  `USER_PHONE_NUMBER` varchar(20) DEFAULT NULL,
  `USER_ADDR` varchar(200) DEFAULT NULL,
  `USER_INTRODUCTION` text,
  `USER_STATUS` char(1) NOT NULL DEFAULT 'U',
  `USER_DATE` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`USER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 mysqldb.ptb_user:~17 rows (대략적) 내보내기
INSERT INTO `ptb_user` (`USER_ID`, `USER_PASSWORD`, `USER_NAME`, `USER_EMAIL`, `USER_PHONE_NUMBER`, `USER_ADDR`, `USER_INTRODUCTION`, `USER_STATUS`, `USER_DATE`) VALUES
	('admin', '$2b$10$IzSRz0mU6q5VCyG32CBgfe9qJ4luxXMc6jrjt95PxJlhqL/9slxFa', 'admin', 'admin@admin.com', '010-1234-9999', '인천 부평', '관리자입니다.', 'A', '2025-11-26 00:47:32'),
	('developer_u3', 'hashed_pass_gamma', '박개발', 'dev@example.com', NULL, NULL, NULL, 'U', '2025-11-25 03:58:07'),
	('inspirer_u1', 'hashed_pass_alpha', '김영감', 'inspire@example.com', NULL, NULL, NULL, 'U', '2025-11-25 03:58:07'),
	('seeker_u2', 'hashed_pass_beta', '이탐색', 'seeker@example.com', NULL, NULL, NULL, 'U', '2025-11-25 03:58:07'),
	('user001', '$2b$10$Q7InfQ/EoxiQajPtmmjKuehEdLbT2Yp2J1JBJB8kE7SZ.lRKK3vlK', 'user001', 'test@test.com', '010-1234-1234', '인천 부평', '소개', 'U', '2025-11-26 00:50:50'),
	('user002', '$2b$10$rInUuiy3EVa38oH3gSgIj.DDnNn.DY0kU9nlOzS5SV7FsBI/3yab.', 'user002', '', '', '', NULL, 'U', '2025-11-26 00:51:38'),
	('user003', '$2b$10$mViSHaDyasL1WAXBh5FixOkFrEVZUC5a.q1VKO5L6HlbmPqwvqKIW', 'user003', 'test@test.com', '01012345678', '인천 부평', '', 'U', '2025-11-26 02:00:22'),
	('user004', '$2b$10$SwYBkWB69WRd1wVzbwjmeOTZULQbgrMug6TZYqV2Ub0Gv1sJ7/fky', 'user004', '', '', '', '고객입니다.', 'U', '2025-11-26 02:05:43'),
	('user005', '$2b$10$bHcMJ8cgiraLZXEseDHGNOPulcaGkk9rcpBqec6GW4l41.WkIpfHi', 'user005', '', '', '', NULL, 'U', '2025-11-26 02:09:56'),
	('user006', '$2b$10$6FiBoo659MTg53/0oG8cw.hrWy3ygHkEWoKL94t7/k608O1YzKjmm', 'user006', 'test@test.com', '01012345678', '', '자기소개입니다.', 'U', '2025-11-27 06:31:10'),
	('user01', '$2b$10$dfoYPiKTByY3axF68Gk6d.1IJQiQ4UP69BLwmh9goh591bOOd9p3G', 'user01', 'test@test.com', '01100000000', '인천 부평', '자기소개\n', 'U', '2025-11-27 00:32:18'),
	('user02', '$2b$10$gEqUzv6VIm0JibF09ZtvGeSbO5yViyuHot.mCc7jcW5tX7dwjbGRC', 'user002', 'button@sdfds', '00011122200', 'a', '', 'U', '2025-11-27 00:35:31'),
	('user04', '$2b$10$pnXpwt7YN3/DwN7UWoAylu2SYIjCbOsVFjIvTzxiF8PSVW4Fe0Mga', 'user04', 'test@test.com', '', '인천 부평', 'Hello world!\n', 'U', '2025-11-27 00:30:59'),
	('user05', '$2b$10$qOLr3sFO6KzGYsKvvsAgteGtJ4YddWyhJsDN/Xk9jCRg1J.xgP2.W', 'user05', 'abc', '01011233546', '인천 부평', '자기소개입니다.', 'U', '2025-12-01 09:24:31'),
	('user06', '$2b$10$h6K/6TL92u88Krxv4tN6Y.EsPF93qOiJv4G73eSrDxv8KcMi.9FZy', 'user06', 'test@test.com', '01000000110', '인천 부평', '자기소개입니다.', 'U', '2025-12-02 08:41:01'),
	('user07', '$2b$10$5DDM74XJifXQmEzrokOgauqv9bYZ3D06YXEmFeQvFDH3owBx1W6de', 'user07', 'user004', '', '', '자기소개입니다.', 'U', '2025-12-02 08:45:42'),
	('user7', '$2b$10$saUvXPxCLt.KcU..nY9U.unRHvTXq21wIWrkNYZd9Q2gB6FlAcwWu', 'user7', 'email.esf', '01077660000', '인천 부평', '자기소개입니다.', 'U', '2025-12-02 08:45:09');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
