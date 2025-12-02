import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Avatar, Grid, Button, TextField } from '@mui/material'; 
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import profileImage from '../img/user_profile.png'; 

function MyPage() {
  const [user, setUser] = useState();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // 자기소개 및 기타 정보 상태
  const [newIntro, setNewIntro] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddr, setNewAddr] = useState('');

  // 사용자 정보 로딩
  const fnGetUser = () => {
    const token = localStorage.getItem("token");
    if(!token){ alert("로그인 해주세요!"); navigate("/"); return; }
    const decoded = jwtDecode(token);

    fetch("http://localhost:3010/user/" + decoded.userId)
      .then(res => res.json())
      .then(data => {
        if (data.user) { 
          setUser(data.user); 
          setNewIntro(data.user.intro || '');
          setNewEmail(data.user.USER_EMAIL || '');
          setNewPhone(data.user.USER_PHONE_NUMBER || '');
          setNewAddr(data.user.USER_ADDR || '');
        }
      })
      .catch(() => alert("사용자 정보를 불러오는데 실패했습니다."));
  }

  // 정보 저장 핸들러
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:3010/user/update-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          newIntro, 
          newEmail, 
          newPhone, 
          newAddr
        })
      });
      const data = await response.json();
      if (response.ok) { 
        alert("정보가 성공적으로 수정되었습니다.");
        setIsEditing(false);
        fnGetUser(); 
      } else {
        alert(`❌ 수정 실패: ${data.msg || '서버 오류'}`);
      }
    } catch {
      alert("네트워크 오류 발생");
    }
  };

  // 회원 탈퇴
  const handleWithdrawal = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!window.confirm("정말로 회원 탈퇴하시겠습니까?")) return;

    try {
      const response = await fetch("http://localhost:3010/user/withdrawal", {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) { localStorage.removeItem("token"); navigate("/", { replace: true }); }
      else alert(`❌ 탈퇴 실패: ${data.msg || '서버 오류'}`);
    } catch { alert("네트워크 오류"); }
  };

  useEffect(() => { fnGetUser(); }, []);

  return (
    <Container maxWidth="md">
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" sx={{ padding: '30px' }}>
        
        {/* 프로필 */}
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ marginBottom: 4 }}>
          <Avatar alt="프로필 이미지" src={profileImage} sx={{ width: 120, height: 120, mb:2 }} />
          <Typography variant="h4" sx={{ fontWeight:'bold' }}>{user?.userName}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            @{user?.userId}
          </Typography>
        </Box>

        {/* 게시물 */}
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          <Grid item xs={12} textAlign="center">
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>게시물</Typography>
            <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>{user?.cnt || 0}</Typography>
          </Grid>
        </Grid>

        {/* 정보 수정 */}
        <Box sx={{ marginTop: 3, width: '100%' }}>
          <Typography variant="h5" sx={{ mb:1 }}>
            내 정보
            <Button 
              size="medium"
              onClick={() => { isEditing ? handleSave() : setIsEditing(true); }}
              sx={{ marginLeft: 2 }}
            >
              {isEditing ? '저장' : '수정'}
            </Button>
          </Typography>

          {/* 자기소개 */}
          {isEditing ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="자기소개"
              value={newIntro}
              onChange={(e) => setNewIntro(e.target.value)}
              variant="outlined"
              margin="normal"
              sx={{ fontSize:'1.2rem' }}
            />
          ) : (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', border: '1px solid #eee', padding: '12px', borderRadius: '6px', fontSize: '1.2rem' }}>
              {user?.intro || '자기소개를 입력해주세요.'}
            </Typography>
          )}

          {/* 이메일, 전화번호, 주소 */}
          <TextField
            fullWidth
            label="이메일"
            margin="normal"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            variant="outlined"
            InputProps={{ readOnly: !isEditing }}
          />
          <TextField
            fullWidth
            label="전화번호"
            margin="normal"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            variant="outlined"
            InputProps={{ readOnly: !isEditing }}
          />
          <TextField
            fullWidth
            label="주소"
            margin="normal"
            value={newAddr}
            onChange={(e) => setNewAddr(e.target.value)}
            variant="outlined"
            InputProps={{ readOnly: !isEditing }}
          />
        </Box>

        {/* 회원 탈퇴 */}
        <Box sx={{ marginTop: 50, width: '100%', textAlign: 'center' }}>
          <Typography variant="body1" color="error" sx={{ mb:1, fontSize:'1.1rem' }}>
            계정을 영구적으로 삭제하려면 아래 버튼을 클릭하세요.
          </Typography>
          <Button variant="outlined" color="error" onClick={handleWithdrawal} fullWidth sx={{ fontSize:'1.1rem' }}>
            회원 탈퇴
          </Button>
        </Box>

      </Box>
    </Container>
  );
}

export default MyPage;
