import React, { useRef, useState } from 'react'; // 🔑 변경 1: useState를 React.useState에서 분리하여 직접 import
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom'; // 🔑 변경 2: useNavigate import 추가
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Avatar,
  IconButton,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

function Register() {
  const [files, setFile] = useState([]); // 🔑 변경 3: React.useState() -> useState()로 변경
  let titleRef = useRef();
  let contentRef = useRef();
  let navigate = useNavigate(); // 🔑 변경 4: useNavigate 훅 초기화

  const handleFileChange = (event) => {
    setFile(event.target.files);
  };

  async function fnFeedAdd() { // 🔑 변경 5: async 함수로 선언
    
    // 🔑 변경 6: 제목/내용 필수 입력 검사 추가
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
    
    // 🔑 변경 7: FormData 객체 생성 (파일과 텍스트 데이터를 함께 담는 표준 형식)
    const formData = new FormData();
    
    // 🔑 변경 8: 텍스트 데이터(제목/내용)를 FormData에 추가
    formData.append('feedTitle', titleRef.current.value);
    formData.append('feedContents', contentRef.current.value);
    // userId는 서버에서 JWT 토큰으로 추출하므로 전송할 필요 없습니다.

    // 🔑 변경 9: 파일 데이터(files)를 FormData에 추가 (서버의 multer 설정 'files'와 키 이름 일치)
    Array.from(files).forEach((file) => {
        formData.append('files', file); 
    });

    try {
        const response = await fetch("http://localhost:3010/feed", {
            method: "POST",
            headers: {
                // 🔑 변경 10: "Content-type": "application/json" 헤더를 제거하고, JWT 토큰으로 인증 헤더 추가
                "Authorization": `Bearer ${token}` 
            },
            body: formData // 🔑 변경 11: FormData 객체를 body로 전송
        });

        const data = await response.json();

        if (response.ok) {
            alert("✔️ 피드가 성공적으로 등록되었습니다!");
            navigate("/myFeed"); // 등록 후 이동
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
        <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        padding={3}
        >
        <Typography variant="h4" gutterBottom>
            피드 등록
        </Typography>

        <FormControl fullWidth margin="normal">
            <InputLabel>카테고리</InputLabel>
            <Select
            // value={age}
            label="카테고리"
            // onChange={handleChange}
            >
            <MenuItem value={1}>여행</MenuItem>
            <MenuItem value={2}>일상</MenuItem>
            <MenuItem value={3}>음식</MenuItem>
            </Select>
        </FormControl>

        <TextField inputRef={titleRef} label="제목" variant="outlined" margin="normal" fullWidth />
        <TextField
            inputRef={contentRef}
            label="내용"
            variant="outlined"
            margin="normal"
            fullWidth
            multiline
            rows={4}

        />

        {/* 파일 첨부 (하나만 가능) multiple 속성 주면 여러 개 가능*/}
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

        <Button variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}
            onClick={fnFeedAdd}
        >
            등록
        </Button>
        </Box>
    </Container>
    );
}

export default Register;