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

function FeedList() {
  const [open, setOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [feeds, setFeeds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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

  const fnFeeds = (query = '') => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후 이용해 주세요!");
      navigate("/");
      return;
    }

    const queryString = query ? `?q=${encodeURIComponent(query)}` : '';

    fetch(`http://localhost:3010/feed/list${queryString}`)
      .then(res => res.ok ? res.json() : Promise.reject('Network response was not ok'))
      .then(data => {
        const feedsData = data && data.list && data.result === "success" ? data.list : [];
        const formattedFeeds = feedsData.map(feed => ({
          ...feed,
          imgPath: feed.imgPaths && feed.imgPaths.length > 0 ? feed.imgPaths[0] : null,
          tags: feed.tags || []
        }));
        setFeeds(formattedFeeds);
      })
      .catch(error => {
        console.error("전체 피드 조회 실패:", error);
        alert("전체 피드 목록을 가져오는 중 오류가 발생했습니다.");
      });
  };

  const fnLoadComments = (feedNo) => {
    fetch(`http://localhost:3010/feed/comments/${feedNo}`)
      .then(res => res.ok ? res.json() : Promise.reject('댓글 로드 실패'))
      .then(data => setComments(data.list))
      .catch(error => {
        console.error("댓글 로드 에러:", error);
        setComments([]);
      });
  };

  useEffect(() => { fnFeeds(); }, []);

  const handleClickOpen = (feed) => {
    setSelectedFeed(feed);
    setOpen(true);
    fnLoadComments(feed.id);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFeed(null);
  };

  const handleAddComment = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후 댓글을 작성해주세요!");
      navigate("/");
      return;
    }

    if (!newComment.trim() || !selectedFeed) return;

    const userId = jwtDecode(token).userId;
    const param = { feedNo: selectedFeed.id, feedComment: newComment };

    fetch("http://localhost:3010/feed/comment", {
      method: "POST",
      headers: { "Content-type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify(param)
    })
      .then(res => res.ok ? res.json() : res.json().then(err => { alert(err.msg || "댓글 등록 실패"); throw new Error("API failed"); }))
      .then(data => {
        alert(data.msg);
        setNewComment('');
        setComments(prev => [...prev, { id: data.insertId, text: param.feedComment, user: userId }]);
      })
      .catch(error => console.error("댓글 등록 중 오류:", error));
  };

  const handleDeleteComment = async (commentNo) => {
    if (!window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`http://localhost:3010/feed/comment/${commentNo}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.msg);
        if (selectedFeed) fnLoadComments(selectedFeed.id);
      } else {
        alert("삭제 실패: " + data.msg);
      }
    } catch (error) {
      console.error("댓글 삭제 중 에러 발생:", error);
      alert("댓글 삭제 처리 중 오류가 발생했습니다.");
    }
  };

  // 🔥 태그 클릭 핸들러 (검색용)
  const handleTagClick = (tag) => {
    setSearchTerm(tag);
    setSearchQuery(tag);
    fnFeeds(tag);
    handleClose();
  };

  // 🔥 태그 삭제 핸들러
  const handleDeleteTag = async (tagName) => {
    if (!window.confirm(`태그 '${tagName}'를 삭제하시겠습니까?`)) return;
    try {
      const response = await fetch(`http://localhost:3010/feed/tag/${selectedFeed.id}/${encodeURIComponent(tagName)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.msg);
        // 삭제 후 selectedFeed 상태에서 태그 제거
        setSelectedFeed(prev => ({
          ...prev,
          tags: prev.tags.filter(tag => tag !== tagName)
        }));
        // 전체 feed 목록에서도 해당 태그 제거
        setFeeds(prevFeeds => prevFeeds.map(feed => 
          feed.id === selectedFeed.id 
            ? { ...feed, tags: feed.tags.filter(tag => tag !== tagName) } 
            : feed
        ));
      } else {
        alert("태그 삭제 실패: " + data.msg);
      }
    } catch (error) {
      console.error("태그 삭제 에러:", error);
      alert("태그 삭제 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      {/* 검색창 */}
      <Box mt={3} mb={3} display="flex" gap={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="검색어를 입력하세요..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setSearchQuery(searchTerm); fnFeeds(searchTerm); } }}
          InputProps={{ startAdornment: <InputAdornment position="start">🔍</InputAdornment> }}
        />
        <Button variant="contained" color="primary" onClick={() => { setSearchQuery(searchTerm); fnFeeds(searchTerm); }}>
          검색
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom>🌐 전체 명언 목록</Typography>

      <Grid container spacing={4}>
        {feeds.map((feed) => (
          <Grid item key={feed.id} xs={12} sm={6} md={4} lg={3}>
            <Card style={{ cursor: 'pointer' }} onClick={() => handleClickOpen(feed)}>
              {feed.imgPath && <CardMedia component="img" height="140" image={feed.imgPath} alt="Feed Image" />}
              <CardContent>
                <Typography variant="h6">{feed.FEED_TITLE || "제목 없음"}</Typography>
                <Typography variant="body2" color="text.secondary">{feed.FEED_CONTENTS}</Typography>
                <Typography variant="caption" display="block" color="text.disabled">
                  {feed.USER_ID} - {new Date(feed.CREATE_DATE).toLocaleDateString()}
                </Typography>
                {/* 🔥 태그 표시 */}
                <Box mt={1}>
                  {feed.tags.map((tag, idx) => (
                    <Button
                      key={idx}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                      onClick={(e) => { e.stopPropagation(); handleTagClick(tag); }}
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

          {/* 🔥 상세 모달 태그 + 삭제 */}
          <Box mt={1} mb={2}>
            {selectedFeed?.tags.map((tag, idx) => (
              <Box key={idx} display="inline-flex" alignItems="center" sx={{ mr: 0.5, mb: 0.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleTagClick(tag)}
                >
                  #{tag}
                </Button>
                 {/* ❌ 작성자 본인일 때만 삭제 버튼 */}
                {selectedFeed.USER_ID === getCurrentUserId() && (
                  <IconButton size="small" onClick={() => handleDeleteTag(tag)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>

          {/* 댓글 UI */}
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
            <Button variant="contained" color="primary" onClick={handleAddComment} sx={{ marginTop: 1 }}>
              댓글 추가
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">닫기</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default FeedList;
