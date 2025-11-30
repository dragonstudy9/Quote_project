import { Drawer, List, ListItem, ListItemText, Typography, Toolbar, ListItemIcon, Button, Box } from '@mui/material';
import { Home, Add, AccountCircle, ExitToApp } from '@mui/icons-material';
import AppsIcon from '@mui/icons-material/Apps';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect } from 'react';


function Menu() {

  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [userStatus, setUserStatus] = useState(null); // 관리자 권한을 위해 추가

  // Menu 함수 내부 또는 외부에 정의
  const getCurrentUserStatus = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // 🔑 토큰에 저장된 'status' 필드를 반환합니다.
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

  // 🔑 로그아웃 처리 함수
  const fnLogout = () => {
    // 1. JWT 토큰 제거
    localStorage.removeItem("token");
    // 2. 상태 초기화
    setIsLoggedIn(false);
    setUserStatus(null);
    
    alert("로그아웃 되었습니다.");
    navigate("/"); 
  };

useEffect(() => {
    // 🔑 컴포넌트 마운트 시 사용자 상태를 체크합니다.
    setUserStatus(getCurrentUserStatus());
  }, []);



  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240, // 너비 설정
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240, // Drawer 내부의 너비 설정
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Typography variant="h6" component="div" sx={{ p: 2 }}>
        SNS 메뉴
      </Typography>
      <List>

        {/* <ListItem button component={Link} to="/feedList">
          <ListItemIcon>
            <AppsIcon />
          </ListItemIcon>
          <ListItemText primary="전체 피드" />
        </ListItem> */}

        {userStatus === 'A' ? (
          // 🔑 USER_STATUS가 'A' (Admin) 일 경우
          <ListItem button component={Link} to="/admin">
          <ListItemIcon>
            <AppsIcon />
          </ListItemIcon>
          <ListItemText primary="전체 피드" />
        </ListItem>
        ) : (
          // 🔑 그 외의 경우 (일반 사용자)
          <ListItem button component={Link} to="/feedList">
          <ListItemIcon>
            <AppsIcon />
          </ListItemIcon>
          <ListItemText primary="전체 피드" />
        </ListItem>
        )}

        <ListItem button component={Link} to="/myFeed">
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary="나의 피드" />
        </ListItem>
        <ListItem button component={Link} to="/register">
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText primary="등록" />
        </ListItem>
        <ListItem button component={Link} to="/mypage">
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="마이페이지" />
        </ListItem>

        {isLoggedIn && (
            <ListItem button onClick={fnLogout} sx={{ cursor: 'pointer' }}> 
                <ListItemIcon>
                    <ExitToApp />
                </ListItemIcon>
                <ListItemText primary="로그아웃" />
            </ListItem>
        )}

        {/* <ListItem button component={Link} to="/mui">
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary="mui테스트" />
        </ListItem> */}


      </List>
    </Drawer>
  );
};

export default Menu;