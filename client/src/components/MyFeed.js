import React, { useState, useEffect } from 'react';
import {
  Grid, Container, Box, Card, CardMedia, CardContent,
  Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Button, TextField, List, ListItem, ListItemText,
  ListItemAvatar, Avatar, InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

function MyFeed() {
  const [open, setOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [feeds, setFeeds] = useState([]);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      return jwtDecode(token).userId;
    } catch {
      return null;
    }
  };

  const fnFeeds = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후 이용해 주세요!");
      navigate("/");
      return;
    }

    const decoded = jwtDecode(token);

    fetch(`http://localhost:3010/feed/${decoded.userId}`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch user feeds'))
      .then(data => {
        const feedsData = data?.list || [];
        const formattedFeeds = feedsData.map(feed => ({
          ...feed,
          imgPath: feed.imgPaths?.length > 0 ? feed.imgPaths[0] : null,
          tags: feed.tags || []
        }));
        setFeeds(formattedFeeds);
      })
      .catch(error => console.error("내 피드 조회 실패:", error));
  };

  useEffect(() => { fnFeeds(); }, []);

  const handleClickOpen = (feed) => {
    setSelectedFeed(feed);
    setOpen(true);
    fnLoadComments(feed.id);
  };

  const handleClose = () => setOpen(false);

  const fnLoadComments = (feedNo) => {
    fetch(`http://localhost:3010/feed/comments/${feedNo}`)
      .then(res => res.ok ? res.json() : Promise.reject('댓글 로드 실패'))
      .then(data => setComments(data.list))
      .catch(() => setComments([]));
  };

  const handleAddComment = () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("로그인이 필요합니다.");
    if (!newComment.trim()) return alert("댓글을 입력해주세요.");
    const userId = jwtDecode(token).userId;

    const param = { feedNo: selectedFeed.id, feedComment: newComment };

    fetch("http://localhost:3010/feed/comment", {
      method: "POST",
      headers: { "Content-type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify(param)
    })
      .then(res => res.json())
      .then(data => {
        alert(data.msg);
        setNewComment('');
        setComments(prev => [...prev, { id: data.insertId, text: param.feedComment, user: userId }]);
      });
  };

  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    const response = await fetch(`http://localhost:3010/feed/comment/${commentId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const result = await response.json();
    if (response.ok) {
      alert(result.msg);
      fnLoadComments(selectedFeed.id);
    } else {
      alert(result.msg);
    }
  };

  const handleDeleteFeed = () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    fetch(`http://localhost:3010/feed/${selectedFeed.id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(() => {
        alert("✔️ 삭제되었습니다!");
        setOpen(false);
        fnFeeds();
      })
      .catch(error => console.error("삭제 에러:", error));
  };

  // 🔥 검색 시 제목, 내용, 태그 포함
  const filteredFeeds = feeds.filter(feed => {
    const keyword = searchText.toLowerCase();
    return (
      (feed.FEED_TITLE && feed.FEED_TITLE.toLowerCase().includes(keyword)) ||
      (feed.FEED_CONTENTS && feed.FEED_CONTENTS.toLowerCase().includes(keyword)) ||
      (feed.tags && feed.tags.some(tag => tag.toLowerCase().includes(keyword)))
    );
  });

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      {/* 검색창 */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="검색어를 입력하세요..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') setSearchText(searchText); }}
          InputProps={{ startAdornment: <InputAdornment position="start">🔍</InputAdornment> }}
        />
        <Button variant="contained" color="primary" onClick={() => setSearchText(searchText)}>검색</Button>
      </Box>

      <Typography variant="h5" mb={2}>👤 내 명언 목록</Typography>

      <Grid container spacing={4}>
        {filteredFeeds.map(feed => (
          <Grid item key={feed.id} xs={12} sm={6} md={4} lg={3}>
            <Card style={{ cursor: 'pointer' }} onClick={() => handleClickOpen(feed)}>
              {feed.imgPath && <CardMedia component="img" height="140" image={feed.imgPath} />}
              <CardContent>
                <Typography variant="h6">{feed.FEED_TITLE}</Typography>
                <Typography variant="body2" color="text.secondary">{feed.FEED_CONTENTS}</Typography>
                <Typography variant="caption" display="block" color="text.disabled">
                  {feed.USER_ID} - {new Date(feed.CREATE_DATE).toLocaleDateString()}
                </Typography>

                {/* 🔥 태그 표시 + 클릭 시 검색 */}
                <Box mt={1}>
                  {feed.tags.map((tag, idx) => (
                    <Button
                      key={idx}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                      onClick={() => setSearchText(tag)}
                    >
                      #{tag}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 상세 모달 */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedFeed?.FEED_TITLE}
          <IconButton onClick={handleClose} style={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedFeed?.imgPath && <Box mb={2}><img src={selectedFeed.imgPath} alt="Selected Feed" style={{ width: '100%', borderRadius: '4px' }} /></Box>}
          <Typography variant="body1" paragraph>{selectedFeed?.FEED_CONTENTS}</Typography>
          <Typography variant="caption" color="text.secondary">
            작성자: {selectedFeed?.USER_ID} | 날짜: {new Date(selectedFeed?.CREATE_DATE).toLocaleDateString()}
          </Typography>

          {/* 태그 표시 */}
          <Box mt={1} mb={2}>
            {selectedFeed?.tags.map((tag, idx) => (
              <Button key={idx} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} onClick={() => setSearchText(tag)}>
                #{tag}
              </Button>
            ))}
          </Box>

          {/* 댓글 영역 */}
          <Box mt={3}>
            <Typography variant="h6">댓글</Typography>
            <List>
              {comments.map(comment => (
                <ListItem key={comment.id} disablePadding>
                  <ListItemAvatar><Avatar>{comment.user.charAt(0)}</Avatar></ListItemAvatar>
                  <ListItemText primary={comment.text} secondary={comment.user} />
                  {getCurrentUserId() === comment.user && (
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteComment(comment.id)} size="small" sx={{ ml: 1 }}>
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
              onKeyDown={(e) => { if (e.key === 'Enter') { handleAddComment(); e.preventDefault(); } }}
            />
            <Button variant="contained" color="primary" onClick={handleAddComment} sx={{ marginTop: 1 }}>댓글 추가</Button>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDeleteFeed} color="primary">삭제</Button>
          <Button onClick={handleClose} color="primary">닫기</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MyFeed;
