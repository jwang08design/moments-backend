const express = require('express');
const cors = require('cors');
const Replicate = require('replicate');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN, // 这里的 Key 会从 Render 后台读取，很安全
});

app.post('/generate', async (req, res) => {
  try {
    const { prompt, faceUrl } = req.body;
    console.log("收到请求:", prompt);

    const output = await replicate.run(
      "wangqixun/instant-id:c13d78908727457002029707297f620f323d4747792271c77f0a76a8779603a7",
      {
        input: {
          image: faceUrl,
          prompt: `sticker style, die-cut, white background, cute 3d vector art. ${prompt}`,
          negative_prompt: "photorealistic, ugly, broken, distorted, low quality",
          style: "Neon", 
          identitynet_strength_ratio: 0.8, 
          adapter_strength_ratio: 0.8,
        }
      }
    );
    
    res.json({ url: output[0] });
    
  } catch (error) {
    console.error("生成失败:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
