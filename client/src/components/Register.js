import React, { useRef, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Avatar,
  IconButton,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

function Register() {
  const [files, setFiles] = useState([]);
  const [tags, setTags] = useState(""); // "여행, 음식" 형태

  const titleRef = useRef();
  const contentRef = useRef();
  const quoteBackgroundRef = useRef(); // 🔥 명언 작성자 ref

  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFiles(event.target.files);
  };

  async function fnFeedAdd() {
    if (!titleRef.current.value.trim() || !contentRef.current.value.trim()) {
      alert("제목과 내용을 입력해주세요!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/");
      return;
    }

    const formData = new FormData();

    formData.append('feedTitle', titleRef.current.value);
    formData.append('feedContents', contentRef.current.value);

    // 🔥 명언 작성자 추가
    if (quoteBackgroundRef.current?.value.trim().length > 0) {
      formData.append('QUOTE_BACKGROUND', quoteBackgroundRef.current.value.trim());
    }

    // 🔥 태그 추가
    if (tags.trim().length > 0) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t !== "");
      formData.append('tags', JSON.stringify(tagArray));
    }

    // 🔥 이미지 파일 추가
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch("http://localhost:3010/feed", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("✔️ 피드가 성공적으로 등록되었습니다!");
        navigate("/myFeed");
      } else {
        alert(`❌ 피드 등록 실패: ${data.msg || "알 수 없는 오류"}`);
      }
    } catch (error) {
      console.error("피드 등록 중 에러:", error);
      alert("피드 등록 중 네트워크 오류가 발생했습니다.");
    }
  }

  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" alignItems="center" padding={3}>
        <Typography variant="h4" gutterBottom>피드 등록</Typography>

        <TextField inputRef={titleRef} label="제목" fullWidth margin="normal" />

        <TextField
          inputRef={contentRef}
          label="내용"
          fullWidth
          margin="normal"
          multiline
          rows={4}
        />

        {/* 🔥 명언 작성자 */}
        <TextField
          inputRef={quoteBackgroundRef}
          label="명언 작성자"
          fullWidth
          margin="normal"
        />

        {/* 🔥 태그 입력 */}
        <TextField
          label="태그 (쉼표로 구분) 예: 여행, 음식, 바다"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          fullWidth
          margin="normal"
        />

        {/* 🔥 파일 업로드 */}
        <Box display="flex" alignItems="center" margin="normal" fullWidth>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            multiple
          />
          <label htmlFor="file-upload">
            <IconButton color="primary" component="span">
              <PhotoCamera />
            </IconButton>
          </label>

          {files.length > 0 && (
            <Avatar
              alt="첨부된 이미지"
              src={URL.createObjectURL(files[0])}
              sx={{ width: 56, height: 56, marginLeft: 2 }}
            />
          )}

          <Typography variant="body1" sx={{ marginLeft: 2 }}>
            {files.length > 0 ? files[0].name : '첨부할 파일 선택'}
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 2 }}
          onClick={fnFeedAdd}
        >
          등록
        </Button>
      </Box>
    </Container>
  );
}

export default Register;
