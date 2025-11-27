import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Avatar, Grid, Button, TextField } from '@mui/material'; // 🔑 Button, TextField 추가
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import profileImage from '../img/user_profile.png'; // 💡 이미지 경로 가정

function MyPage() {
  let [user, setUser] = useState();
  let navigate = useNavigate();
  // 🔑 추가 1: 편집 모드와 새 자기소개 내용 상태 관리
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
        // 🔑 추가 2: 사용자 정보 로딩 후 newIntro 상태도 DB 값으로 초기화
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
        // 💡 PUT 요청을 새롭게 추가한 서버 API로 보냅니다.
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
            setIsEditing(false); // 편집 모드 종료
            fnGetUser(); // 변경된 사용자 정보를 다시 불러와 화면 업데이트
        } else {
            alert(`❌ 수정 실패: ${data.msg || '서버 오류'}`);
        }
    } catch (error) {
        console.error("자기소개 수정 중 오류:", error);
        alert("네트워크 오류가 발생했습니다.");
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
            src={profileImage} // 프로필 이미지 경로
            sx={{ width: 100, height: 100, marginBottom: 2 }}
          />
          <Typography variant="h5">{user?.userName}</Typography>
          <Typography variant="body2" color="text.secondary">
            @{user?.userId}
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          <Grid item xs={4} textAlign="center">
            <Typography variant="h6">팔로워</Typography>
            <Typography variant="body1">{user?.follower || 0}</Typography>
          </Grid>
          <Grid item xs={4} textAlign="center">
            <Typography variant="h6">팔로잉</Typography>
            <Typography variant="body1">{user?.following || 0}</Typography>
          </Grid>
          <Grid item xs={4} textAlign="center">
            <Typography variant="h6">게시물</Typography>
            <Typography variant="body1">{user?.cnt || 0}</Typography>
          </Grid>
        </Grid>
        
        {/* 🔑 자기소개 영역 수정 */}
        <Box sx={{ marginTop: 3, width: '100%' }}>
          <Typography variant="h6">
            내 소개
            <Button 
              size="small"
              onClick={() => {
                  if (isEditing) {
                      handleSaveIntro(); // 저장 버튼 클릭 시 API 호출
                  } else {
                      setIsEditing(true); // 수정 버튼 클릭 시 편집 모드 시작
                      setNewIntro(user?.intro || ''); // 현재 내용을 TextField에 로드
                  }
              }}
              sx={{ marginLeft: 2 }}
            >
              {isEditing ? '저장' : '수정'}
            </Button>
          </Typography>
          
          {isEditing ? (
            // 🔑 편집 모드일 때: TextField (수정 가능)
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
            // 🔑 일반 모드일 때: Typography (읽기 전용)
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
              {user?.intro || '자기소개를 입력해주세요.'}
            </Typography>
          )}
        </Box>
        
        {/* ... 여기에 피드 목록 등이 위치할 수 있습니다. */}

      </Box>
    </Container>
  );
}

export default MyPage;