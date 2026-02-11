const express = require('express');
const cors = require('cors');
const Replicate = require('replicate');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => res.send('✅ FLUX-2 后端运行中'));

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/generate', async (req, res) => {
  try {
    const { prompt, faceUrl } = req.body;
    console.log("收到识图生图请求:", prompt);

    // ✅ 使用免费集合中的 flux-2-pro
    const output = await replicate.run(
      "black-forest-labs/flux-2-pro",
      {
        input: {
          prompt: `A high-quality realistic photo of the woman in the reference image, she is ${prompt}, matching her hairstyle and glasses exactly.`,
          image: faceUrl, // 这里传入那个女生的截图 URL
          aspect_ratio: "1:1",
          guidance_scale: 7.5,
          num_inference_steps: 30
        }
      }
    );
    
    // flux-2-pro 通常直接返回图片的 URL
    res.json({ url: output });
    
  } catch (error) {
    console.error("FLUX 生成报错:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => console.log(`Server started on ${port}`));
