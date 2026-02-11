const express = require('express');
const cors = require('cors');
const Replicate = require('replicate');

const app = express();
const port = process.env.PORT || 3000;

// 允许跨域和大数据包
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 初始化 Replicate，自动读取环境变量
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/generate', async (req, res) => {
  try {
    const { prompt, faceUrl } = req.body;
    console.log("收到请求:", prompt);

    // 调用 InstantID 模型
    const output = await replicate.run(
      "wangqixun/instant-id:c13d78908727457002029707297f620f323d4747792271c77f0a76a8779603a7",
      {
        input: {
          image: faceUrl,
          // 强制加上贴纸风格的提示词
          prompt: `sticker style, die-cut, white background, cute 3d vector art. ${prompt}`,
          negative_prompt: "photorealistic, ugly, broken, distorted, low quality, bad anatomy",
          style: "Neon", 
          identitynet_strength_ratio: 0.8, // 锁脸强度
          adapter_strength_ratio: 0.8,
        }
      }
    );
    
    // InstantID 返回的是一个数组，第一张图是我们要的
    res.json({ url: output[0] });
    
  } catch (error) {
    console.error("后端生成失败:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
