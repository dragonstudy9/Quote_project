import React, { useState, useEffect } from 'react';
import {
  Grid, Container, Box, Card, CardMedia, CardContent,
  Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Button, TextField, List, ListItem, ListItemText,
  ListItemAvatar, Avatar, InputAdornment, Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

function FeedList() {
  const [open, setOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newTag, setNewTag] = useState('');
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
      .then(res => res.json())
      .then(data => {
        const feedsData = data?.list || [];
        const formattedFeeds = feedsData.map(feed => ({
          ...feed,
          imgPath: feed.imgPaths?.[0] || null,
          tags: feed.tags || []
        }));
        setFeeds(formattedFeeds);
      })
      .catch(() => alert("전체 피드 목록을 가져오는 중 오류가 발생했습니다."));
  };

  const fnLoadComments = (feedNo) => {
    fetch(`http://localhost:3010/feed/comments/${feedNo}`)
      .then(res => res.json())
      .then(data => setComments(data.list))
      .catch(() => setComments([]));
  };

  useEffect(() => {
    fnFeeds();
  }, []);

  const handleClickOpen = (feed) => {
    setSelectedFeed(feed);
    setOpen(true);
    fnLoadComments(feed.id);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFeed(null);
    setNewTag('');
  };

  const handleAddComment = () => {
    const token = localStorage.getItem("token");
    if (!token) { alert("로그인 후 댓글을 작성해주세요!"); navigate("/"); return; }
    if (!newComment.trim() || !selectedFeed) return;

    const userId = jwtDecode(token).userId;
    const param = { feedNo: selectedFeed.id, feedComment: newComment };

    fetch("http://localhost:3010/feed/comment", {
      method: "POST",
      headers: { "Content-type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(param)
    })
      .then(res => res.json())
      .then(data => {
        alert(data.msg);
        setNewComment('');
        setComments(prev => [...prev, { id: data.insertId, text: param.feedComment, user: userId }]);
      });
  };

  const handleDeleteComment = async (commentNo) => {
    if (!window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3010/feed/comment/${commentNo}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.msg);
        fnLoadComments(selectedFeed.id);
      }
    } catch {
      alert("댓글 삭제 중 오류 발생");
    }
  };

  const handleTagClick = (tag) => {
    setSearchTerm(tag);
    setSearchQuery(tag);
    fnFeeds(tag);
    handleClose();
  };

  const handleDeleteTag = async (tagName) => {
    if (!window.confirm(`태그 '${tagName}'를 삭제하시겠습니까?`)) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3010/feed/tag/${selectedFeed.id}/${encodeURIComponent(tagName)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.msg);
        setSelectedFeed(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagName) }));
      }
    } catch {
      alert("태그 삭제 중 오류 발생");
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim() || !selectedFeed) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3010/feed/tag", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ feedId: selectedFeed.id, tagName: newTag.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedFeed(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
        setNewTag('');
      }
    } catch {
      alert("태그 추가 중 오류 발생");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
        paddingTop: 4,
        paddingBottom: 6
      }}
    >
      <Container maxWidth="lg">

        {/* 검색창 */}
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          ✨ 전체 명언
        </Typography>
        <Box
          sx={{
            mb: 4,
            display: "flex",
            gap: 2,
            alignItems: "center"
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="명언을 검색해보세요…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fnFeeds(searchTerm); }}
            InputProps={{
              sx: { borderRadius: 3, backgroundColor: "white" },
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              )
            }}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 2,
              px: 3,        // 좌우 패딩만 설정
              py: 1.2,      // 상하 패딩 줄여서 정상 버튼 형태
              height: "auto",
              whiteSpace: "nowrap"
            }}
            onClick={() => fnFeeds(searchTerm)}
          >
            검색
          </Button>
        </Box>

        

        <Grid container spacing={4}>
          {feeds.map((feed) => (
            <Grid item key={feed.id} xs={12} sm={6} md={4} lg={3}>
              <Card
                onClick={() => handleClickOpen(feed)}
                sx={{
                  borderRadius: 4,
                  cursor: "pointer",
                  p: 1,
                  backgroundColor: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transition: "0.3s",
                  "&:hover": { boxShadow: "0 6px 18px rgba(0,0,0,0.15)", transform: "translateY(-3px)" }
                }}
              >
                <CardContent>
                  <FormatQuoteIcon sx={{ fontSize: 36, color: "#555" }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>
                    {feed.FEED_TITLE}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, fontStyle: "italic" }}
                  >
                    “{feed.FEED_CONTENTS}”
                  </Typography>

                  <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                    — {feed.QUOTE_BACKGROUND}
                  </Typography>

                  <Box mt={1}>
                    {feed.tags.map((tag, idx) => (
                      <Button
                        key={idx}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTagClick(tag);  // 기존 Chip에서 사용하던 클릭 이벤트 사용
                        }}
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
            <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Typography variant="h6" fontStyle="italic" gutterBottom>
              “{selectedFeed?.FEED_CONTENTS}”
            </Typography>

            <Typography variant="caption" color="text.secondary">
              출처: {selectedFeed?.QUOTE_BACKGROUND} | 피드 작성자: {selectedFeed?.USER_ID} | 작성일: {new Date(selectedFeed?.CREATE_DATE).toLocaleDateString()}
            </Typography>

            {/* 태그 관리 */}
            <Box mt={2}>
              {selectedFeed?.USER_ID === getCurrentUserId() && (
                <Box display="flex" gap={1} mb={2}>
                  <TextField
                    size="small"
                    placeholder="태그 입력"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(); }}
                  />
                  <Button variant="contained" onClick={handleAddTag}>추가</Button>
                </Box>
              )}

              {selectedFeed?.tags.map((tag, idx) => (
                <Chip
                  key={idx}
                  label={`#${tag}`}
                  onClick={() => handleTagClick(tag)}
                  onDelete={
                    selectedFeed.USER_ID === getCurrentUserId()
                      ? () => handleDeleteTag(tag)
                      : undefined
                  }
                  sx={{ mr: 0.5, mt: 0.5 }}
                />
              ))}
            </Box>

            {/* 댓글 */}
            <Box mt={3}>
              <Typography variant="h6">댓글</Typography>
              <List>
                {comments.map((c) => (
                  <ListItem key={c.id}>
                    <ListItemAvatar>
                      <Avatar>{c.user.charAt(0)}</Avatar>
                    </ListItemAvatar>

                    <ListItemText primary={c.text} secondary={c.user} />

                    {getCurrentUserId() === c.user && (
                      <IconButton onClick={() => handleDeleteComment(c.id)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </ListItem>
                ))}
              </List>

              <TextField
                fullWidth
                label="댓글 작성"
                size="small"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
              />
              <Button variant="contained" sx={{ mt: 1 }} onClick={handleAddComment}>
                등록
              </Button>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>닫기</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default FeedList;
