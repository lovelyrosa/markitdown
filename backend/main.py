from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from markitdown import MarkItDown
import mammoth
import shutil
import os

app = FastAPI()

# 允许跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化 MarkItDown
md = MarkItDown(enable_plugins=True)

@app.get("/")
def read_root():
    return {"status": "后端运行正常"}

def convert_docx_to_markdown(file_path):
    """用 mammoth 将 Word 文档转为 Markdown"""
    with open(file_path, "rb") as docx_file:
        result = mammoth.convert_to_markdown(docx_file)
        return result.value

@app.post("/api/convert")
async def convert_file(file: UploadFile = File(...)):
    file_path = f"temp_{file.filename}"
    
    # 保存上传文件
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        markdown_content = ""
        
        # 如果是 Word 文档，用 mammoth 处理
        if file.filename.lower().endswith('.docx'):
            markdown_content = convert_docx_to_markdown(file_path)
        else:
            # 其他格式（PDF/TXT/HTML 等）用 MarkItDown 处理
            result = md.convert(file_path)
            markdown_content = result.text_content
        
        # 清理临时文件
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # 限制返回长度（防止太长）
        preview_length = min(len(markdown_content), 10000)
        
        return {
            "success": True, 
            "content": markdown_content[:preview_length],
            "original_name": file.filename
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        if os.path.exists(file_path):
            os.remove(file_path)
        return {"success": False, "error": str(e)}