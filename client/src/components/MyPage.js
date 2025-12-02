import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Avatar, Grid, Button, TextField } from '@mui/material'; 
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import profileImage from '../img/user_profile.png'; 

function MyPage() {
  let [user, setUser] = useState();
  let navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newIntro, setNewIntro] = useState('');

  // 🔑 함수 수정: 사용자 정보 로딩 및 상태 초기화
  function fnGetUser(){
    const token = localStorage.getItem("token");
    if(!token){
      alert("로그인 해주세요!");
      navigate("/");
      return;
    }
    
    const decoded = jwtDecode(token);

    fetch("http://localhost:3010/user/" + decoded.userId)
    .then(res => res.json())
    .then(data => {
      console.log(data);
      if (data.user) {
        setUser(data.user);
        setNewIntro(data.user.intro || ''); 
      }
    })
    .catch(error => {
      console.error("사용자 정보 로딩 중 오류:", error);
      alert("사용자 정보를 불러오는데 실패했습니다.");
    });
  }

  // 🔑 추가 3: 자기소개 수정 요청 핸들러
  const handleSaveIntro = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("로그인이 필요합니다!");
        return;
    }

    try {
        const response = await fetch("http://localhost:3010/user/intro", {
            method: "PUT", 
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ newIntro })
        });

        const data = await response.json();

        if (response.ok) {
            alert("✔️ 자기소개가 성공적으로 수정되었습니다.");
            setIsEditing(false); 
            fnGetUser(); 
        } else {
            alert(`❌ 수정 실패: ${data.msg || '서버 오류'}`);
        }
    } catch (error) {
        console.error("자기소개 수정 중 오류:", error);
        alert("네트워크 오류가 발생했습니다.");
    }
  };
  
  // 🚀 추가: 회원탈퇴 처리 핸들러
  const handleWithdrawal = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("로그인이 필요합니다!");
        navigate("/");
        return;
    }

    if (!window.confirm("정말로 회원 탈퇴하시겠습니까? 탈퇴하시면 모든 데이터가 삭제됩니다.")) {
        return;
    }

    try {
        // 서버의 새로운 DELETE 엔드포인트로 요청
        const response = await fetch("http://localhost:3010/user/withdrawal", {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ 회원 탈퇴가 성공적으로 완료되었습니다. 이용해 주셔서 감사합니다.");
            // 탈퇴 성공 시 토큰 삭제 및 홈으로 이동
            localStorage.removeItem("token");
            navigate("/", { replace: true }); // 히스토리 대체하여 뒤로가기 방지
        } else {
            alert(`❌ 탈퇴 실패: ${data.msg || '서버 오류가 발생했습니다.'}`);
        }
    } catch (error) {
        console.error("회원 탈퇴 중 오류:", error);
        alert("네트워크 오류로 회원 탈퇴에 실패했습니다.");
    }
  };


  useEffect(() => {
      fnGetUser();
  }, [])

  
  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start"
        minHeight="100vh"
        sx={{ padding: '20px' }}
      >
        {/* 프로필 정보 상단 배치 */}
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ marginBottom: 3 }}>
          <Avatar
            alt="프로필 이미지"
            src={profileImage} 
            sx={{ width: 100, height: 100, marginBottom: 2 }}
          />
          <Typography variant="h5">{user?.userName}</Typography>
          <Typography variant="body2" color="text.secondary">
            @{user?.userId}
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          <Grid item xs={12} textAlign="center">
            <Typography variant="h6">게시물</Typography>
            <Typography variant="body1">{user?.cnt || 0}</Typography>
          </Grid>
        </Grid>
        
        {/* 자기소개 영역 */}
        <Box sx={{ marginTop: 3, width: '100%' }}>
          <Typography variant="h6">
            내 소개
            <Button 
              size="small"
              onClick={() => {
                  if (isEditing) {
                      handleSaveIntro(); 
                  } else {
                      setIsEditing(true); 
                      setNewIntro(user?.intro || ''); 
                  }
              }}
              sx={{ marginLeft: 2 }}
            >
              {isEditing ? '저장' : '수정'}
            </Button>
          </Typography>
          
          {isEditing ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={newIntro}
              onChange={(e) => setNewIntro(e.target.value)}
              variant="outlined"
              margin="normal"
            />
          ) : (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
              {user?.intro || '자기소개를 입력해주세요.'}
            </Typography>
          )}
        </Box>

        {/* 🚀 추가: 회원탈퇴 버튼 영역 (가장 아래) */}
        <Box sx={{ marginTop: 100, width: '100%', borderTop: '1px solid #ccc', paddingTop: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="error" sx={{ marginBottom: 1 }}>
                계정을 영구적으로 삭제하려면 아래 버튼을 클릭하세요.
            </Typography>
            <Button
                variant="outlined"
                color="error"
                onClick={handleWithdrawal}
                fullWidth
            >
                회원 탈퇴
            </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default MyPage;