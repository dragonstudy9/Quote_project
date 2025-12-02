import React, { useRef, useState } from 'react'; // 👈 useState 추가
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
  
  // 🔑 중복 확인 상태 관리 (false: 미확인 또는 중복됨, true: 사용 가능)
  const [idChecked, setIdChecked] = useState(false);
  const [idMessage, setIdMessage] = useState('');

  // 1. 🔑 아이디 중복 확인 핸들러
  const handleIdCheck = async () => {
    const idValue = userId.current.value.trim();
    if (!idValue) {
      alert("아이디를 먼저 입력해주세요!");
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3010/user/check-id/${idValue}`);
      const data = await response.json();

      setIdMessage(data.msg); // 서버에서 받은 메시지 (사용 가능/중복) 설정
      
      if (!data.isDuplicate) {
        // 중복이 아닌 경우에만 상태를 true로 설정
        setIdChecked(true); 
        alert("✔️ " + data.msg);
      } else {
        // 중복인 경우 상태를 false로 재설정
        setIdChecked(false); 
        alert("❌ " + data.msg);
      }
    } catch (error) {
      setIdMessage("서버 통신 오류.");
      setIdChecked(false);
      alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  // 2. 🔑 최종 회원가입 핸들러
  const handleJoin = () => {
    // 🔑 Step 1: 아이디 중복 확인 여부 검사
    if (!idChecked) {
      alert(idMessage || "아이디 중복 확인을 먼저 해주세요.");
      return;
    }
    
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

    // 🔑 1. 휴대폰 번호 값 추출 및 공백 제거
    const phoneNumber = userPhoneNumber.current.value.trim();

    // 2. 🔑 휴대폰 번호 유효성 검사 로직 수정
    const phoneRegex = /^\d{11}$/;

    // 휴대폰 번호가 입력된 경우에만 유효성 검사 실시
    if (phoneNumber.length > 0) { 
        
        // 11자리 숫자가 아닌 경우 (입력했지만 형식이 틀린 경우)
        if (!phoneRegex.test(phoneNumber)) {
            alert("휴대폰 번호를 입력하셨다면 '-' 없이 정확히 11자리 숫자만 입력해야 합니다.");
            return;
        }
    }

    let param = {
      userId : userId.current.value,
      pwd : pwd.current.value,
      userName : userName.current.value,
      userEmail : userEmail.current.value,
      userPhoneNumber : phoneNumber,
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
        if (data.result) { // 서버에서 result:true를 응답할 경우에만 이동
            navigate("/");
        }
      })
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
          회원가입
        </Typography>
        
        <Box display="flex" width="100%" gap={1}>
          <TextField 
            inputRef={userId} 
            label="아이디" 
            variant="outlined" 
            margin="normal" 
            fullWidth 
            // 💡 아이디 값이 변경될 때마다 중복 확인 상태 초기화
            onChange={() => setIdChecked(false)} 
          />
          {/* 🔑 중복 확인 버튼 추가 */}
          <Button
            variant="outlined"
            onClick={handleIdCheck}
            style={{ marginTop: '16px', minWidth: '100px', height: '56px' }}
          >
            중복 확인
          </Button>
        </Box>
        
        {/* 🔑 중복 확인 메시지 출력 */}
        {idMessage && (
            <Typography variant="body2" 
                color={idChecked ? 'green' : 'red'} 
                style={{ alignSelf: 'flex-start', marginLeft: '5px', marginBottom: '10px' }}>
                {idMessage}
            </Typography>
        )}
        
        <TextField
          label="비밀번호"
          variant="outlined"
          margin="normal"
          fullWidth
          type="password"
          inputRef={pwd}
        />
        {/* ... 나머지 필드는 기존과 동일 ... */}
        <TextField inputRef={userName} label="사용자이름" variant="outlined" margin="normal" fullWidth />
        <TextField inputRef={userEmail} label="이메일" variant="outlined" margin="normal" fullWidth />
        <TextField inputRef={userPhoneNumber} label="휴대폰 번호('-' 는 빼고 입력해주세요!)" variant="outlined" margin="normal" fullWidth />
        <TextField inputRef={userAddr} label="주소" variant="outlined" margin="normal" fullWidth />
        
        <Button 
            variant="contained" 
            color={idChecked ? 'primary' : 'default'} // 중복 확인 완료 시에만 Primary 색상
            fullWidth 
            style={{ marginTop: '20px' }}
            onClick={handleJoin} // 수정된 핸들러 사용
            disabled={!idChecked} // 🔑 중복 확인 완료 시에만 버튼 활성화
        >
            회원가입
        </Button>
        <Typography variant="body2" style={{ marginTop: '10px' }}>
          이미 회원이라면? <Link to="/">로그인</Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Join;