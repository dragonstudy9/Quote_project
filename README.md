# 명언집 SNS

## 1. 📌 프로젝트 주제
react를 활용한 SNS 사이트 만들기

## 2. 💡 프로젝트 소개
명언집 SNS는 여러분이 소중하게 생각하는 명언을 SNS 상에 올려서 다른 분들과 공유할 수 있는 사이트입니다.
마음의 위안과 영감을 얻어보세요!

## 3. 👨‍👩‍👦‍👦 팀원 구성
 <table>
    <tr>
        <th>이름</th>                    
        <th>GitHub 프로필</th>
    </tr>
    <tr>
        <td>조원정</td>
        <td>https://github.com/dragonstudy9</td>
    </tr>
</table>

## 4. ⏱️ 개발 기간  
**2025.11.25 ~ 2025.12.2 (1주간)**

## 5. 🛠 사용 기술
| 분류 | 기술 |
|------|------|
| Frontend | ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) |
| Backend | ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) |
| Database | ![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white) |
| AI | ![ChatGPT](https://img.shields.io/badge/chatGPT-74aa9c?style=for-the-badge&logo=openai&logoColor=white) ![Google Gemini](https://img.shields.io/badge/google%20gemini-8E75B2?style=for-the-badge&logo=google%20gemini&logoColor=white)

## 6. 🖼️ 기획 및 설계

### 기획

![alt text](./readme_img/개요.png)

### DB설계

![alt text](./readme_img/PTB_USER.png)

![alt text](./readme_img/PTB_FEED.png)

![alt text](./readme_img/PTB_FEED_COMMENT.png)

![alt text](./readme_img/PTB_FEED_IMG.png)

![alt text](./readme_img/PTB_FEED_LIKE.png)

![alt text](./readme_img/PTB_FEED_TAG.png)

![alt text](./readme_img/PTB_TAG_LIST.png)

## 7. 📑 페이지별 주요 기능 

### 1. 로그인

- 아이디와 비밀번호가 MySQL DB에 저장된 고객정보와 일치하면 로그인 할 수 있다.
- 모든 사용자는 로그인을 해야 명언집 SNS 서비스를 사용할 수 있다.
- 회원가입이 안되있는 사용자를 위해 회원가입 버튼을 통해 회원가입 페이지로 바로 이동할 수 있도록 하였다.

<p align="center">
  <img src="./readme_img/로그인.png" alt="로그인" width="700"/>
</p>

### 2. 회원가입

- 입력된 ID가 DB에 있는지 중복 확인을 해야 회원가입을 진행할 수 있다.
- 이메일, 휴대폰 번호, 주소는 입력하지 않아도 회원가입이 가능하다.
- 휴대폰 번호를 입력한다면 휴대폰 11자리를 입력해야 회원가입이 가능하다. 

<p align="center">
  <img src="./readme_img/회원가입.png" alt="회원가입" width="700"/>
</p>

### 3. 전체 명언 & 나의 명언

- 사용자는 제목, 내용, 태그를 검색할 수 있다. 
- '좋아요 누르기'를 누르면 좋아요 기록이 생성되고 해당 버튼은 사라진다. 대신 '좋아요 취소' 버튼이 보여지고 이 버튼을 누르면 해당 좋아요 기록이 지워진다.
- 다양한 사용자들이 좋아요를 누른 총 횟수를 화면 상에 보여준다.
- 자신이 만든 피드는 삭제할 수 있다.

<p align="center">
  <img src="./readme_img/전체명언.png" alt="전체명언" width="700"/>
</p>

<p align="center">
  <img src="./readme_img/나의명언.png" alt="나의명언" width="700"/>
</p>

### 4. 상세보기(피드를 눌렀을 때 뜨는 모달 창)

- 제목과 전체 내용을 확인할 수 있다.
- 사용자들이 작성한 댓글을 확인할 수 있다.
- 자신이 작성한 댓글은 삭제할 수 있다.

<p align="center">
  <img src="./readme_img/피드 상세보기.png" alt="피드 상세보기" width="700"/>
</p>

### 5. 등록

- 제목, 내용, 명언 출처, 태그를 입력할 수 있다.
- 이미지 첨부파일은 필수가 아니지만 있으면 피드에서 보여지는 이미지로 사용된다. 

<p align="center">
  <img src="./readme_img/등록.png" alt="등록" width="700"/>
</p>

### 6. 마이페이지

- 로그인한 사용자 아이디와 이름, 작성한 게시글 총 수, 자기소개, 이메일, 전화번호, 주소를 확인하거나 수정할 수 있다.
- 회원 탈퇴 버튼을 통해 회원탈퇴도 가능하다.

<p align="center">
  <img src="./readme_img/마이페이지.png" alt="마이페이지" width="700"/>
</p>

## 8. 🎇 프로젝트 후기

 - React를 사용해서 기본적인 SNS 사이트를 만들어 보았다. 
 - 디자인은 mui를 사용하여 시간을 절약할 수 있었다. 
 - 명언을 읽으면서 마음을 한 번 다잡을 수 있었다.


### 아쉬웠던 점

 - 회원가입 페이지에서 이메일, 휴대폰 번호, 주소는 입력하지 않아도 회원가입이 가능하다는 점을 미처 추가하지 못한 점
 - 팔로우, 팔로잉 미구현
 - 이미지를 오직 한 개만 올릴 수 있게 수정하는 편이 바람직 할 것 같다.
 - 피드 수정 하는 기능 미구현
 - 업로드한 파일의 한글명이 깨지는 문제
 - 마이페이지에서 자기소개에 대한 정보를 저장하고는 있지만 활용하지 못함
 - 피드 검색 기능이 제목, 내용, 태그 각각 따로 검색하지는 못함