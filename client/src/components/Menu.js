import { Drawer, List, ListItem, ListItemText, Typography, Toolbar, ListItemIcon, Button, Box } from '@mui/material';
import { Home, Add, AccountCircle, ExitToApp } from '@mui/icons-material';
import AppsIcon from '@mui/icons-material/Apps';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect } from 'react';

function Menu() {

  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [userStatus, setUserStatus] = useState(null); 

  // 현재 로그인한 사용자 상태 가져오기
  const getCurrentUserStatus = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsLoggedIn(true);
        return decoded.status;
      } catch (e) {
        console.error("토큰 디코딩 실패:", e);
        setIsLoggedIn(false);
        return null;
      }
    }
    setIsLoggedIn(false);
    return null;
  };

  const fnLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserStatus(null);

    alert("로그아웃 되었습니다.");
    navigate("/"); 
  };

  useEffect(() => {
    setUserStatus(getCurrentUserStatus());
  }, []);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 260,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 260,
          boxSizing: 'border-box',
          background: "linear-gradient(180deg, #1f1f1f 0%, #2e2e2e 100%)",
          color: "#fff",
          borderRight: "1px solid rgba(255,255,255,0.15)"
        },
      }}
    >
      <Toolbar />

      {/* 🔥 사이드바 상단 명언 영역 */}
      <Box sx={{ p: 2, textAlign: "center", color: "#e0e0e0" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          오늘의 명언
        </Typography>
        <Typography variant="body2" sx={{ fontStyle: "italic", opacity: 0.9 }}>
          “성공은 작은 노력이 반복된 결과이다.”
        </Typography>
        <Typography variant="caption" sx={{ display: "block", mt: 1, opacity: 0.7 }}>
          - 로버트 콜리어
        </Typography>
      </Box>

      <List>

        {/* 전체 피드 */}
        {userStatus === 'A' ? (
          <ListItem
            button
            component={Link}
            to="/admin"
            sx={{
              color: "#eee",
              '&:hover': { background: "rgba(255,255,255,0.1)" }
            }}
          >
            <ListItemIcon><AppsIcon sx={{ color: "#fff" }} /></ListItemIcon>
            <ListItemText primary="전체 피드" />
          </ListItem>
        ) : (
          <ListItem
            button
            component={Link}
            to="/feedList"
            sx={{
              color: "#eee",
              '&:hover': { background: "rgba(255,255,255,0.1)" }
            }}
          >
            <ListItemIcon><AppsIcon sx={{ color: "#fff" }} /></ListItemIcon>
            <ListItemText primary="전체 피드" />
          </ListItem>
        )}

        {/* 나의 피드 */}
        <ListItem
          button
          component={Link}
          to="/myFeed"
          sx={{ color: "#eee", '&:hover': { background: "rgba(255,255,255,0.1)" } }}
        >
          <ListItemIcon><Home sx={{ color: "#fff" }} /></ListItemIcon>
          <ListItemText primary="나의 피드" />
        </ListItem>

        {/* 등록 */}
        <ListItem
          button
          component={Link}
          to="/register"
          sx={{ color: "#eee", '&:hover': { background: "rgba(255,255,255,0.1)" } }}
        >
          <ListItemIcon><Add sx={{ color: "#fff" }} /></ListItemIcon>
          <ListItemText primary="등록" />
        </ListItem>

        {/* 마이페이지 */}
        <ListItem
          button
          component={Link}
          to="/mypage"
          sx={{ color: "#eee", '&:hover': { background: "rgba(255,255,255,0.1)" } }}
        >
          <ListItemIcon><AccountCircle sx={{ color: "#fff" }} /></ListItemIcon>
          <ListItemText primary="마이페이지" />
        </ListItem>

        {/* 로그아웃 */}
        {isLoggedIn && (
          <ListItem
            button
            onClick={fnLogout}
            sx={{ color: "#eee", '&:hover': { background: "rgba(255,255,255,0.1)" } }}
          >
            <ListItemIcon><ExitToApp sx={{ color: "#fff" }} /></ListItemIcon>
            <ListItemText primary="로그아웃" />
          </ListItem>
        )}

      </List>
    </Drawer>
  );
};

export default Menu;
