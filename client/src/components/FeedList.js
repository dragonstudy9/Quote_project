import React, { useState, useEffect } from 'react';
import {
  Grid, Container, Box, Card, CardMedia, CardContent,
  Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Button, TextField,
  InputAdornment, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import FavoriteIcon from '@mui/icons-material/Favorite'; 
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function FeedList() {
 const [open, setOpen] = useState(false);
 const [selectedFeed, setSelectedFeed] = useState(null);
 const [comments, setComments] = useState([]);
 const [newComment, setNewComment] = useState('');
 const [feeds, setFeeds] = useState([]);
 const [searchTerm, setSearchTerm] = useState(''); 
 const [likedFeeds, setLikedFeeds] = useState([]); 
 const navigate = useNavigate();

 const getCurrentUserId = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try { return jwtDecode(token).userId; } 
  catch { return null; }
 };
  
 const currentUserId = getCurrentUserId();

 // --------------------------
 // 피드 목록 가져오기 함수 (검색어 포함) - selectedFeed 업데이트 로직 추가
 // --------------------------
 const fnFeeds = (query = '') => {
  const token = localStorage.getItem("token");
  if (!token && window.location.pathname !== '/') { /* alert("로그인 후 이용해 주세요!"); */ navigate("/"); return; }

  const queryString = query ? `?q=${encodeURIComponent(query)}` : '';
  fetch(`http://localhost:3010/feed/list${queryString}`)
   .then(res => res.json())
   .then(data => {
   const formattedFeeds = (data?.list || []).map(feed => ({
    ...feed,
    imgPath: feed.imgPaths?.[0] || null, 
    tags: feed.tags || [],
    TOTAL_LIKES: feed.TOTAL_LIKES || 0 
   }));
   setFeeds(formattedFeeds);

    // ⭐️ 모달이 열려있는 경우, 업데이트된 피드 정보로 selectedFeed를 갱신
    if (selectedFeed) {
      const updatedSelectedFeed = formattedFeeds.find(f => f.id === selectedFeed.id);
      if (updatedSelectedFeed) {
        setSelectedFeed(updatedSelectedFeed);
      }
    }
   })
   .catch(() => console.error("전체 피드 목록 로드 실패"));
 };

 // --------------------------
 // 댓글 로드 (생략)
 // --------------------------
 const fnLoadComments = (feedNo) => {
  fetch(`http://localhost:3010/feed/comments/${feedNo}`)
   .then(res => res.json())
   .then(data => setComments(data.list))
   .catch(() => setComments([]));
 };

 // --------------------------
 // 좋아요 목록 불러오기
 // --------------------------
 const fetchLikedFeeds = async () => {
  const token = localStorage.getItem("token");
  const userId = currentUserId;
  if (!token || !userId) return;
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
 // 좋아요 추가 핸들러 (서버에서 좋아요 수 re-fetch)
 // --------------------------
 const handleLike = async (feedNo) => {
  const token = localStorage.getItem("token");
  const userId = currentUserId;
  if (!token || !userId) { alert("로그인 후 이용 가능합니다."); navigate("/"); return; }
  try {
   const res = await fetch("http://localhost:3010/feed/like", {
   method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
   body: JSON.stringify({ feedNo, userId })
   });
   const data = await res.json();
   if (res.ok && data.result === "success") { 
   setLikedFeeds(prev => [...prev, feedNo]); 
   
   // 서버에서 업데이트된 정확한 좋아요 수를 가져오기 위해 목록을 다시 불러옵니다.
   fnFeeds(searchTerm); 

   // 이 부분이 서버 응답을 기다렸다가 실행되므로, 임시 업데이트 로직은 제거합니다.
   // if (selectedFeed && selectedFeed.id === feedNo) {
   //  setSelectedFeed(prev => ({...prev, TOTAL_LIKES: prev.TOTAL_LIKES + 1}));
   // }

   alert("좋아요가 반영됐습니다."); 
   } else { alert(data.msg || "좋아요 등록 중 오류 발생"); }
  } catch (err) { console.error("좋아요 처리 실패:", err); alert("서버 오류로 좋아요 처리에 실패했습니다."); }
 };

 // --------------------------
 // 좋아요 해제 핸들러 (서버에서 좋아요 수 re-fetch)
 // --------------------------
 const handleUnlike = async (feedNo) => {
   const token = localStorage.getItem("token");
   const userId = currentUserId;
   if (!token || !userId) { alert("로그인 후 이용 가능합니다."); navigate("/"); return; }
   try {
     const res = await fetch(`http://localhost:3010/feed/like?feedNo=${feedNo}&userId=${userId}`, {
      method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
     });
     const data = await res.json();
     if (res.ok && data.result === "success") { 
     setLikedFeeds(prev => prev.filter(id => id !== feedNo)); 
     
     // 서버에서 업데이트된 정확한 좋아요 수를 가져오기 위해 목록을 다시 불러옵니다.
     fnFeeds(searchTerm); 

     // 이 부분이 서버 응답을 기다렸다가 실행되므로, 임시 업데이트 로직은 제거합니다.
     // if (selectedFeed && selectedFeed.id === feedNo) {
     //  setSelectedFeed(prev => ({...prev, TOTAL_LIKES: prev.TOTAL_LIKES - 1}));
     // }

     alert("좋아요가 해제되었습니다."); 
     } else { alert(data.msg || "좋아요 해제 중 오류 발생"); }
   } catch (err) { console.error("좋아요 해제 처리 실패:", err); alert("서버 오류로 좋아요 해제에 실패했습니다."); }
 };


 // --------------------------
 // 댓글 추가/삭제 핸들러 (생략)
 // --------------------------
 const handleAddComment = () => {
   const token = localStorage.getItem("token");
   if (!token) return alert("로그인이 필요합니다.");
   if (!newComment.trim()) return alert("댓글을 입력해주세요.");
   const userId = currentUserId;

   const param = { feedNo: selectedFeed.id, feedComment: newComment };

   fetch("http://localhost:3010/feed/comment", {
    method: "POST", headers: { "Content-type": "application/json", "Authorization": "Bearer " + token }, body: JSON.stringify(param)
   })
    .then(res => res.json())
    .then(data => {
      alert(data.msg);
      setNewComment('');
      setComments(prev => [...prev, { id: data.insertId, text: param.feedComment, user: userId }]);
    })
    .catch(error => { console.error("댓글 추가 오류:", error); alert("댓글 추가 중 오류가 발생했습니다."); });
 };

 const handleDeleteComment = async (commentId, commentUser) => {
   const token = localStorage.getItem("token");
   if (!token) return;
   
   if (currentUserId !== commentUser) { return alert("본인이 작성한 댓글만 삭제할 수 있습니다."); }

   if (!window.confirm("정말 삭제하시겠습니까?")) return;

   try {
    const response = await fetch(`http://localhost:3010/feed/comment/${commentId}`, {
      method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
    });
    const result = await response.json();
    
    if (response.ok) { 
      alert(result.msg); 
      setComments(prev => prev.filter(c => c.id !== commentId));
    } else { 
      alert(result.msg || "댓글 삭제 실패"); 
    }
   } catch (error) {
    console.error("댓글 삭제 에러:", error);
    alert("댓글 삭제 중 오류가 발생했습니다.");
   }
 };


 // --------------------------
 // 초기 렌더링 및 검색어 변경 시 피드 목록 새로고침 
 // --------------------------
 useEffect(() => {
  fnFeeds(searchTerm); 
  fetchLikedFeeds();
 }, [searchTerm]); 

 // 모달/태그 핸들러
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

 const handleTagClick = (tag) => {
  setSearchTerm(tag); 
  handleClose();
 };

 // --------------------------
 // 렌더링
 // --------------------------
 return (
  <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)", paddingTop: 4, paddingBottom: 6 }}>
   <Container maxWidth="lg">
   <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>✨ 전체 명언</Typography>

   {/* 검색창 */}
   <Box display="flex" gap={2} mb={4}>
    <TextField
     fullWidth
     variant="outlined"
     placeholder="검색어를 입력하세요..."
     value={searchTerm}
     onChange={(e) => setSearchTerm(e.target.value)} 
     onKeyDown={(e) => { if (e.key === 'Enter') { /* 엔터 키로도 상태가 변경되므로 별도 로직 필요 없음 */ } }}
     InputProps={{ startAdornment: <InputAdornment position="start">🔍</InputAdornment> }}
    />
    <Button variant="contained" size="large" onClick={() => { setSearchTerm(searchTerm) }}
      sx={{ borderRadius: 2, px: 3, py: 1.2, whiteSpace: "nowrap", height: "auto" }}>검색</Button>
   </Box>

   {/* 피드 목록 */}
   <Grid container spacing={4}>
    {feeds.map(feed => {
     const isLiked = likedFeeds.includes(feed.id); 
     const isMyFeed = currentUserId && (currentUserId === feed.USER_ID); 
    
      // 내용 길이 제한 로직: 50자로 제한
      const truncatedContent = feed.FEED_CONTENTS.length > 50 
         ? feed.FEED_CONTENTS.substring(0, 50) + '...' 
         : feed.FEED_CONTENTS;

     return (
     <Grid item key={feed.id} xs={12} sm={6} md={4} lg={3}>
      <Card onClick={() => handleClickOpen(feed)}
       sx={{ cursor: "pointer", borderRadius: 3, boxShadow: 3, transition: "0.3s",
            "&:hover": { boxShadow: 6, transform: "translateY(-4px)" } }}>

       {feed.imgPath && <CardMedia component="img" height="160" image={feed.imgPath} />}

      <CardContent>
       <FormatQuoteIcon sx={{ fontSize: 36, color: "#555" }} />
       <Typography variant="h6" fontWeight={600}>{feed.FEED_TITLE}</Typography>
       <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>“{truncatedContent}”</Typography>
       <Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 1 }}>{feed.QUOTE_BACKGROUND} · {new Date(feed.CREATE_DATE).toLocaleDateString()}</Typography>

       <Box mt={1}>
        {feed.tags.map((tag, idx) => (
         <Button key={idx} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }}
         onClick={(e) => { e.stopPropagation(); handleTagClick(tag); }}>
         #{tag}
         </Button>
        ))}
       </Box>

       {/* ⭐️ 기본 화면: 좋아요 총 개수 표시 ⭐️ */}
       <Box display="flex" alignItems="center" mt={1}>
        <FavoriteIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
        <Typography variant="body2" fontWeight={600} color="text.primary">
         좋아요: {feed.TOTAL_LIKES} 개
        </Typography>
       </Box>

        {!isMyFeed && (
          isLiked ? (
           <Button size="small" color="secondary" variant="contained" sx={{ mt: 1 }} onClick={(e) => { e.stopPropagation(); handleUnlike(feed.id); }} >
            ❤️ 좋아요 취소
           </Button>
          ) : (
           <Button size="small" color="primary" variant="outlined" sx={{ mt: 1 }} onClick={(e) => { e.stopPropagation(); handleLike(feed.id); }} >
            ♡ 좋아요 누르기
           </Button>
          )
         )}
      </CardContent>
      </Card>
     </Grid>
    );
   })}
   </Grid>

   {/* 상세 모달 */}
   <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ fontWeight: 700 }}>{selectedFeed?.FEED_TITLE}
     <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
    </DialogTitle>
    
    <DialogContent dividers>
       {selectedFeed?.imgPath && <Box mb={2}><img src={selectedFeed.imgPath} alt="Feed" style={{ width: "100%", borderRadius: "6px" }} /></Box>}

      <Typography variant="body1" paragraph>“{selectedFeed?.FEED_CONTENTS}”</Typography> 
     <Typography variant="caption" color="text.secondary">
      출처: {selectedFeed?.QUOTE_BACKGROUND} · 피드 작성자: {selectedFeed?.USER_ID} · {new Date(selectedFeed?.CREATE_DATE).toLocaleDateString()}
     </Typography>

     {/* ⭐️ 상세 모달: 좋아요 총 개수 표시 ⭐️ */}
     <Box display="flex" alignItems="center" mt={2} mb={1} color="error.main">
      <FavoriteIcon sx={{ mr: 1 }} />
      <Typography variant="subtitle1" fontWeight={700}>
       총 좋아요 수: {selectedFeed?.TOTAL_LIKES} 개
      </Typography>
     </Box>
     
     <Box mt={3} mb={2}>
      {selectedFeed?.tags.map((tag, idx) => (
      <Chip key={idx} label={`#${tag}`} onClick={() => handleTagClick(tag)} sx={{ mr: 0.5, mt: 0.5 }} />
      ))}
     </Box>

      {/* 댓글 영역 */}
     <Divider sx={{ my: 2 }} />
     <Typography variant="h6" fontWeight={600}>댓글</Typography>
     <List>
      {comments.map(comment => (
        <ListItem key={comment.id} disablePadding sx={{ mb: 1 }}>
         <ListItemAvatar><Avatar>{comment.user.charAt(0)}</Avatar></ListItemAvatar>
         <ListItemText primary={comment.text} secondary={comment.user} />
         {currentUserId === comment.user && (
           <IconButton edge="end" onClick={() => handleDeleteComment(comment.id, comment.user)}><CloseIcon fontSize="small" /></IconButton>
         )}
        </ListItem>
      ))}
     </List>
     <TextField fullWidth label="댓글 추가" size="small" value={newComment} 
      onChange={(e) => setNewComment(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') { handleAddComment(); e.preventDefault(); } }} />
     <Button variant="contained" sx={{ mt: 1 }} onClick={handleAddComment}>댓글 추가</Button>

    </DialogContent>
    <DialogActions><Button onClick={handleClose}>닫기</Button></DialogActions>
   </Dialog>
   </Container>
  </Box>
 );
}

export default FeedList;