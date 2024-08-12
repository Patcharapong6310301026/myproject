document.addEventListener('DOMContentLoaded', function () {
  // รับ value ของสไลด์เดอร์
  const stepSlider = document.getElementById("step-slider");
  const stepValue = document.getElementById("step-value");
  const cfgSlider = document.getElementById("cfg-slider");
  const cfgValue = document.getElementById("cfg-value");

  // เพิ่มอีเวนต์การเปลี่ยนค่าสำหรับสไลด์เดอร์
  stepSlider.addEventListener("input", updateSliderValue.bind(null, stepSlider, stepValue));
  cfgSlider.addEventListener("input", updateSliderValue.bind(null, cfgSlider, cfgValue));
  stepValue.addEventListener("input", updateTextBoxValue.bind(null, stepSlider, stepValue));
  cfgValue.addEventListener("input", updateTextBoxValue.bind(null, cfgSlider, cfgValue));

  // ฟังก์ชันสำหรับอัปเดตค่าสไลด์เดอร์
  function updateSliderValue(slider, valueBox) {
    valueBox.value = slider.value;
  }

  // ฟังก์ชันสำหรับอัปเดตค่าของกล่องข้อความ
  function updateTextBoxValue(slider, valueBox) {
    let newValue = parseFloat(valueBox.value);

    if (newValue >= parseFloat(slider.min) && newValue <= parseFloat(slider.max)) {
      slider.value = newValue;
    } else {
      slider.value = newValue < parseFloat(slider.min) ? slider.min : slider.max;
    }

    valueBox.value = slider.value;
  }
});

// function call api from stable diffusion //
async function callImg2ImgAPI() {
  // แสดง popup ก่อนทำการเรียก API
  document.getElementById('loading-popup').style.display = 'block';

  const apiUrl = 'http://localhost:7860/sdapi/v1/img2img';

  // Get values from HTML elements
  const prompt = document.getElementById('english-prompt').value;
  const negativePrompt = document.getElementById('neprompt-content').value;
  const samplerName = document.getElementById('method-type').value;
  const init_image = document.getElementById('image-type').value;
  const steps = parseInt(document.getElementById('step-value').value);
  const cfgScale = parseInt(document.getElementById('cfg-value').value);
  const height = parseInt(document.getElementById('height-dropdown').value);
  const width = parseInt(document.getElementById('width-dropdown').value);
  const seed = parseInt(document.getElementById('seed').value);

  const requestData = {
    prompt: prompt,
    negative_prompt: negativePrompt,
    sampler_name: samplerName,
    steps: steps,
    cfg_scale: cfgScale,
    height: height,
    width: width,
    seed: seed,
    init_image:  init_image,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    console.log('API Response:', result);
    var dataurl = "data:image/png;base64," + result.images[0]
    document.getElementById("result-image").src = dataurl;

    // ปุ่มดาวน์โหลด
    document.getElementById('download-btn').removeAttribute('disabled');

    if (result && typeof result === 'object' && 'key' in result) {
      const keyValue = result.key;
      console.log('Value:', keyValue);
    } else {
      console.error('Unexpected API response format:', result);
    }
  } catch (error) {
    console.error('Error calling API:', error);
  } finally {
    // ซ่อน popup เมื่อ API เสร็จสิ้น
    document.getElementById('loading-popup').style.display = 'none';
  }
}

