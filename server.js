const express = require('express');
const cors = require('cors');
const Replicate = require('replicate');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/generate', async (req, res) => {
  try {
    const { prompt, faceUrl } = req.body;
    console.log("收到请求:", prompt);

    // ✅ 使用 InstantX 官方最新的 InstantID 模型 ID
    const output = await replicate.run(
      "instantx/instantid:429738450396071279166723223075276326757122177309903932759600028c",
      {
        input: {
          image: faceUrl,
          // 提示词稍微增强一点细节，确保生成成功
          prompt: `a photo of a person, ${prompt}, realistic, 8k, detailed, high quality, film grain`,
          negative_prompt: "photorealistic, ugly, broken, distorted, low quality, bad anatomy, blur, pixelated",
          style: "Film", // 风格选 Film 比较真实
          identitynet_strength_ratio: 0.8, 
          adapter_strength_ratio: 0.8,
          num_inference_steps: 30,
          guidance_scale: 5
        }
      }
    );
    
    console.log("生成结果:", output);
    
    // InstantID 有时候返回的是 url 字符串，有时是数组，这里做个兼容
    const imageUrl = Array.isArray(output) ? output[0] : output;
    res.json({ url: imageUrl });
    
  } catch (error) {
    console.error("生成失败详细报错:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
