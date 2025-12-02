import React, { useRef } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Login() {
  let navigate = useNavigate();
  let userId = useRef();
  let pwd = useRef();

  const handleLogin = () => {
    let param = {
      userId: userId.current.value,
      userPassword: pwd.current.value,
    };

    fetch("http://localhost:3010/user/login", {
      method: "POST",
      headers: { "Content-type": "application/json" },
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
        alert(data.msg);
        if (data.result) {
          localStorage.setItem("token", data.token);
          const decoded = jwtDecode(data.token);

          if (decoded.status === 'A') {
            navigate("/admin");
          } else {
            navigate("/feedList");
          }
        }
      })
      .catch(error => console.error("Fetch Error:", error));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Box 
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(90deg, #000000ff 0%, #f8f8f8ff 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 2
      }}
    >
      <Container maxWidth="xs">
        <Card 
          elevation={6}
          sx={{ 
            borderRadius: 4,
            padding: 3,
            backdropFilter: "blur(6px)"
          }}
        >
          <CardContent sx={{ textAlign: "center" }}>
            
            <Box 
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto 15px auto",
                boxShadow: 3
              }}
            >
              <LockOutlinedIcon sx={{ color: "#fff", fontSize: 32 }} />
            </Box>

            <Typography variant="h4" fontWeight="bold" gutterBottom>
              로그인
            </Typography>

            <TextField
              inputRef={userId}
              label="ID"
              variant="outlined"
              margin="normal"
              fullWidth
              onKeyDown={handleKeyDown}
              sx={{ mt: 2, borderRadius: 2 }}
            />

            <TextField
              inputRef={pwd}
              label="Password"
              variant="outlined"
              margin="normal"
              fullWidth
              type="password"
              onKeyDown={handleKeyDown}
              sx={{ mt: 1 }}
            />

            <Button
              onClick={handleLogin}
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                mt: 3,
                py: 1.2,
                fontSize: "1.1rem",
                borderRadius: 2,
                boxShadow: 3,
                ":hover": {
                  boxShadow: 6
                }
              }}
            >
              로그인
            </Button>

            <Typography variant="body2" sx={{ mt: 2 }}>
              회원이 아니신가요?  
              <Link 
                to="/join" 
                style={{ marginLeft: 5, textDecoration: "none", color: "#1976d2" }}
              >
                회원가입
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Login;