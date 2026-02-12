const express = require('express');
const cors = require('cors');
const Replicate = require('replicate');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 状态自检
app.get('/', (req, res) => res.send('🍌 Nano Banana Pro 后端已就绪！'));
app.get('/test', (req, res) => res.json({ status: "ok", model: "google/nano-banana-pro" }));

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/generate', async (req, res) => {
  try {
    const { prompt, faceUrl } = req.body;
    console.log("正在调用 Nano Banana Pro, 动作:", prompt);

    // 严格按照文档 Schema 构造输入
    const input = {
      prompt: `A professional-grade creative photo of the person from the reference image, she is ${prompt}. Maintain consistency and resemblance of the person. High quality, cinematic lighting.`,
      image_input: [faceUrl], // 文档要求是一个 array
      aspect_ratio: "1:1",
      resolution: "2K",       // 支持 2K/4K
      output_format: "png",
      safety_filter_level: "block_medium_and_above"
    };

    const output = await replicate.run("google/nano-banana-pro", { input });
    
    // 该模型输出格式为字符串 URI
    console.log("生成成功:", output);
    res.json({ url: output });
    
  } catch (error) {
    console.error("Nano Banana 运行报错:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => console.log(`Server started on port ${port}`));
