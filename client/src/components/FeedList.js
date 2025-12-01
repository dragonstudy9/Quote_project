import React, { useState, useEffect } from 'react';
import {
  Grid, Container, Box, Card, CardContent,
  Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Button, TextField,
  InputAdornment, Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function FeedList() {
  const [open, setOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [feeds, setFeeds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [likedFeeds, setLikedFeeds] = useState([]); // 이미 좋아요 누른 피드
  const navigate = useNavigate();

  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try { return jwtDecode(token).userId; } 
    catch { return null; }
  };

  // --------------------------
  // 피드 목록 가져오기
  // --------------------------
  const fnFeeds = (query = '') => {
    const token = localStorage.getItem("token");
    if (!token) { alert("로그인 후 이용해 주세요!"); navigate("/"); return; }

    const queryString = query ? `?q=${encodeURIComponent(query)}` : '';
    fetch(`http://localhost:3010/feed/list${queryString}`)
      .then(res => res.json())
      .then(data => {
        const formattedFeeds = (data?.list || []).map(feed => ({
          ...feed,
          imgPath: feed.imgPaths?.[0] || null,
          tags: feed.tags || []
        }));
        setFeeds(formattedFeeds);
      })
      .catch(() => alert("전체 피드 목록을 가져오는 중 오류가 발생했습니다."));
  };

  // --------------------------
  // 댓글 로드
  // --------------------------
  const fnLoadComments = (feedNo) => {
    fetch(`http://localhost:3010/feed/comments/${feedNo}`)
      .then(res => res.json())
      .then(data => setComments(data.list))
      .catch(() => setComments([]));
  };

  // --------------------------
  // 서버에서 좋아요 목록 불러오기
  // --------------------------
  const fetchLikedFeeds = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const userId = jwtDecode(token).userId;

    try {
      const res = await fetch(`http://localhost:3010/feed/likes/${userId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.list) {
        setLikedFeeds(data.list.map(like => like.FEED_NO));
      }
    } catch (err) {
      console.error("좋아요 목록 불러오기 실패:", err);
    }
  };

  // --------------------------
  // 좋아요 클릭 → DB 기록 후 버튼 숨김
  // --------------------------
  // 좋아요 클릭 → DB 기록 후 버튼 숨김 및 알림
const handleLike = async (feedNo) => {
  const token = localStorage.getItem("token");
  if (!token) { 
    alert("로그인 후 이용 가능합니다."); 
    return; 
  }
  const userId = jwtDecode(token).userId;

  try {
    const res = await fetch("http://localhost:3010/feed/like", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ feedNo, userId })
    });
    const data = await res.json();
    if (res.ok && data.result === "success") {
      setLikedFeeds(prev => [...prev, feedNo]); // 버튼 숨김 처리
      alert("좋아요가 반영됐습니다.");       // ✅ 성공 알림
    } else {
      alert(data.msg || "좋아요 등록 중 오류 발생");
    }
  } catch (err) {
    console.error("좋아요 처리 실패:", err);
    alert("서버 오류로 좋아요 처리에 실패했습니다.");
  }
};


  // --------------------------
  // 초기 렌더링
  // --------------------------
  useEffect(() => {
    fnFeeds();
    fetchLikedFeeds();
  }, []);

  // --------------------------
  // 모달 열기/닫기
  // --------------------------
  const handleClickOpen = (feed) => {
    setSelectedFeed(feed);
    setOpen(true);
    fnLoadComments(feed.id);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFeed(null);
    setNewComment('');
  };

  // --------------------------
  // 댓글 추가
  // --------------------------
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

  // --------------------------
  // 태그 클릭
  // --------------------------
  const handleTagClick = (tag) => {
    setSearchTerm(tag);
    fnFeeds(tag);
    handleClose();
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)", paddingTop: 4, paddingBottom: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>✨ 전체 명언</Typography>

        {/* 검색창 */}
        <Box sx={{ mb: 4, display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="명언을 검색해보세요…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fnFeeds(searchTerm); }}
            InputProps={{
              sx: { borderRadius: 3, backgroundColor: "white" },
              startAdornment: (<InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>)
            }}
          />
          <Button variant="contained" color="primary" sx={{ borderRadius: 2, px: 3, py: 1.2 }}
            onClick={() => fnFeeds(searchTerm)}>검색</Button>
        </Box>

        {/* 피드 목록 */}
        <Grid container spacing={4}>
          {feeds.map(feed => (
            <Grid item key={feed.id} xs={12} sm={6} md={4} lg={3}>
              <Card onClick={() => handleClickOpen(feed)}
                sx={{
                  borderRadius: 4, cursor: "pointer", p: 1, backgroundColor: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transition: "0.3s",
                  "&:hover": { boxShadow: "0 6px 18px rgba(0,0,0,0.15)", transform: "translateY(-3px)" }
                }}>
                <CardContent>
                  <FormatQuoteIcon sx={{ fontSize: 36, color: "#555" }} />
                  <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>{feed.FEED_TITLE}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: "italic" }}>“{feed.FEED_CONTENTS}”</Typography>
                  <Typography variant="caption" sx={{ mt: 1, display: "block" }}>— {feed.QUOTE_BACKGROUND}</Typography>

                  <Box mt={1}>
                    {feed.tags.map((tag, idx) => (
                      <Button key={idx} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }}
                        onClick={(e) => { e.stopPropagation(); handleTagClick(tag); }}>
                        #{tag}
                      </Button>
                    ))}
                  </Box>

                  {/* 좋아요 버튼: 이미 좋아요 누른 피드는 숨김 */}
                  {!likedFeeds.includes(feed.id) && (
                    <Button
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mt: 1 }}
                      onClick={(e) => { e.stopPropagation(); handleLike(feed.id); }}
                    >
                      ♡ 좋아요
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 상세 모달 */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{selectedFeed?.FEED_TITLE}
            <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="h6" fontStyle="italic" gutterBottom>“{selectedFeed?.FEED_CONTENTS}”</Typography>
            <Typography variant="caption" color="text.secondary">
              출처: {selectedFeed?.QUOTE_BACKGROUND} | 피드 작성자: {selectedFeed?.USER_ID} | 작성일: {new Date(selectedFeed?.CREATE_DATE).toLocaleDateString()}
            </Typography>

            <Box mt={2}>
              {selectedFeed?.tags.map((tag, idx) => (
                <Chip key={idx} label={`#${tag}`} onClick={() => handleTagClick(tag)} sx={{ mr: 0.5, mt: 0.5 }} />
              ))}
            </Box>
          </DialogContent>
          <DialogActions><Button onClick={handleClose}>닫기</Button></DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default FeedList;
