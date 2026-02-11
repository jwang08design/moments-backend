const express = require('express');
const cors = require('cors');
const Replicate = require('replicate');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 根目录测试，方便你浏览器直接打开检查
app.get('/', (req, res) => {
  res.send('✅ AI 后端正在运行中，请通过前端发送请求！');
});

// 自检接口
app.get('/test', (req, res) => {
  res.json({ status: "ok", message: "后端已连接" });
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/generate', async (req, res) => {
  try {
    const { prompt, faceUrl } = req.body;
    console.log("收到生图请求:", prompt);

    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("服务器缺少 API Token，请在 Render 环境变量中配置");
    }

    const output = await replicate.run(
      "instantx/instantid:429738450396071279166723223075276326757122177309903932759600028c",
      {
        input: {
          image: faceUrl,
          prompt: `a realistic photo of a woman, ${prompt}, realistic lighting, high quality, 8k`,
          negative_prompt: "cartoon, anime, photorealistic, ugly, broken, distorted, low quality, bad anatomy",
          style: "(No style)", 
          identitynet_strength_ratio: 0.8,
          adapter_strength_ratio: 0.8,
          num_inference_steps: 30,
          guidance_scale: 5
        }
      }
    );
    
    console.log("AI 生成成功:", output);
    const imageUrl = Array.isArray(output) ? output[0] : output;
    res.json({ url: imageUrl });
    
  } catch (error) {
    console.error("生成报错:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
