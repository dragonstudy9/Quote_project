import React, { useState, useEffect } from 'react';
import {
  Grid, AppBar, Toolbar, Typography, Container, Box,
  Card, CardMedia, CardContent, Dialog, DialogTitle,
  DialogContent, IconButton, DialogActions, Button,
  TextField, List, ListItem, ListItemText, ListItemAvatar, Avatar, InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

function FeedList() {
  const [open, setOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [comments, setComments] = useState([]); // 댓글 상태는 그대로 유지
  const [newComment, setNewComment] = useState('');
  let navigate = useNavigate();
  let [feeds, setFeeds] = useState([]);
  // 🔑 검색어 입력 상태 추가
  const [searchTerm, setSearchTerm] = useState('');
  // 🔑 실제 검색을 실행할 쿼리 상태 (검색 버튼/Enter 키 입력 시 업데이트)
  const [searchQuery, setSearchQuery] = useState('');


  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return decoded.userId;
      } catch (e) {
        console.error("토큰 디코딩 실패:", e);
        return null;
      }
    }
    return null;
  };

  // 1. ✅ 전체 피드 목록을 가져오는 함수 (인증 불필요)
  function fnFeeds(query = '') {

    // 💡 JWT 토큰 유무만 확인하고, 인증이 필요 없는 /list API를 호출합니다.
    const token = localStorage.getItem("token");
    if (!token) {
      // 토큰이 없으면 로그인 페이지로 이동 (선택적)
      alert("로그인 후 이용해 주세요!");
      navigate("/");
      return;
    }

    // 🔑 검색 쿼리 스트링 추가
    const queryString = query ? `?q=${encodeURIComponent(query)}` : '';

    fetch(`http://localhost:3010/feed/list${queryString}`) // 🔑 API 호출에 쿼리 스트링 추가
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        // 🚨 안전성 확보: data.list가 존재하는지 확인
        const feedsData = data && data.list && data.result === "success" ? data.list : [];

        const formattedFeeds = feedsData.map(feed => ({
          ...feed,
          // imgPaths 배열에서 첫 번째 이미지만 CardMedia에 사용
          imgPath: feed.imgPaths && feed.imgPaths.length > 0 ? feed.imgPaths[0] : null
        }));
        setFeeds(formattedFeeds);
      })
      .catch(error => {
        console.error("전체 피드 조회 실패:", error);
        alert("전체 피드 목록을 가져오는 중 오류가 발생했습니다.");
      });
  }

  // 2. ✅ 특정 피드의 댓글 목록을 가져오는 함수
  function fnLoadComments(feedNo) {
    fetch(`http://localhost:3010/feed/comments/${feedNo}`) // 🔑 댓글 조회 API 호출
      .then(res => {
        if (!res.ok) {
          throw new Error('댓글 로드 실패');
        }
        return res.json();
      })
      .then(data => {
        // 💡 댓글의 필드명을 서버 API에 맞게 매핑할 필요가 있습니다.
        // 서버에서 이미 id, text, user 필드명으로 맞춰주었으므로 바로 사용합니다.
        setComments(data.list);
      })
      .catch(error => {
        console.error("댓글 로드 에러:", error);
        setComments([]);
      });
  }

  useEffect(() => {
    fnFeeds();
  }, []);

  // 3. 모달 열기/닫기 등 다른 로직은 기존 Feed.js 로직과 유사하게 유지
  const handleClickOpen = (feed) => {
    setSelectedFeed(feed);
    setOpen(true);
    fnLoadComments(feed.id); // 🔑 피드를 열 때 해당 피드의 댓글을 로드
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFeed(null);
  };

  // 댓글 추가 핸들러 함수
  const handleAddComment = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후 댓글을 작성해주세요!");
      navigate("/");
      return;
    }

    // 1. 입력값 확인
    if (!newComment.trim()) {
      alert("댓글 내용을 입력해주세요!");
      return;
    }

    if (!selectedFeed) return;

    const decoded = jwtDecode(token);
    const userId = decoded.userId;

    // 2. 서버에 전송할 데이터 준비
    const param = {
      feedNo: selectedFeed.id,
      feedComment: newComment, // 🔑 서버 API에 맞춰 키를 'feedComment'로 설정
    };

    // 3. API 호출
    fetch("http://localhost:3010/feed/comment", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(param)
    })
      .then(res => {
        if (!res.ok) {
          // 서버 에러 처리 (4xx, 5xx)
          return res.json().then(err => {
            alert("댓글 등록 실패: " + (err.msg || "알 수 없는 오류"));
            throw new Error("API failed");
          });
        }
        return res.json();
      })
      .then(data => {
        // 4. 성공적으로 등록되면 UI 업데이트
        alert(data.msg);
        setNewComment(''); // 입력 필드 초기화

        // 5. 📢 댓글 목록을 상태에 추가하여 즉시 반영
        const newCommentObject = {
          id: data.insertId,
          text: param.feedComment, // 새로운 댓글 내용을 사용
          user: userId,
          // 💡 주의: 현재는 사용자 ID만 표시됩니다. 사용자 이름(userName)을 표시하려면 
          // 서버에서 댓글 조회 API를 만들 때 JOIN하여 사용자 이름도 가져와야 합니다.
        };

        setComments(prev => [...prev, newCommentObject]);

      })
      .catch(error => {
        console.error("댓글 등록 중 오류:", error);
      });
  };


  // 4. ✅ 댓글 삭제 함수
  const handleDeleteComment = async (commentNo) => {
    if (!window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3010/feed/comment/${commentNo}`, {
        method: 'DELETE',
        headers: {
          // 백엔드에서 인증 미들웨어를 사용하므로 토큰을 헤더에 추가해야 합니다.
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.msg);
        // 삭제 성공 후 댓글 목록 새로고침
        // fnLoadComments 함수를 selectedFeed의 feedNo와 함께 재호출
        if (selectedFeed) {
          console.log("댓글 삭제 후 댓글 목록 새로고침 selectedFeed:", selectedFeed.id);
          fnLoadComments(selectedFeed.id);
        }
      } else {
        alert("삭제 실패: " + data.msg);
      }

    } catch (error) {
      console.error("댓글 삭제 중 에러 발생:", error);
      alert("댓글 삭제 처리 중 오류가 발생했습니다.");
    }
  };

  // 4. 컴포넌트 렌더링 (FeedList는 삭제 버튼 없이 피드만 보여줌)
  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Box mt={3} mb={3} display="flex" gap={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="검색어를 입력하세요..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setSearchQuery(searchTerm);  // 실제 검색어 업데이트
              fnFeeds(searchTerm);         // 검색 실행
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">🔍</InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setSearchQuery(searchTerm);
            fnFeeds(searchTerm);
          }}
        >
          검색
        </Button>
      </Box>
      <Typography variant="h5" gutterBottom>
        🌐 전체 명언 목록
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

      {/* 상세 모달 다이얼로그 (생략된 부분은 기존 Feed.js와 유사하게 유지) */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedFeed?.FEED_TITLE}
          <IconButton onClick={handleClose} style={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {/* 이미지 표시 (첫 번째 이미지만) */}
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

          {/* 댓글 목록 및 추가 UI */}
          <Box mt={3}>
            <Typography variant="h6">댓글</Typography>
            <List>
              {comments.map((comment) => (
                <ListItem key={comment.id} disablePadding>
                  <ListItemAvatar>
                    <Avatar>{comment.user.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={comment.text} secondary={comment.user} />
                  {/* 🔑 현재 로그인 사용자와 댓글 작성자가 같을 때만 버튼 표시 */}
                  {getCurrentUserId() === comment.user && (
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteComment(comment.id)} // commentNo 대신 comment.id 사용
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
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

        <DialogActions>
          <Button onClick={handleClose} color="primary">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default FeedList;