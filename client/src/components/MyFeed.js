import React, { useState, useEffect } from 'react';
import {
 Grid, Container, Box, Card, CardMedia, CardContent,
 Typography, Dialog, DialogTitle, DialogContent, DialogActions,
 IconButton, Button, TextField, List, ListItem, ListItemText,
 ListItemAvatar, Avatar, InputAdornment, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

function MyFeed() {
 const [open, setOpen] = useState(false);
 const [selectedFeed, setSelectedFeed] = useState(null);
 const [comments, setComments] = useState([]);
 const [newComment, setNewComment] = useState('');
 const [newTag, setNewTag] = useState('');
 const [feeds, setFeeds] = useState([]);
 const [searchText, setSearchText] = useState("");
 const [likedFeeds, setLikedFeeds] = useState([]); // 좋아요 상태
 const navigate = useNavigate();

 const getCurrentUserId = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try { return jwtDecode(token).userId; } 
  catch { return null; }
 };

 // 내 피드 목록 불러오기
 const fnFeeds = () => {
  const token = localStorage.getItem("token");
  if (!token) { alert("로그인 후 이용해 주세요!"); navigate("/"); return; }

  const decoded = jwtDecode(token);
  fetch(`http://localhost:3010/feed/${decoded.userId}`)
   .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch user feeds'))
   .then(data => {
    const formattedFeeds = (data?.list || []).map(feed => ({
     ...feed,
     imgPath: feed.imgPaths?.[0] || null,
     tags: feed.tags || []
    }));
    setFeeds(formattedFeeds);
   })
   .catch(error => console.error("내 피드 조회 실패:", error));
 };

 // 댓글 불러오기
 const fnLoadComments = (feedNo) => {
  fetch(`http://localhost:3010/feed/comments/${feedNo}`)
   .then(res => res.ok ? res.json() : Promise.reject('댓글 로드 실패'))
   .then(data => setComments(data.list))
   .catch(() => setComments([]));
 };

 // 좋아요 목록 불러오기
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
    setLikedFeeds(data.list.map(l => l.FEED_NO));
   }
  } catch (err) {
   console.error("좋아요 목록 불러오기 실패:", err);
  }
 };

 // 좋아요 클릭
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
  if (res.ok) {
   setLikedFeeds(prev => [...prev, feedNo]);
   alert("좋아요가 반영됐습니다."); // 성공 시 알림 추가
  } else {
   alert(data.msg || "이미 좋아요를 누르셨습니다.");
  }
 } catch (err) {
  console.error("좋아요 처리 실패:", err);
  alert("좋아요 처리 중 오류가 발생했습니다.");
 }
};


 useEffect(() => {
  fnFeeds();
  fetchLikedFeeds();
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
    
    // 댓글 삭제 시, 현재 사용자가 작성한 댓글인지 확인하는 로직이 필요하지만, 
    // 현재 코드에서는 해당 정보(commentUser)가 없으므로 서버 측에서 검증한다고 가정합니다.

  const response = await fetch(`http://localhost:3010/feed/comment/${commentId}`, {
   method: "DELETE",
   headers: { "Authorization": `Bearer ${token}` }
  });
  const result = await response.json();
  if (response.ok) { 
   alert(result.msg); 
   // 댓글 목록에서 해당 댓글 제거 (UI 업데이트)
   setComments(prev => prev.filter(c => c.id !== commentId));
  } 
  else { alert(result.msg); }
 };

 const handleDeleteTag = async ( feedNo, tag) => {
  if (!window.confirm(`정말로 태그 "${tag}"를 삭제하시겠습니까?`)) return;
  try {
   const response = await fetch(`http://localhost:3010/feed/tag/${ feedNo}/${encodeURIComponent(tag)}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
   });
   const data = await response.json();
   if (response.ok) {
    alert(data.msg);
    setFeeds(prevFeeds =>
     prevFeeds.map(feed =>
      feed.id ===  feedNo ? { ...feed, tags: feed.tags.filter(t => t !== tag) } : feed
     )
    );
    if (selectedFeed && selectedFeed.id ===  feedNo) {
     setSelectedFeed(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    }
   } else {
    alert("태그 삭제 실패: " + data.msg);
   }
  } catch (error) {
   console.error("태그 삭제 에러:", error);
   alert("태그 삭제 중 오류가 발생했습니다.");
  }
 };

 const handleAddTag = async () => {
  if (!newTag.trim() || !selectedFeed) return;
  try {
   const token = localStorage.getItem("token");
   const response = await fetch("http://localhost:3010/feed/tag", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({  feedNo: selectedFeed.id, tagName: newTag.trim() }),
   });
   const data = await response.json();
   if (response.ok) {
    alert(data.msg);
    setSelectedFeed(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
    setFeeds(prevFeeds => prevFeeds.map(feed =>
     feed.id === selectedFeed.id ? { ...feed, tags: [...feed.tags, newTag.trim()] } : feed
    ));
    setNewTag('');
   } else {
    alert(data.msg || "태그 추가 실패");
   }
  } catch (error) {
   console.error("태그 추가 오류:", error);
   alert("태그 추가 중 오류가 발생했습니다.");
  }
 };

 const filteredFeeds = feeds.filter(feed => {
  const keyword = searchText.toLowerCase();
  return (
   (feed.FEED_TITLE?.toLowerCase().includes(keyword)) ||
   (feed.FEED_CONTENTS?.toLowerCase().includes(keyword)) ||
   (feed.tags?.some(tag => tag.toLowerCase().includes(keyword)))
  );
 });

 return (
  <Container maxWidth="lg" sx={{ marginTop: 4 }}>
   <Typography variant="h4" fontWeight={700} mb={1}>👤 내 명언 목록</Typography>
   <Divider sx={{ mb: 3 }} />

   <Box display="flex" gap={2} mb={4}>
    <TextField
     fullWidth
     variant="outlined"
     placeholder="검색어를 입력하세요..."
     value={searchText}
     onChange={(e) => setSearchText(e.target.value)}
     InputProps={{ startAdornment: <InputAdornment position="start">🔍</InputAdornment> }}
    />
    <Button variant="contained" size="large" onClick={() => setSearchText(searchText)}
     sx={{ borderRadius: 2, px: 3, py: 1.2, whiteSpace: "nowrap", height: "auto" }}>검색</Button>
   </Box>

   <Grid container spacing={4}>
    {filteredFeeds.map(feed => {
            // ⭐️ 내용 길이 제한 로직: 50자로 제한
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
        {/* ⭐️ 수정된 부분: 잘린 내용을 표시합니다. ⭐️ */}
        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>“{truncatedContent}”</Typography>
        <Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 1 }}>{feed.QUOTE_BACKGROUND} · {new Date(feed.CREATE_DATE).toLocaleDateString()}</Typography>

        <Box mt={1}>
         {feed.tags.map((tag, idx) => (
          <Button key={idx} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }}
           onClick={(e) => { e.stopPropagation(); setSearchText(tag); }}>
           #{tag}
          </Button>
         ))}
        </Box>

        
       </CardContent>
      </Card>
     </Grid>
    )})}
   </Grid>

   {/* 상세 모달 */}
   <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ fontWeight: 700 }}>{selectedFeed?.FEED_TITLE}
     <IconButton onClick={handleClose} sx={{ position: "absolute", right: 8, top: 8 }}><CloseIcon /></IconButton>
    </DialogTitle>

    <DialogContent dividers>
     {selectedFeed?.imgPath && <Box mb={2}><img src={selectedFeed.imgPath} alt="Feed" style={{ width: "100%", borderRadius: "6px" }} /></Box>}

     <Typography variant="body1" paragraph>“{selectedFeed?.FEED_CONTENTS}”</Typography>
     <Typography variant="caption" color="text.secondary">
      출처: {selectedFeed?.QUOTE_BACKGROUND} · 피드 작성자: {selectedFeed?.USER_ID} · {new Date(selectedFeed?.CREATE_DATE).toLocaleDateString()}
     </Typography>

     <Box mt={3} mb={2}>
      {selectedFeed?.USER_ID === getCurrentUserId() && (
       <Box display="flex" gap={1} mb={2}>
        <TextField size="small" placeholder="태그 추가" value={newTag}
         onChange={(e) => setNewTag(e.target.value)}
         onKeyDown={(e) => { if (e.key === 'Enter') { handleAddTag(); e.preventDefault(); } }} />
        <Button variant="contained" size="small" onClick={handleAddTag}>추가</Button>
       </Box>
      )}

      {selectedFeed?.tags.map((tag, idx) => (
       <Box key={idx} display="inline-flex" alignItems="center" sx={{ mr: 1, mb: 1 }}>
        <Button size="small" variant="outlined">#{tag}</Button>
        {selectedFeed.USER_ID === getCurrentUserId() && (
         <IconButton size="small" onClick={() => handleDeleteTag(selectedFeed.id, tag)}><CloseIcon fontSize="small" /></IconButton>
        )}
       </Box>
      ))}
     </Box>

     

     {/* 댓글 */}
     <Divider sx={{ my: 2 }} />
     <Typography variant="h6" fontWeight={600}>댓글</Typography>
     <List>
      {comments.map(comment => (
       <ListItem key={comment.id} disablePadding sx={{ mb: 1 }}>
        <ListItemAvatar><Avatar>{comment.user.charAt(0)}</Avatar></ListItemAvatar>
        <ListItemText primary={comment.text} secondary={comment.user} />
        {getCurrentUserId() === comment.user && (
         <IconButton edge="end" onClick={() => handleDeleteComment(comment.id)}><CloseIcon fontSize="small" /></IconButton>
        )}
       </ListItem>
      ))}
     </List>
     <TextField fullWidth label="댓글 추가" size="small" value={newComment} 
      onChange={(e) => setNewComment(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') { handleAddComment(); e.preventDefault(); } }} />
     <Button variant="contained" sx={{ mt: 1 }} onClick={handleAddComment}>댓글 추가</Button>

    </DialogContent>

    <DialogActions>
     <Button color="error" onClick={() => {
      if (window.confirm("정말 삭제하시겠습니까?")) {
       fetch(`http://localhost:3010/feed/${selectedFeed.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
       })
       .then(res => res.json())
       .then(() => { alert("삭제되었습니다!"); setOpen(false); fnFeeds(); });
      }
     }}>삭제</Button>
     <Button onClick={handleClose}>닫기</Button>
    </DialogActions>
   </Dialog>
  </Container>
 );
}

export default MyFeed;