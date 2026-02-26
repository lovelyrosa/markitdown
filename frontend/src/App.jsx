import { useState } from 'react'
import { Upload, Button, message, Spin } from 'antd'
import { InboxOutlined, DownloadOutlined, CopyOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import axios from 'axios'
import 'antd/dist/reset.css'

function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [feedback, setFeedback] = useState('')

  const handleUpload = async (file) => {
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/convert', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (res.data.success) {
        setResult(res.data)
        message.success('转换成功！')
      } else {
        message.error(res.data.error || '转换失败')
      }
    } catch (err) {
      message.error('连接后端失败，请检查后端是否运行')
      console.error(err)
    } finally {
      setLoading(false)
    }
    return false
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content)
    message.success('已复制到剪贴板')
  }

  const handleDownload = () => {
    const blob = new Blob([result.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'converted.md'
    a.click()
    URL.revokeObjectURL(url)
    message.success('下载成功')
  }

  const submitFeedback = async () => {
    message.success('感谢反馈！')
    setFeedback('')
  }

  return (
    <div style={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      padding: 40,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>📄 MarkItDown Demo</h1>
        <p style={{ color: '#666' }}>将 PDF、Word、PPT 等文件转换为 Markdown</p>
      </header>

      {!result && (
        <Upload.Dragger
          accept=".pdf,.docx,.pptx,.xlsx,.txt,.html"
          beforeUpload={handleUpload}
          maxCount={1}
          showUploadList={false}
          style={{ padding: 60 }}
        >
          <p style={{ fontSize: 48, marginBottom: 16 }}><InboxOutlined /></p>
          <p style={{ fontSize: 18, marginBottom: 8 }}>拖拽文件到此处 或 点击上传</p>
          <p style={{ color: '#999', fontSize: 14 }}>
            支持：PDF · Word · PPT · Excel · TXT · HTML
          </p>
        </Upload.Dragger>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" tip="正在转换中..." />
        </div>
      )}

      {result && !loading && (
        <div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 24,
            marginBottom: 24
          }}>
            <div style={{ 
              border: '1px solid #e8e8e8', 
              borderRadius: 8, 
              padding: 24,
              backgroundColor: '#fafafa'
            }}>
              <h3 style={{ marginTop: 0 }}>📄 原始文件</h3>
              <p style={{ marginBottom: 8, wordBreak: 'break-all' }}>
                <strong>文件已转换</strong>
              </p>
              <Button onClick={() => setResult(null)}>
                重新上传
              </Button>
            </div>

            <div style={{ 
              border: '1px solid #e8e8e8', 
              borderRadius: 8, 
              padding: 24,
              backgroundColor: '#fafafa'
            }}>
              <h3 style={{ marginTop: 0 }}>📝 操作</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button icon={<CopyOutlined />} onClick={handleCopy}>
                  复制 Markdown
                </Button>
                <Button icon={<DownloadOutlined />} onClick={handleDownload} type="primary">
                  下载 .md 文件
                </Button>
              </div>
            </div>
          </div>

          <div style={{ 
            border: '1px solid #e8e8e8', 
            borderRadius: 8, 
            padding: 24,
            marginBottom: 24
          }}>
            <h3 style={{ marginTop: 0 }}>📝 Markdown 预览</h3>
          <div style={{ 
            maxHeight: 500, 
            overflow: 'auto',
            padding: 16,
            backgroundColor: '#fff',
            border: '1px solid #f0f0f0',
            borderRadius: 4
          }}>
          <style>{`
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: 600;
            }
            tr:nth-child(even) {
              background-color: #fafafa;
            }
          `}</style>
             <ReactMarkdown remarkPlugins={[remarkGfm]}>
  {result.content}
</ReactMarkdown>
            </div>
          </div>

          <div style={{ 
            border: '1px solid #e8e8e8', 
            borderRadius: 8, 
            padding: 24,
            backgroundColor: '#fffbe6'
          }}>
            <h3 style={{ marginTop: 0 }}>💬 哪里还需要手动调整？</h3>
            <textarea
              placeholder="请告诉我们转换结果有哪些问题..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              style={{ 
                width: '100%',
                minHeight: 100,
                padding: 12,
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                marginBottom: 12,
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <Button type="primary" onClick={submitFeedback}>
                提交反馈
              </Button>
              <Button onClick={() => { setResult(null); setFeedback(''); }}>
                跳过
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App