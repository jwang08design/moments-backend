const express = require('express');
const cors = require('cors');
const Replicate = require('replicate');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 根目录测试
app.get('/', (req, res) => {
  res.send('✅ AI 后端正在运行中！');
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/generate', async (req, res) => {
  try {
    const { prompt, faceUrl } = req.body;
    console.log("正在调用 Replicate 生成图片，提示词:", prompt);

    // ✅ 修改点：使用 owner/model_name 格式，不加冒号后面的长 ID
    // 这样 Replicate 会自动使用该模型的最新版本
    const output = await replicate.run(
      "instantx/instantid", 
      {
        input: {
          image: faceUrl,
          prompt: `a realistic high quality photo of a woman, ${prompt}, ultra-detailed, masterwork, realistic lighting`,
          negative_prompt: "cartoon, anime, ugly, deformed, noisy, blurry, distorted, low quality, bad anatomy",
          style: "(No style)",
          identitynet_strength_ratio: 0.8,
          adapter_strength_ratio: 0.8,
          num_inference_steps: 30,
          guidance_scale: 5
        }
      }
    );
    
    console.log("AI 生成成功!");
    
    // 兼容处理：有些模型返回数组，有些返回单个字符串
    const imageUrl = Array.isArray(output) ? output[0] : output;
    res.json({ url: imageUrl });
    
  } catch (error) {
    console.error("Replicate 报错详情:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`服务器启动成功，端口: ${port}`);
});
