import React, { useRef } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function Join() {
  let navigate = useNavigate();
  let userId = useRef();
  let pwd = useRef();
  let userName = useRef();
  let userEmail = useRef();
  let userPhoneNumber = useRef();
  let userAddr = useRef();
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
          회원가입
        </Typography>
        
        <TextField inputRef={userId} label="ID" variant="outlined" margin="normal" fullWidth />
        <TextField
          label="Password"
          variant="outlined"
          margin="normal"
          fullWidth
          type="password"
          inputRef={pwd}
        />
        <TextField inputRef={userName} label="Username" variant="outlined" margin="normal" fullWidth />
        <TextField inputRef={userEmail} label="Email" variant="outlined" margin="normal" fullWidth />
        <TextField inputRef={userPhoneNumber} label="Phone" variant="outlined" margin="normal" fullWidth />
        <TextField inputRef={userAddr} label="Addr" variant="outlined" margin="normal" fullWidth />
        <Button 
            variant="contained" 
            color="primary" 
            fullWidth style={{ marginTop: '20px' }}
            onClick={()=>{

              if(!userId.current.value){
                alert("아이디를 입력해주세요!");
                return;
              }

              if(!pwd.current.value){
                alert("비밀번호를 입력해주세요!");
                return;
              }

              if(!userName.current.value){
                alert("성함을 입력해주세요!");
                return;
              }

              let param = {
                userId : userId.current.value,
                pwd : pwd.current.value,
                userName : userName.current.value,
                userEmail : userEmail.current.value,
                userPhoneNumber : userPhoneNumber.current.value,
                userAddr : userAddr.current.value
              };

              fetch("http://localhost:3010/user/join", {
                method : "POST",
                headers : {
                  "Content-type" : "application/json"
                },
                body : JSON.stringify(param)
              })
                .then(res => res.json())
                .then(data => {
                  console.log(data);
                  alert(data.msg);
                  navigate("/");

                })

            }}
        >
            회원가입
        </Button>
        <Typography variant="body2" style={{ marginTop: '10px' }}>
          이미 회원이라면? <Link to="/login">로그인</Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Join;