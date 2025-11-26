import React, { useState, useEffect } from 'react';
import {
  Grid, AppBar, Toolbar, Typography, Container, Box,
  Card, CardMedia, CardContent, Dialog, DialogTitle,
  DialogContent, IconButton, DialogActions, Button,
  TextField, List, ListItem, ListItemText, ListItemAvatar, Avatar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

function MyFeed() {
  const [open, setOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [comments, setComments] = useState([]); // 댓글 상태는 그대로 유지
  const [newComment, setNewComment] = useState('');
  let navigate = useNavigate();
  let [feeds, setFeeds] = useState([]);

  // 1. ✅ 내 피드 목록을 가져오는 함수 (인증 필수)
  function fnFeeds() {
    const token = localStorage.getItem("token");
    if (!token) { 
      alert("로그인 후 이용해 주세요!");
      navigate("/");
      return;
    }
    
    // 🔑 JWT 디코딩하여 현재 사용자 ID 추출
    const decoded = jwtDecode(token); 

    fetch("http://localhost:3010/feed/" + decoded.userId) // 🔑 내 피드 API 호출
      .then(res => {
        if (!res.ok) {
            // 401, 403 등 인증/인가 오류는 여기서 처리 가능
            throw new Error('Failed to fetch user feeds');
        }
        return res.json();
      })
      .then(data => {
        // 🚨 안전성 확보: data.list가 존재하는지 확인
        const feedsData = data && data.list && data.result === "success" ? data.list : [];

        const formattedFeeds = feedsData.map(feed => ({
             ...feed,
             // imgPaths 배열에서 첫 번째 이미지만 CardMedia에 사용 (배열이 아닐 경우 대비)
             imgPath: feed.imgPaths && feed.imgPaths.length > 0 ? feed.imgPaths[0] : null
        }));
        setFeeds(formattedFeeds);
      })
      .catch(error => {
          console.error("내 피드 조회 실패:", error);
          alert("피드 목록을 가져오는 중 오류가 발생했습니다.");
      });
  }

  useEffect(() => {
    fnFeeds();
  }, []);

  // 2. 🔑 삭제 핸들러 함수
  const handleDelete = () => {
    if(!window.confirm("정말 삭제하시겠습니까?")) {
        return;
    }
    
    fetch("http://localhost:3010/feed/" + selectedFeed.id, {
        method: "DELETE", 
        headers : {
            "Authorization" : "Bearer " + localStorage.getItem("token") // 🔑 토큰 첨부
        }
    })
    .then(res => {
        if (res.status === 403) {
            alert("❌ 삭제 권한이 없습니다. (작성자 불일치)");
            throw new Error("No Permission");
        }
        if (!res.ok) {
            alert("피드 삭제에 실패했습니다.");
            throw new Error("Deletion Failed");
        }
        return res.json();
    })
    .then(data => {
        alert("✔️ 삭제되었습니다!");
        setOpen(false); 
        fnFeeds(); // 목록 새로고침
    })
    .catch(error => {
        console.error("삭제 에러:", error);
    });
  };

  // 3. 모달 열기/닫기 등 다른 로직은 유사하게 유지
  const handleClickOpen = (feed) => {
    setSelectedFeed(feed);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFeed(null);
  };
  
  // 댓글 관련 핸들러 (UI 편의상 유지)
  const handleAddComment = () => {
    if (newComment.trim() !== '') {
      setComments([...comments, { id: Date.now(), user: 'CurrentUser', text: newComment }]);
      setNewComment('');
    }
  };


  // 4. 컴포넌트 렌더링 (MyFeed는 삭제 버튼 포함)
  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Typography variant="h5" gutterBottom>
        👤 내 피드 목록
      </Typography>
      <Grid container spacing={4}>
        {feeds.map((feed) => (
          <Grid item key={feed.id} xs={12} sm={6} md={4} lg={3}>
            <Card style={{ cursor: 'pointer' }} onClick={() => handleClickOpen(feed)}>
              {feed.imgPath && (
                <CardMedia
                  component="img"
                  height="140"
                  image={feed.imgPath}
                  alt="Feed Image"
                />
              )}
              <CardContent>
                <Typography variant="h6" component="div">
                  {feed.FEED_TITLE || "제목 없음"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feed.FEED_CONTENTS}
                </Typography>
                <Typography variant="caption" display="block" color="text.disabled">
                  {feed.USER_ID} - {new Date(feed.CREATE_DATE).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* 상세 모달 다이얼로그 */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedFeed?.FEED_TITLE}
          <IconButton onClick={handleClose} style={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
            {selectedFeed?.imgPath && (
                <Box mb={2}>
                    <img src={selectedFeed.imgPath} alt="Selected Feed" style={{ width: '100%', borderRadius: '4px' }} />
                </Box>
            )}
            <Typography variant="body1" paragraph>
                {selectedFeed?.FEED_CONTENTS}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                작성자: {selectedFeed?.USER_ID} | 날짜: {new Date(selectedFeed?.CREATE_DATE).toLocaleDateString()}
            </Typography>

            {/* 댓글 목록 및 추가 UI (생략) */}
            <Box mt={3}>
                <Typography variant="h6">댓글</Typography>
                <List>
                    {comments.map((comment) => (
                        <ListItem key={comment.id} disablePadding>
                            <ListItemAvatar>
                                <Avatar>{comment.user.charAt(0)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={comment.text} secondary={comment.user} />
                        </ListItem>
                    ))}
                </List>
                <TextField
                    fullWidth
                    label="댓글 추가"
                    variant="outlined"
                    size="small"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleAddComment();
                            e.preventDefault();
                        }
                    }}
                />
                <Button variant="contained" color="primary" onClick={handleAddComment} sx={{ marginTop: 1 }}>
                    댓글 추가
                </Button>
            </Box>
        </DialogContent>
        {/* 🔑 삭제 버튼 포함 */}
        <DialogActions>
            <Button onClick={handleDelete} variant='contained' color="primary">
                삭제
            </Button>
            <Button onClick={handleClose} color="primary">
                닫기
            </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MyFeed;