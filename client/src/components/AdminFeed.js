import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

// 📝 모든 피드를 가져오는 API 호출
function fnGetAllFeeds(setFeeds, navigate) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("관리자 권한이 필요합니다.");
        navigate("/");
        return;
    }

    // 💡 전체 피드 목록 API (GET /feed/list) 호출 (인증 포함)
    fetch("http://localhost:3010/feed/list", { 
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => {
        if (!res.ok) {
            // 401(비인증) 또는 403(권한 없음) 등의 에러 처리
            alert("피드 목록 로드 권한이 없거나 오류가 발생했습니다.");
            return { list: [] };
        }
        return res.json();
    })
    .then(data => {
        setFeeds(data.list || []);
    })
    .catch(error => console.error("피드 로드 오류:", error));
}


function AdminFeed() {
  const [feeds, setFeeds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 🔑 페이지 진입 시 관리자 권한 확인 및 피드 로드
    const token = localStorage.getItem("token");
    if (token) {
        const decoded = jwtDecode(token);
        // 관리자가 아니면 일반 피드 목록으로 리디렉션
        if (decoded.status !== 'A') {
            alert("관리자만 접근 가능합니다.");
            navigate("/feedList");
            return;
        }
    } else {
        navigate("/");
        return;
    }
    
    // 🔑 모든 피드 로드 시작
    fnGetAllFeeds(setFeeds, navigate);
  }, []);

  // 📝 피드 삭제 핸들러
  const handleDelete = (feedId) => {
    if (!window.confirm("정말로 이 피드를 삭제하시겠습니까?")) return;
    
    const token = localStorage.getItem("token");
    
    fetch(`http://localhost:3010/feed/${feedId}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => {
        if (res.status === 403) {
            alert("❌ 삭제 권한이 없습니다."); 
            throw new Error("No Permission");
        }
        if (!res.ok) {
            alert("피드 삭제에 실패했습니다.");
            throw new Error("Deletion Failed");
        }
        return res.json();
    })
    .then(() => {
        alert("✔️ 피드가 성공적으로 삭제되었습니다.");
        // 삭제 후 목록 새로고침
        fnGetAllFeeds(setFeeds, navigate);
    })
    .catch(error => {
        console.error("삭제 에러:", error);
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        관리자 페이지 - 전체 피드 목록
      </Typography>
      
      {/* 💡 피드 데이터가 없는 경우 */}
      {feeds.length === 0 ? (
        <Typography>현재 등록된 피드가 없습니다.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>#ID</TableCell>
                <TableCell>작성자 ID</TableCell>
                <TableCell>제목</TableCell>
                <TableCell>내용 (일부)</TableCell>
                <TableCell>작성일</TableCell>
                <TableCell align="center">관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feeds.map((feed) => (
                <TableRow key={feed.id} hover>
                  <TableCell>{feed.id}</TableCell>
                  <TableCell>{feed.USER_ID}</TableCell>
                  <TableCell>{feed.FEED_TITLE}</TableCell>
                  <TableCell>{feed.FEED_CONTENTS?.substring(0, 30)}...</TableCell>
                  <TableCell>{new Date(feed.CREATE_DATE).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <Button 
                      variant="contained" 
                      color="error" 
                      size="small"
                      onClick={() => handleDelete(feed.id)}
                    >
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default AdminFeed;