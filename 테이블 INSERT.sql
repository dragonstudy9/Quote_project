-- PTB_USER 테이블 생성
CREATE TABLE PTB_USER (
    USER_ID VARCHAR(200) PRIMARY KEY, -- PK
    USER_PASSWORD VARCHAR(500) NOT NULL,
    USER_NAME VARCHAR(100) NOT NULL,
    USER_EMAIL VARCHAR(100),
    USER_PHONE_NUMBER VARCHAR(20),
    USER_ADDR VARCHAR(200),
    USER_INTRODUCTION TEXT,
    USER_STATUS CHAR(1) NOT NULL DEFAULT 'U', -- 사용자 권한 (A: 관리자, U: 일반 사용자)
    USER_DATE TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PTB_FEED 테이블 생성
CREATE TABLE PTB_FEED (
    FEED_NO INT AUTO_INCREMENT PRIMARY KEY, -- PK, AUTO_INCREMENT
    USER_ID VARCHAR(200) NOT NULL, -- FK 역할
    FEED_TITLE VARCHAR(100) NOT NULL,
    FEED_CONTENTS TEXT,
    QUOTE_BACKGROUND TEXT,
    FEED_COUNT INT NOT NULL DEFAULT 0,
    CREATE_FEED_DATE TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PTB_FEED_COMMENT 테이블 생성
CREATE TABLE PTB_FEED_COMMENT (
    FEED_COMMENT_NO INT AUTO_INCREMENT PRIMARY KEY, -- PK, AUTO_INCREMENT
    FEED_NO INT NOT NULL, -- FK 역할
    USER_ID VARCHAR(200) NOT NULL, -- FK 역할
    FEED_COMMENT TEXT NOT NULL,
    FEED_COMMENT_LIKE INT NOT NULL DEFAULT 0,
    CREATE_COMMENT_DATE TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PTB_FEED_IMG 테이블 생성
CREATE TABLE PTB_FEED_IMG (
    FEED_IMG_NO INT AUTO_INCREMENT PRIMARY KEY, -- PK, AUTO_INCREMENT
    FEED_NO INT NOT NULL, -- FK 역할
    FEED_IMG_NAME VARCHAR(255) NOT NULL,
    IMG_PATH VARCHAR(500) NOT NULL,
    UPLOAD_FILE_DATE TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PTB_FEED_LIKE 테이블 생성
CREATE TABLE PTB_FEED_LIKE (
    FEED_LIKE_NO INT AUTO_INCREMENT PRIMARY KEY, -- PK, AUTO_INCREMENT
    USER_ID VARCHAR(200) NOT NULL, -- FK 역할
    FEED_NO INT NOT NULL, -- FK 역할
    FEED_LIKE_DATE TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY user_feed_like_unique (USER_ID, FEED_NO) -- 복합 UNIQUE 제약 조건
);

-- PTB_TAG_LIST 테이블 생성
CREATE TABLE PTB_TAG_LIST (
    TAG_NO INT AUTO_INCREMENT PRIMARY KEY, -- PK, AUTO_INCREMENT
    TAG_NAME VARCHAR(50) NOT NULL UNIQUE -- UNIQUE
);

-- PTB_FEED_TAG 테이블 생성 (N:M 연결 테이블)
CREATE TABLE PTB_FEED_TAG (
    FEED_TAG_NO INT AUTO_INCREMENT PRIMARY KEY, -- PK, AUTO_INCREMENT
    FEED_NO INT NOT NULL, -- FK 역할
    TAG_NO INT NOT NULL, -- FK 역할
    UNIQUE KEY feed_tag_unique (FEED_NO, TAG_NO) -- 복합 UNIQUE 제약 조건
);


-- 1. PTB_USER 데이터 추가
-- (비밀번호는 해시된 값이라고 가정)
INSERT INTO PTB_USER (USER_ID, USER_PASSWORD, USER_NAME, USER_EMAIL, USER_INTRODUCTION ) VALUES
('inspirer_u1', 'hashed_pass_alpha', '김영감', 'inspire@example.com', '자기소개입니다.'),
('seeker_u2', 'hashed_pass_beta', '이탐색', 'seeker@example.com', '자기소개입니다.'),
('developer_u3', 'hashed_pass_gamma', '박개발', 'dev@example.com', '자기소개입니다.');


-- 2. PTB_FEED 데이터 추가
-- 명언 1: USER_ID 'inspirer_u1' 작성
INSERT INTO PTB_FEED (USER_ID, FEED_TITLE, FEED_CONTENTS, QUOTE_BACKGROUND) VALUES
('inspirer_u1', '멈추지 않는 성장의 명언', '어제보다 나은 오늘이 될 수 있다면, 그것이 바로 성장이다.', ''),
-- 명언 2: USER_ID 'seeker_u2' 작성
('seeker_u2', '가장 중요한 가치', '가장 중요한 것은 꺾이지 않는 마음.', '');


-- 3. PTB_TAG_LIST 데이터 추가
INSERT INTO PTB_TAG_LIST (TAG_NAME) VALUES
('성장'), -- TAG_NO 1
('동기부여'), -- TAG_NO 2
('개발'), -- TAG_NO 3
('스포츠'); -- TAG_NO 4


-- 4. PTB_FEED_TAG 데이터 추가 (FEED_NO와 TAG_NO 연결)
-- FEED_NO 1: (태그: 성장, 동기부여, 개발)
INSERT INTO PTB_FEED_TAG (FEED_NO, TAG_NO) VALUES
(1, 1),
(1, 2),
(1, 3);
-- FEED_NO 2: (태그: 동기부여, 스포츠)
INSERT INTO PTB_FEED_TAG (FEED_NO, TAG_NO) VALUES
(2, 2),
(2, 4);


-- 5. PTB_FEED_COMMENT 데이터 추가
-- FEED_NO 1에 댓글
INSERT INTO PTB_FEED_COMMENT (FEED_NO, USER_ID, FEED_COMMENT) VALUES
(1, 'seeker_u2', '정말 와닿는 말이네요. 저도 이렇게 성장하고 싶어요.'),
(1, 'developer_u3', '배경을 보니 명언이 더욱 깊이 있게 느껴집니다.');
-- FEED_NO 2에 댓글
INSERT INTO PTB_FEED_COMMENT (FEED_NO, USER_ID, FEED_COMMENT) VALUES
(2, 'inspirer_u1', '저도 이 명언이 제 삶의 지표예요!');


-- 6. PTB_FEED_LIKE 데이터 추가 (좋아요 중복 방지 UNIQUE 제약 조건 확인 가능)
-- USER_ID 'seeker_u2'가 두 명언 모두에 '좋아요'
INSERT INTO PTB_FEED_LIKE (USER_ID, FEED_NO) VALUES
('seeker_u2', 1),
('seeker_u2', 2);
-- USER_ID 'developer_u3'가 FEED_NO 1에 '좋아요'
INSERT INTO PTB_FEED_LIKE (USER_ID, FEED_NO) VALUES
('developer_u3', 1);

-- 7. PTB_FEED_IMG 데이터 추가
-- FEED_NO 1에 이미지 추가 (예시)
INSERT INTO PTB_FEED_IMG (FEED_NO, FEED_IMG_NAME, IMG_PATH) VALUES
(1, '성장 배경 이미지', '/uploads/images/feed1_growth.jpg');