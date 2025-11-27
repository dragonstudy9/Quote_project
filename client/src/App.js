import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Login from './components/Login';
import Join from './components/Join'; // Join으로 변경
import MyFeed from './components/MyFeed';
import FeedList from './components/FeedList';
import Register from './components/Register';
import MyPage from './components/MyPage';
import Menu from './components/Menu'; // Menu로 변경
import Mui from './components/Mui';
import AdminFeed from './components/AdminFeed';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || location.pathname === '/join';
  

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {!isAuthPage && <Menu />} {/* 로그인과 회원가입 페이지가 아닐 때만 Menu 렌더링 */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/myFeed" element={<MyFeed />} />
          <Route path="/feedList" element={<FeedList />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mui" element={<Mui />} />
          <Route path="/admin" element={<AdminFeed />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
