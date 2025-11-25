import React, { useState } from 'react';

import {
  Grid2,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

function Feed() {

  const [open, setOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  let navigate = useNavigate();
  let [feeds, setFeeds] = useState([]);

  function fnFeeds() {
    //원래는 아이디를 jwt 토큰에서 꺼내야 함
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      // console.log("decoded ====>" , decoded);

      fetch("http://localhost:3010/feed/" + decoded.userId)
        .then(res => res.json())
        .then(data => {
          console.log(data);
          setFeeds(data.list)
        })
    } else {
      //로그인 페이지로 이동
      alert("로그인 해주세요!");
      // alert("등록된 피드가 없습니다.");
      navigate("/");
    }

  }

  useEffect(() => {
    fnFeeds();
  }, [])



  //상세보기
  const handleClickOpen = (feed) => {
    setSelectedFeed(feed);
    setOpen(true); //이게 true일 때 상세보기가 열린다.
    setComments([
      { id: 'user1', text: '멋진 사진이에요!' },
      { id: 'user2', text: '이 장소에 가보고 싶네요!' },
      { id: 'user3', text: '아름다운 풍경이네요!' },
    ]); // 샘플 댓글 추가
    setNewComment(''); // 댓글 입력 초기화
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFeed(null);
    setComments([]); // 모달 닫을 때 댓글 초기화
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { id: 'currentUser', text: newComment }]); // 댓글 작성자 아이디 추가
      setNewComment('');
    }
  };

  return (
    <Container maxWidth="md">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">SNS</Typography>
        </Toolbar>
      </AppBar>

      <Box mt={4}>
        <Grid2 container spacing={3}>
          {feeds.length > 0 ? feeds.map((feed) => (
            <Grid2 xs={12} sm={6} md={4} key={feed.id}>
              <Card onClick={() => handleClickOpen(feed)}>
                <CardMedia
                  component="img"
                  height="200"
                  image={feed.imgPath}
                  alt={feed.imgName}
                  
                  style={{ cursor: 'pointer' }}
                />
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    {feed.content}
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
          )) : "등록된 피드가 없습니다. 피드를 등록해보세요!"}
        </Grid2>
      </Box>

      {/* 상세보기 관련 */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg"> {/* 모달 크기 조정 */}
        <DialogTitle>
          {selectedFeed?.title}
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1">{selectedFeed?.content}</Typography>
            {selectedFeed?.imgPath && (
              <img
                src={selectedFeed.imgPath}
                alt={selectedFeed.imgName}
                style={{ width: '100%', marginTop: '10px' }}
              />
            )}
          </Box>

          <Box sx={{ width: '300px', marginLeft: '20px' }}>
            <Typography variant="h6">댓글</Typography>
            <List>
              {comments.map((comment, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>{comment.id.charAt(0).toUpperCase()}</Avatar> {/* 아이디의 첫 글자를 아바타로 표시 */}
                  </ListItemAvatar>
                  <ListItemText primary={comment.text} secondary={comment.id} /> {/* 아이디 표시 */}
                </ListItem>
              ))}
            </List>
            <TextField
              label="댓글을 입력하세요"
              variant="outlined"
              fullWidth
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddComment}
              sx={{ marginTop: 1 }}
            >
              댓글 추가
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          {/* 삭제 버튼을 누르면 피드가 삭제되도록 구현 */}
          <Button onClick={() => {
            if(!window.confirm("삭제하시겠습니까?")){
                    return;
            }
            
            console.log(selectedFeed);

            fetch("http://localhost:3010/feed/" + selectedFeed.id, {
              method: "DELETE", 
              headers : {
                        "Authorization" : "Bearer " + localStorage.getItem("token")
                    }
            })
              .then(res => res.json())
              .then(data => {
                alert("삭제되었습니다!");
                setOpen(false); //1.다이얼로그 창 닫기
                fnFeeds();
              })

            //삭제 요청하면서 selectedFeed.id를 보낸다.
            //         .then(data => {
            //             console.log(data);
            //             setFeeds(data.list)
            //             alert("삭제되었습니다!");

            //         })
          }} variant='contained' color="primary">
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

export default Feed;