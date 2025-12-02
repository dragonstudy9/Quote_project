import React, { useRef, useState } from 'react';
import { TextField, Button, Container, Typography, Box, Card, CardContent } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function Join() {
  let navigate = useNavigate();
  let userId = useRef();
  let pwd = useRef();
  let userName = useRef();
  let userEmail = useRef();
  let userPhoneNumber = useRef();
  let userAddr = useRef();

  const [idChecked, setIdChecked] = useState(false);
  const [idMessage, setIdMessage] = useState('');

  // 아이디 중복 확인
  const handleIdCheck = async () => {
    const idValue = userId.current.value.trim();
    if (!idValue) {
      alert("아이디를 먼저 입력해주세요!");
      return;
    }
    try {
      const response = await fetch(`http://localhost:3010/user/check-id/${idValue}`);
      const data = await response.json();
      setIdMessage(data.msg);
      setIdChecked(!data.isDuplicate);
      alert(data.msg);
    } catch (error) {
      setIdMessage("서버 통신 오류.");
      setIdChecked(false);
      alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  // 회원가입
  const handleJoin = () => {
    if (!idChecked) {
      alert(idMessage || "아이디 중복 확인을 먼저 해주세요.");
      return;
    }

    if (!userId.current.value || !pwd.current.value || !userName.current.value) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    const phoneNumber = userPhoneNumber.current.value.trim();
    if (phoneNumber && !/^\d{11}$/.test(phoneNumber)) {
      alert("휴대폰 번호를 입력하셨다면 '-' 없이 11자리 숫자만 입력해야 합니다.");
      return;
    }

    let param = {
      userId: userId.current.value,
      pwd: pwd.current.value,
      userName: userName.current.value,
      userEmail: userEmail.current.value,
      userPhoneNumber: phoneNumber,
      userAddr: userAddr.current.value
    };

    fetch("http://localhost:3010/user/join", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(param)
    })
      .then(res => res.json())
      .then(data => {
        alert(data.msg);
        if (data.result) navigate("/");
      });
  };

  // 텍스트 필드 스타일
  const sleekFieldStyle = {
    '& .MuiOutlinedInput-root': {
      color: '#000', // 입력 글자색
      backgroundColor: 'rgba(255,255,255,0.1)',
      '& fieldset': { borderColor: 'rgba(0,0,0,0.2)', transition: '0.3s' },
      '&:hover fieldset': { borderColor: '#1976d2' },
      '&.Mui-focused fieldset': { borderColor: '#1976d2', borderWidth: '2px' },
      borderRadius: 2
    },
    '& .MuiInputLabel-root': { color: '#666' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' },
    '& input': { color: '#000', caretColor: '#1976d2' }
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
        <Card elevation={6} sx={{ borderRadius: 4, padding: 3, backdropFilter: "blur(6px)" }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              회원가입
            </Typography>

            <Box display="flex" width="100%" gap={1}>
              <TextField
                inputRef={userId}
                label="ID"
                variant="outlined"
                margin="normal"
                fullWidth
                onChange={() => setIdChecked(false)}
                sx={{ ...sleekFieldStyle }}
              />
              <Button
                variant="outlined"
                onClick={handleIdCheck}
                style={{ marginTop: '16px', minWidth: '100px', height: '56px' }}
              >
                중복 확인
              </Button>
            </Box>

            {idMessage && (
              <Typography
                variant="body2"
                color={idChecked ? 'green' : 'red'}
                style={{ alignSelf: 'flex-start', marginLeft: '5px', marginBottom: '10px' }}
              >
                {idMessage}
              </Typography>
            )}

            <TextField inputRef={pwd} label="Password" type="password" fullWidth margin="normal" sx={{ ...sleekFieldStyle }} />
            <TextField inputRef={userName} label="사용자 이름" fullWidth margin="normal" sx={{ ...sleekFieldStyle }} />
            <TextField inputRef={userEmail} label="이메일" fullWidth margin="normal" sx={{ ...sleekFieldStyle }} />
            <TextField inputRef={userPhoneNumber} label="휴대폰 번호('-' 제외)" fullWidth margin="normal" sx={{ ...sleekFieldStyle }} />
            <TextField inputRef={userAddr} label="주소" fullWidth margin="normal" sx={{ ...sleekFieldStyle }} />

            <Button
              variant="contained"
              color={idChecked ? 'primary' : 'default'}
              fullWidth
              sx={{ mt: 3, py: 1.2, fontSize: "1.1rem", borderRadius: 2 }}
              onClick={handleJoin}
              disabled={!idChecked}
            >
              회원가입
            </Button>

            <Typography variant="body2" sx={{ mt: 2 }}>
              이미 회원이라면? <Link to="/">로그인</Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Join;
