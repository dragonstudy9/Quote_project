import React, { useRef } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // jwtDecode는 현재 사용되지 않지만, 다른 기능에서 사용될 수 있으므로 유지합니다.

function Login() {
  let navigate = useNavigate();
  let userId = useRef();
  let pwd = useRef();

  // 1. 🔑 로그인 로직을 별도의 함수로 분리
  const handleLogin = () => {
    let param = {
      userId: userId.current.value,
      userPassword: pwd.current.value,
    };

    fetch("http://localhost:3010/user/login", {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify(param)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            alert(data.msg || "로그인에 실패했습니다.");
            throw new Error('Authentication Failed');
          });
        }
        return res.json();
      })
      .then(data => {
        console.log(data);
        alert(data.msg);
        if (data.result) {
          localStorage.setItem("token", data.token);
          navigate("/feedList");
        }
      })
      .catch(error => {
        console.error("Fetch Error:", error);
      });
  };

  // 2. 🔑 엔터키 핸들러 함수 추가
  const handleKeyDown = (e) => {
    // 키 코드가 Enter (key: 'Enter' 또는 keyCode: 13)일 때만 로그인 함수 호출
    if (e.key === 'Enter') {
      handleLogin();
    }
  };


  return (
    <Container maxWidth="xs">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Typography variant="h4" gutterBottom>
          로그인
        </Typography>
        
        {/* 3. 🔑 ID 필드에 onKeyDown 이벤트 적용 */}
        <TextField 
          inputRef={userId} 
          label="ID" 
          variant="outlined" 
          margin="normal" 
          fullWidth 
          onKeyDown={handleKeyDown} 
        />
        
        {/* 3. 🔑 Password 필드에 onKeyDown 이벤트 적용 */}
        <TextField
          label="Password"
          variant="outlined"
          margin="normal"
          fullWidth
          type="password"
          inputRef={pwd}
          onKeyDown={handleKeyDown} // 🔑 엔터키 핸들러 적용
        />
        
        {/* 4. 🔑 버튼 onClick 이벤트에 핸들러 함수 연결 */}
        <Button 
          onClick={handleLogin} // 🔑 분리된 핸들러 함수 연결
          variant="contained" 
          color="primary" 
          fullWidth 
          style={{ marginTop: '20px' }}>
          로그인
        </Button>
        <Typography variant="body2" style={{ marginTop: '10px' }}>
          회원아니셈 ? <Link to="/join">회원가입</Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Login;