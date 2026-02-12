const express = require('express');
const cors = require('cors');
const Replicate = require('replicate');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 状态检查
app.get('/', (req, res) => res.send('✅ Nano Banana Pro 后端就绪！'));

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/generate', async (req, res) => {
  try {
    const { prompt, faceUrl } = req.body;
    console.log("收到 Nano Banana Pro 请求:", prompt);

    // ✅ 调用 google/nano-banana-pro
    // 该模型使用 image_input 作为输入图片数组
    const output = await replicate.run(
      "google/nano-banana-pro",
      {
        input: {
          prompt: `A high-quality realistic photo of the person in the reference image, she is ${prompt}. Maintain character identity, cinematic lighting, 2K resolution.`,
          image_input: [faceUrl], // 传入识图所需的参考图
          aspect_ratio: "1:1",
          resolution: "2K",
          safety_filter_level: "block_medium_and_above"
        }
      }
    );
    
    // 该模型直接返回图片的 URL 字符串
    console.log("生成成功:", output);
    res.json({ url: output });
    
  } catch (error) {
    console.error("Nano Banana 报错:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
