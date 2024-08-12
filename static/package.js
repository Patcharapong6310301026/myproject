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

// ฟังก์ชันสำหรับแปลงข้อความ
function convertPrompt() {
  const thaiPrompt = document.getElementById("thai-prompt").value;

  // ส่งคำขอไปยังเซิร์ฟเวอร์เพื่อแปลงข้อความ
  fetch('/translate_prompt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ thai_prompt: thaiPrompt }),
  })
    .then(response => response.json())
    .then(data => {
      document.getElementById("english-prompt").value = data.english_prompt;
    })
    .catch(error => {
      console.error('Error translating prompt:', error);
    });
}

// ฟังก์ชันสำหรับเรียกใช้งาน API
async function callTxt2ImgAPI() {
  // แสดง popup ก่อนทำการเรียก API
  document.getElementById('loading-popup').style.display = 'block';

  const apiUrl = 'http://localhost:7860/sdapi/v1/txt2img';

  // ค่าจากหน้า HTML
  const prompt = document.getElementById('english-prompt').value;
  const negativePrompt = document.getElementById('neprompt-content').value;
  const samplerName = document.getElementById('method-type').value;
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

// ฟังก์ชันสำหรับดาวน์โหลดภาพ
function downloadImage() {
  var resultImage = document.getElementById('result-image');
  var downloadLink = document.createElement('a');
  downloadLink.href = resultImage.src;
  downloadLink.download = 'generated_image.png';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// ฟังก์ชันสำหรับล็อกเอาท์
function logout() {
  // ลบข้อมูลผู้ใช้จาก localStorage
  localStorage.removeItem('userEmail');

  // Redirect หน้าหลังจากล็อกเอาท์ 
  window.location.href = '/DESIGN'; 
}

// ฟังก์ชันสำหรับแสดงข้อมูล
function showInfo(infoId) {
  var infoPopup = document.getElementById(infoId);

  // แสดง popup ข้อมูล
  infoPopup.style.display = infoPopup.style.display === "block" ? "none" : "block";
}

// ฟังก์ชันสำหรับเปิดดูภาพเต็มหน้าจอ
function openFullScreen() {
  console.log('Open Full Screen clicked');
  var fullScreenView = document.createElement('div');
  fullScreenView.classList.add('full-screen-view');

  var fullScreenImage = document.createElement('img');
  fullScreenImage.classList.add('full-screen-image');
  fullScreenImage.src = document.getElementById('result-image').src;
  
  // ฟังก์ชันซูมภาพเต็มหน้าจอ
  fullScreenImage.style.cursor = 'zoom-out';
  fullScreenImage.style.maxWidth = '100%';
  fullScreenImage.style.maxHeight = '100%';
  fullScreenImage.style.position = 'absolute';
  fullScreenImage.style.top = '50%';
  fullScreenImage.style.left = '50%';
  fullScreenImage.style.transform = 'translate(-50%, -50%)';
  
  // ปุ่มปิดหน้าจอ
  var closeButton = document.createElement('span');
  closeButton.innerHTML = '&times;';
  closeButton.classList.add('close-button');
  closeButton.style.position = 'absolute';
  closeButton.style.top = '15px';
  closeButton.style.right = '35px';
  closeButton.onclick = closeFullScreen;

  fullScreenView.appendChild(fullScreenImage);
  fullScreenView.appendChild(closeButton);

  document.body.appendChild(fullScreenView);

  // การซูมภาพเต็มหน้าจอ
  fullScreenImage.addEventListener('click', function () {
    if (fullScreenImage.style.cursor === 'zoom-in') {
      fullScreenImage.style.cursor = 'zoom-out';
    } else {
      fullScreenImage.style.cursor = 'zoom-in';
    }
  });
}

// ฟังก์ชันสำหรับปิดดูภาพเต็มหน้าจอ
function closeFullScreen() {
  var fullScreenView = document.querySelector('.full-screen-view');
  if (fullScreenView) {
    document.body.removeChild(fullScreenView);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // คลิกเพื่อดูเต็มหน้าจอ
  document.getElementById('result-image').addEventListener('click', openFullScreen);
});