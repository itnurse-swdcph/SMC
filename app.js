/**
 * Global Frontend Application Logic - SMC Survey & Dashboard (Academic Version)
 */

// Configuration - Target Google Apps Script Web App URL
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycby0lV0mZ0PZBMZH4rvEq72_LyOJjDtmpewEKojf4wmfxrU_rJd9qHGwVYjJRJH-NhCQYQ/exec";

// Standardized list of clinics for processing
const CLINICS_LIST = [
  "อายุรกรรม", "ศัลยกรรม", "กระดูกและข้อ", "สูตินรีเวช", 
  "กุมารเวชกรรม", "หู คอ จมูก", "จักษุ", "ทันตกรรม", 
  "แพทย์แผนไทย", "กายภาพบำบัด", "ตรวจสุขภาพ"
];

// Position choices autocomplete list
const POSITIONS_LIST = [
  "ช่างซ่อมบำรุง", "เจ้าพนักงานการเงินและบัญชี", "เจ้าพนักงานคอมพิวเตอร์", "เจ้าพนักงานฉุกเฉินการแพทย์", 
  "เจ้าพนักงานทันตสาธารณสุข", "เจ้าพนักงานพัสดุ", "เจ้าพนักงานรังสีการแพทย์", "เจ้าพนักงานวิทยาศาสตร์การแพทย์", 
  "เจ้าพนักงานเวชสถิติ", "เจ้าพนักงานสาธารณสุข", "เจ้าพนักงานเภสัชกรรม", "เจ้าพนักงานโสตทัศนศึกษา", 
  "เจ้าหน้าที่ประชาสัมพันธ์", "ทันตแพทย์", "นักกายภาพบำบัด", "นักกิจกรรมบำบัด", "นักกำหนดอาหาร", 
  "นักแก้ไขการพูด", "นักจัดการงานทั่วไป", "นักจิตวิทยา", "นักจิตวิทยาคลินิก", "นักทรัพยากรบุคคล", 
  "นักเทคนิคการแพทย์", "นักปฏิบัติการฉุกเฉินการแพทย์", "นักประชาสัมพันธ์", "นักโภชนาการ", 
  "นักรังสีการแพทย์", "นักวิเคราะห์นโยบายและแผน", "นักวิชาการคอมพิวเตอร์", "นักวิชาการเงินและบัญชี", 
  "นักวิชาการพัสดุ", "นักวิชาการสาธารณสุข", "นักวิทยาศาสตร์การแพทย์", "นายช่างเทคนิค", "นิติกร", 
  "ผู้ช่วยทันตแพทย์", "ผู้ช่วยพยาบาล", "พนักงานขับรถยนต์", "พนักงานช่วยเหลือคนไข้", "พนักงานประจำตึก", 
  "พนักงานซักฟอก", "พนักงานธุรการ", "พนักงานบัตรรายงานโรค", "พนักงานประกอบอาหาร", "พนักงานเปล", 
  "พนักงานรักษาความปลอดภัย", "พยาบาลวิชาชีพ", "แพทย์", "แพทย์แผนจีน", "แพทย์แผนไทย", 
  "แพทย์แผนไทยประยุกต์", "เภสัชกร", "วิศวกรชีวการแพทย์"
];

// Global data holder (Initialized to empty arrays for real database use)
let globalSurveyData = {
  personnel: [],
  public: [],
  isMock: false
};
let dashboardConnectionStatus = "idle";

// Main Initialization
document.addEventListener("DOMContentLoaded", () => {
  setupInteractiveFormControls();
  setupFavicon();
  setupPositionAutocomplete();
  
  const path = window.location.pathname;
  if (path.includes("index.html") || path.endsWith("/")) {
    initPortal();
  } else if (path.includes("survey-personnel")) {
    initSurveyForm("personnel");
    setupFormWizard("survey-personnel-form");
  } else if (path.includes("survey-public")) {
    initSurveyForm("public");
    setupFormWizard("survey-public-form");
  } else if (path.includes("dashboard")) {
    initDashboard();
  }
});

// Create and insert a minimal clean text SVG Favicon
function setupFavicon() {
  let favicon = document.querySelector("link[rel~='icon']");
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    document.head.appendChild(favicon);
  }
  const svgFavicon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="#0B2545" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#D4AF37" stroke-width="4" />
      <text x="50" y="58" font-family="'Sarabun', sans-serif" font-size="28" font-weight="900" fill="#D4AF37" text-anchor="middle">SMC</text>
    </svg>
  `;
  favicon.href = `data:image/svg+xml;utf8,${encodeURIComponent(svgFavicon)}`;
}

// Position autocomplete search logic
function setupPositionAutocomplete() {
  const input = document.getElementById("position-input");
  const suggestionsBox = document.getElementById("position-suggestions");
  if (!input || !suggestionsBox) return;

  input.addEventListener("input", function() {
    const val = this.value.trim().toLowerCase();
    suggestionsBox.innerHTML = "";
    if (!val) {
      suggestionsBox.style.display = "none";
      return;
    }

    const matches = POSITIONS_LIST.filter(pos => pos.toLowerCase().includes(val));
    if (matches.length === 0) {
      suggestionsBox.style.display = "none";
      return;
    }

    matches.slice(0, 8).forEach(match => {
      const div = document.createElement("div");
      div.className = "autocomplete-suggestion";
      div.innerText = match;
      div.addEventListener("click", () => {
        input.value = match;
        suggestionsBox.style.display = "none";
      });
      suggestionsBox.appendChild(div);
    });

    suggestionsBox.style.display = "block";
  });

  document.addEventListener("click", function(e) {
    if (e.target !== input) {
      suggestionsBox.style.display = "none";
    }
  });
}

// Custom option buttons binding (radio and checkbox styling)
function setupInteractiveFormControls() {
  document.body.addEventListener('click', function(e) {
    const optionBtn = e.target.closest('.options-grid.radio-group .option-btn');
    if (optionBtn) {
      const parent = optionBtn.parentElement;
      parent.querySelectorAll('.option-btn').forEach(b => {
        b.classList.remove('selected');
        const rb = b.querySelector('input[type="radio"]');
        if (rb) rb.checked = false;
      });
      
      optionBtn.classList.add('selected');
      const radio = optionBtn.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });

  document.body.addEventListener('click', function(e) {
    const optionBtn = e.target.closest('.options-grid.checkbox-group .option-btn');
    if (optionBtn) {
      const checkbox = optionBtn.querySelector('input[type="checkbox"]');
      if (checkbox) {
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
        }
        if (checkbox.checked) {
          optionBtn.classList.add('selected');
        } else {
          optionBtn.classList.remove('selected');
        }
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });

  setupOtherInputTriggers();
}

function setupOtherInputTriggers() {
  document.addEventListener('change', function(e) {
    const target = e.target;
    
    // Type write-in
    if (target.name === 'Type') {
      const c = document.getElementById('type-other-container');
      if (c) {
        if (target.value === 'อื่นๆ ระบุ................................' && target.checked) {
          c.classList.add('active');
          c.querySelector('input').setAttribute('required', 'required');
        } else {
          c.classList.remove('active');
          c.querySelector('input').removeAttribute('required');
        }
      }
    }
    
    // Disagree Reason
    if (target.name === 'AgreeSMC') {
      const c = document.getElementById('agree-smc-reason-container');
      if (c) {
        if (target.value === 'ไม่เห็นด้วยระบุเหตุผล.................................................................................' && target.checked) {
          c.classList.add('active');
          c.querySelector('input').setAttribute('required', 'required');
        } else {
          c.classList.remove('active');
          c.querySelector('input').removeAttribute('required');
        }
      }
    }

    if (target.name === 'AgreeSMCHospital') {
      const c = document.getElementById('agree-hospital-reason-container');
      if (c) {
        if (target.value === 'ไม่เห็นด้วยระบุเหตุผล.................................................................................' && target.checked) {
          c.classList.add('active');
          c.querySelector('input').setAttribute('required', 'required');
        } else {
          c.classList.remove('active');
          c.querySelector('input').removeAttribute('required');
        }
      }
    }

    if (target.name === 'AgreeSMCOPD') {
      const c = document.getElementById('agree-opd-reason-container');
      if (c) {
        if (target.value === 'ไม่เห็นด้วยระบุเหตุผล.................................................................................' && target.checked) {
          c.classList.add('active');
          c.querySelector('input').setAttribute('required', 'required');
        } else {
          c.classList.remove('active');
          c.querySelector('input').removeAttribute('required');
        }
      }
    }

    if (target.name === 'AgreeSMCIPD') {
      const c = document.getElementById('agree-ipd-reason-container');
      if (c) {
        if (target.value === 'ไม่เห็นด้วยระบุเหตุผล.................................................................................' && target.checked) {
          c.classList.add('active');
          c.querySelector('input').setAttribute('required', 'required');
        } else {
          c.classList.remove('active');
          c.querySelector('input').removeAttribute('required');
        }
      }
    }

    if (target.name === 'AgreeSMCOR') {
      const c = document.getElementById('agree-or-reason-container');
      if (c) {
        if (target.value === 'ไม่เห็นด้วยระบุเหตุผล.................................................................................' && target.checked) {
          c.classList.add('active');
          c.querySelector('input').setAttribute('required', 'required');
        } else {
          c.classList.remove('active');
          c.querySelector('input').removeAttribute('required');
        }
      }
    }

    // Treatment Right write-in
    if (target.name === 'TreatmentRight') {
      const c = document.getElementById('treatment-other-container');
      if (c) {
        if (target.value === 'อื่นๆ………………………….' && target.checked) {
          c.classList.add('active');
          c.querySelector('input').setAttribute('required', 'required');
        } else {
          c.classList.remove('active');
          c.querySelector('input').removeAttribute('required');
        }
      }
    }

    // Location write-in
    if (target.name === 'PreferredLocation') {
      const c = document.getElementById('location-other-container');
      if (c) {
        if (target.value === 'อื่นๆ (ระบุ).......................................................' && target.checked) {
          c.classList.add('active');
          c.querySelector('input').setAttribute('required', 'required');
        } else {
          c.classList.remove('active');
          c.querySelector('input').removeAttribute('required');
        }
      }
    }

    // Checkboxes write-ins
    if (target.type === 'checkbox') {
      if (target.value.includes('อื่นๆระบุ') || target.value.includes('อื่นๆ (ระบุ)')) {
        const otherId = target.name === 'DesiredClinics' ? 'clinics-other-container' : 'pay-other-container';
        const c = document.getElementById(otherId);
        if (c) {
          if (target.checked) {
            c.classList.add('active');
            c.querySelector('input').setAttribute('required', 'required');
          } else {
            c.classList.remove('active');
            c.querySelector('input').removeAttribute('required');
          }
        }
      }
    }
  });
}

// ----------------------------------------------------
// MULTI-STEP WIZARD LOGIC
// ----------------------------------------------------
function setupFormWizard(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  const steps = form.querySelectorAll(".form-step");
  const nextBtns = form.querySelectorAll(".btn-next");
  const prevBtns = form.querySelectorAll(".btn-prev");
  const stepItems = document.querySelectorAll(".step-item");
  let currentStep = 0;
  
  showStep(currentStep);
  
  nextBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (validateCurrentStep(currentStep)) {
        currentStep++;
        showStep(currentStep);
      }
    });
  });
  
  prevBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      currentStep--;
      showStep(currentStep);
    });
  });
  
  function showStep(stepIdx) {
    steps.forEach((step, idx) => {
      step.classList.toggle("active", idx === stepIdx);
    });
    stepItems.forEach((item, idx) => {
      item.classList.toggle("active", idx === stepIdx);
      item.classList.toggle("completed", idx < stepIdx);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  
  function validateCurrentStep(stepIdx) {
    const activeStepEl = steps[stepIdx];
    const inputs = activeStepEl.querySelectorAll("input[required], select[required], textarea[required]");
    let isValid = true;
    
    inputs.forEach(input => {
      if (input.type === "radio") {
        const name = input.name;
        const checkedRadio = activeStepEl.querySelector(`input[name="${name}"]:checked`);
        const groupLabel = input.closest('.form-group').querySelector('.form-label');
        if (!checkedRadio) {
          isValid = false;
          input.closest('.options-grid').style.borderColor = "var(--error-color)";
          groupLabel.style.color = "var(--error-color)";
        } else {
          input.closest('.options-grid').style.borderColor = "var(--border-color)";
          groupLabel.style.color = "var(--primary-color)";
        }
      } else {
        if (!input.value.trim()) {
          isValid = false;
          input.style.borderColor = "var(--error-color)";
          const label = input.closest('.form-group').querySelector('.form-label');
          if (label) label.style.color = "var(--error-color)";
        } else {
          input.style.borderColor = "var(--border-color)";
          const label = input.closest('.form-group').querySelector('.form-label');
          if (label) label.style.color = "var(--primary-color)";
        }
      }
    });
    
    if (!isValid) {
      alert("กรุณากรอกข้อมูลและตอบข้อคำถามที่จำเป็นให้ครบถ้วนก่อนข้ามหน้า");
    }
    
    return isValid;
  }
}

// ----------------------------------------------------
// PORTAL PAGE & DOWNLOADABLE QR CARDS (Synchronous Fix)
// ----------------------------------------------------
function initPortal() {
  const currentOrigin = window.location.origin + window.location.pathname.replace("index.html", "");
  
  const personnelUrl = currentOrigin + "survey-personnel.html";
  const publicUrl = currentOrigin + "survey-public.html";
  
  // Render QR Codes natively on HTML5 Canvas using QRious client-side
  new QRious({
    element: document.getElementById("canvas-personnel-qr"),
    size: 250,
    value: personnelUrl
  });

  new QRious({
    element: document.getElementById("canvas-public-qr"),
    size: 250,
    value: publicUrl
  });

  // Download card actions
  document.getElementById("btn-dl-personnel").addEventListener("click", () => {
    downloadBeautifulQrCard(
      personnelUrl,
      "สำหรับบุคลากรโรงพยาบาล",
      "แบบสำรวจความเห็นการจัดบริการคลินิกพิเศษนอกเวลา (SMC)",
      "survey_personnel_qr.png"
    );
  });

  document.getElementById("btn-dl-public").addEventListener("click", () => {
    downloadBeautifulQrCard(
      publicUrl,
      "สำหรับประชาชนและผู้รับบริการ",
      "แบบสำรวจความเห็นการจัดบริการคลินิกพิเศษนอกเวลา (SMC)",
      "survey_public_qr.png"
    );
  });
}

function downloadBeautifulQrCard(surveyUrl, titleText, subtitleText, filename) {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 750;
  const ctx = canvas.getContext("2d");

  // 1. Draw card background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Gold frame
  ctx.lineWidth = 12;
  ctx.strokeStyle = "#D4AF37";
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
  
  // Navy frame
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#0B2545";
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // 2. Draw Logo synchronously from header DOM
  const pageLogo = document.querySelector(".brand-section img");
  const logoSize = 100;
  const logoX = (canvas.width - logoSize) / 2;
  
  if (pageLogo && pageLogo.complete && pageLogo.naturalWidth !== 0) {
    ctx.drawImage(pageLogo, logoX, 50, logoSize, logoSize);
  } else {
    // Fallback vector drawing
    ctx.fillStyle = "#0B2545";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 100, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#D4AF37";
    ctx.font = "bold 26px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SMC", canvas.width / 2, 100);
  }

  // 3. Draw Typography
  ctx.fillStyle = "#0B2545";
  ctx.font = "bold 24px 'Sarabun', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน", canvas.width / 2, 185);

  ctx.fillStyle = "#64748B";
  ctx.font = "500 16px 'Sarabun', Arial, sans-serif";
  ctx.fillText(subtitleText, canvas.width / 2, 215);

  // Category badge
  ctx.fillStyle = "#0B2545";
  ctx.beginPath();
  ctx.roundRect(50, 245, 500, 50, 8);
  ctx.fill();

  ctx.fillStyle = "#D4AF37";
  ctx.font = "bold 20px 'Sarabun', Arial, sans-serif";
  ctx.fillText(titleText, canvas.width / 2, 277);

  // 4. Generate QR code on off-screen canvas using QRious (Synchronous Canvas output)
  const qrTemp = new QRious({
    size: 280,
    value: surveyUrl
  });
  const qrSize = 280;
  const qrX = (canvas.width - qrSize) / 2;
  const qrY = 325;
  ctx.drawImage(qrTemp.image, qrX, qrY, qrSize, qrSize);

  // 5. Draw Footer
  ctx.fillStyle = "#0B2545";
  ctx.font = "bold 18px 'Sarabun', Arial, sans-serif";
  ctx.fillText("สแกนเพื่อร่วมตอบแบบสำรวจความคิดเห็น", canvas.width / 2, 650);

  ctx.fillStyle = "#64748B";
  ctx.font = "14px 'Sarabun', Arial, sans-serif";
  ctx.fillText("ความคิดเห็นของท่านมีความสำคัญต่อการพัฒนาบริการของเรา", canvas.width / 2, 680);

  // Trigger download
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ----------------------------------------------------
// SURVEY FORM SUBMISSION
// ----------------------------------------------------
function initSurveyForm(type) {
  document.body.classList.add("survey-mode");
  const form = document.getElementById(`survey-${type}-form`);
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    showAlertModal("กำลังส่งข้อมูล...", "กรุณารอระบบทำการบันทึกข้อมูลแบบสอบถามของท่านสักครู่", "loading");
    
    const formData = new FormData(form);
    const payload = {
      surveyType: type
    };
    
    for (let [key, val] of formData.entries()) {
      if (key === "DesiredClinics" || key === "PayExtraParts") {
        if (!payload[key]) payload[key] = [];
        payload[key].push(val);
      } else {
        payload[key] = val;
      }
    }
    
    try {
      await fetch(GAS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      showAlertModal("บันทึกข้อมูลสำเร็จ", "ขอบพระคุณอย่างยิ่งสำหรับความคิดเห็นและข้อเสนอแนะในการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ (SMC) โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน", "success", () => {
        window.location.href = "index.html";
      });
      
    } catch (error) {
      console.error(error);
      showAlertModal("เกิดข้อผิดพลาด", "ไม่สามารถส่งแบบสอบถามได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง หรือติดต่อศูนย์สารสนเทศทางการพยาบาล", "error");
    }
  });
}

// ----------------------------------------------------
// DASHBOARD LOGIC (Live Database & Overview Restoration)
// ----------------------------------------------------
let chartInstances = {};

async function initDashboard() {
  setupDashboardTabs();
  await loadDashboardData();
  
  // Render views
  renderOverviewDashboard();
  renderPersonnelDashboard();
  renderPublicDashboard();
  
  // Real-time polling reminder
  setInterval(async () => {
    await loadDashboardData();
    renderOverviewDashboard();
    renderPersonnelDashboard();
    renderPublicDashboard();
  }, 20000);
}

function setupDashboardTabs() {
  document.querySelectorAll(".sidebar-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      document.querySelectorAll(".sidebar-btn").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      
      const tabId = this.getAttribute("data-tab");
      document.querySelectorAll(".db-tab-content").forEach(content => {
        content.style.display = "none";
      });
      
      const activeContent = document.getElementById(tabId);
      if (activeContent) {
        activeContent.style.display = "flex";
        activeContent.style.flexDirection = "column";
        activeContent.style.gap = "2.5rem";
      }
      
      Object.keys(chartInstances).forEach(key => {
        chartInstances[key].resize();
      });
    });
  });
}

async function loadDashboardData() {
  try {
    const response = await fetch(`${GAS_WEB_APP_URL}?action=getData`);
    if (!response.ok) throw new Error("API Network error");
    const json = await response.json();
    
    if (json.status === "success") {
      globalSurveyData.personnel = json.personnel || [];
      globalSurveyData.public = json.public || [];
    }
  } catch (err) {
    console.error("Could not retrieve database records:", err);
  }
}

// ----------------------------------------------------
// TAB 0: SUMMARY OVERVIEW RENDER
// ----------------------------------------------------
function renderOverviewDashboard() {
  const pCount = globalSurveyData.personnel.length;
  const pubCount = globalSurveyData.public.length;
  const total = pCount + pubCount;
  
  document.getElementById("count-total").innerText = total;
  document.getElementById("count-personnel").innerText = pCount;
  document.getElementById("count-public").innerText = pubCount;

  // Unify charts data
  const combinedGenders = mergeCounts(
    countFieldValues(globalSurveyData.personnel, "Gender"),
    countFieldValues(globalSurveyData.public, "Gender")
  );

  const combinedAges = countAgeRanges(globalSurveyData.personnel).map((val, idx) => {
    return val + countAgeRanges(globalSurveyData.public)[idx];
  });

  // Calculate agreement
  let agreeVal = 0;
  let disagreeVal = 0;
  let unsureVal = 0;

  globalSurveyData.personnel.forEach(i => {
    if (i.AgreeSMC === "เห็นด้วย") agreeVal++;
    else if (i.AgreeSMC && i.AgreeSMC.includes("ไม่เห็นด้วย")) disagreeVal++;
    else unsureVal++;
  });

  globalSurveyData.public.forEach(i => {
    if (i.AgreeSMCHospital === "เห็นด้วย") agreeVal++;
    else if (i.AgreeSMCHospital && i.AgreeSMCHospital.includes("ไม่เห็นด้วย")) disagreeVal++;
    else unsureVal++;
  });

  if (chartInstances.gender) chartInstances.gender.destroy();
  if (chartInstances.age) chartInstances.age.destroy();
  if (chartInstances.agreement) chartInstances.agreement.destroy();

  chartInstances.gender = createPieChart("chart-gender", combinedGenders, ["#0B2545", "#D4AF37", "#CBD5E1"]);
  chartInstances.age = createBarChart("chart-age", ["ต่ำกว่า 20 ปี", "20 – 29 ปี", "30 – 39 ปี", "40 – 49 ปี", "50 – 59 ปี", "60 ปีขึ้นไป"], [
    { label: "ผู้ตอบแบบสอบถามทั้งหมด", data: combinedAges, backgroundColor: "#0B2545" }
  ]);
  chartInstances.agreement = createPieChart("chart-agreement", {
    "เห็นด้วย": agreeVal,
    "ไม่เห็นด้วย": disagreeVal,
    "ไม่แน่ใจ/อื่น ๆ": unsureVal
  }, ["#10B981", "#EF4444", "#CBD5E1"]);
}

// ----------------------------------------------------
// TAB 1: PERSONNEL ACADEMIC REPORT
// ----------------------------------------------------
function renderPersonnelDashboard() {
  const data = globalSurveyData.personnel;
  const count = data.length;
  
  let agreeCount = 0;
  let disagreeCount = 0;
  data.forEach(item => {
    if (item.AgreeSMC === "เห็นด้วย") agreeCount++;
    else if (item.AgreeSMC && item.AgreeSMC.includes("ไม่เห็นด้วย")) disagreeCount++;
  });

  document.getElementById("p-count-total").innerText = count;
  document.getElementById("p-count-agree").innerText = agreeCount;
  document.getElementById("p-count-disagree").innerText = disagreeCount;

  // Render Charts
  const pGenders = countFieldValues(data, "Gender");
  const pAge = countAgeRanges(data);
  const pClinics = countMultipleChoice(data, "DesiredClinics");

  if (chartInstances.pGender) chartInstances.pGender.destroy();
  if (chartInstances.pAge) chartInstances.pAge.destroy();
  if (chartInstances.pClinics) chartInstances.pClinics.destroy();

  chartInstances.pGender = createPieChart("p-chart-gender", pGenders, ["#0B2545", "#D4AF37"]);
  chartInstances.pAge = createBarChart("p-chart-age", ["ต่ำกว่า 20 ปี", "20 – 29 ปี", "30 – 39 ปี", "40 – 49 ปี", "50 – 59 ปี", "60 ปีขึ้นไป"], [
    { label: "บุคลากร", data: pAge, backgroundColor: "#0B2545" }
  ]);
  chartInstances.pClinics = createHorizontalBarChart("p-chart-clinics", CLINICS_LIST, [
    { label: "คลินิกที่ขอเปิด", data: CLINICS_LIST.map(c => pClinics[c] || 0), backgroundColor: "#D4AF37" }
  ]);

  // Render Tables
  renderThaiDateLabels();
  renderPersonnelDemographicsTable(data);
  renderPersonnelOpinionsTable(data);
  renderPersonnelFeedbackLists(data);
}

// ----------------------------------------------------
// TAB 2: PUBLIC ACADEMIC REPORT
// ----------------------------------------------------
function renderPublicDashboard() {
  const data = globalSurveyData.public;
  const count = data.length;
  
  let agreeCount = 0;
  let disagreeCount = 0;
  data.forEach(item => {
    if (item.AgreeSMCHospital === "เห็นด้วย") agreeCount++;
    else if (item.AgreeSMCHospital && item.AgreeSMCHospital.includes("ไม่เห็นด้วย")) disagreeCount++;
  });

  document.getElementById("pub-count-total").innerText = count;
  document.getElementById("pub-count-agree").innerText = agreeCount;
  document.getElementById("pub-count-disagree").innerText = disagreeCount;

  // Render Charts
  const pubGenders = countFieldValues(data, "Gender");
  const pubAge = countAgeRanges(data);
  const pubClinics = countMultipleChoice(data, "DesiredClinics");

  if (chartInstances.pubGender) chartInstances.pubGender.destroy();
  if (chartInstances.pubAge) chartInstances.pubAge.destroy();
  if (chartInstances.pubClinics) chartInstances.pubClinics.destroy();

  chartInstances.pubGender = createPieChart("pub-chart-gender", pubGenders, ["#0B2545", "#D4AF37"]);
  chartInstances.pubAge = createBarChart("pub-chart-age", ["ต่ำกว่า 20 ปี", "20 – 29 ปี", "30 – 39 ปี", "40 – 49 ปี", "50 – 59 ปี", "60 ปีขึ้นไป"], [
    { label: "ประชาชน", data: pubAge, backgroundColor: "#0B2545" }
  ]);
  chartInstances.pubClinics = createHorizontalBarChart("pub-chart-clinics", CLINICS_LIST, [
    { label: "คลินิกที่ขอเปิด", data: CLINICS_LIST.map(c => pubClinics[c] || 0), backgroundColor: "#D4AF37" }
  ]);

  // Render Tables
  renderPublicDemographicsTable(data);
  renderPublicOpinionsTable(data);
  renderPublicFeedbackLists(data);
}

// ----------------------------------------------------
// TABLE GENERATION ROUTINES (Academic Layouts & Skeletons)
// ----------------------------------------------------
function renderPersonnelDemographicsTable(data) {
  const n = data.length;
  const genders = countFieldValues(data, "Gender");
  const ages = data.map(i => parseInt(i.Age)).filter(a => !isNaN(a));
  const ageBuckets = countAgeRanges(data);
  const types = countFieldValues(data, "Type");
  const positions = countFieldValues(data, "Position");
  const incomes = countFieldValues(data, "Income");

  // Math metrics for Age
  const minAge = ages.length ? Math.min(...ages) : 0;
  const maxAge = ages.length ? Math.max(...ages) : 0;
  const meanAge = ages.length ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : 0;

  let otherTypesCount = 0;
  data.forEach(item => {
    if (item.Type === "อื่นๆ ระบุ................................") otherTypesCount++;
  });

  let html = `
    <thead>
      <tr>
        <th style="width: 50%;">ข้อมูลส่วนบุคคล</th>
        <th style="width: 25%; text-align: center;">จำนวน (คน)</th>
        <th style="width: 25%; text-align: center;">ร้อยละ</th>
      </tr>
    </thead>
    <tbody>
    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">1. เพศ</td></tr>
    <tr><td>- ชาย</td><td style="text-align: center;">${genders["ชาย"]||0}</td><td style="text-align: center;">${calcPercent(genders["ชาย"], n)}%</td></tr>
    <tr><td>- หญิง</td><td style="text-align: center;">${genders["หญิง"]||0}</td><td style="text-align: center;">${calcPercent(genders["หญิง"], n)}%</td></tr>
    
    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">2. ช่วงอายุ (ต่ำสุด: ${minAge} ปี, สูงสุด: ${maxAge} ปี, เฉลี่ย: ${meanAge} ปี)</td></tr>
    <tr><td>- ต่ำกว่า 20 ปี</td><td style="text-align: center;">${ageBuckets[0]}</td><td style="text-align: center;">${calcPercent(ageBuckets[0], n)}%</td></tr>
    <tr><td>- 20 - 29 ปี</td><td style="text-align: center;">${ageBuckets[1]}</td><td style="text-align: center;">${calcPercent(ageBuckets[1], n)}%</td></tr>
    <tr><td>- 30 - 39 ปี</td><td style="text-align: center;">${ageBuckets[2]}</td><td style="text-align: center;">${calcPercent(ageBuckets[2], n)}%</td></tr>
    <tr><td>- 40 - 49 ปี</td><td style="text-align: center;">${ageBuckets[3]}</td><td style="text-align: center;">${calcPercent(ageBuckets[3], n)}%</td></tr>
    <tr><td>- 50 - 59 ปี</td><td style="text-align: center;">${ageBuckets[4]}</td><td style="text-align: center;">${calcPercent(ageBuckets[4], n)}%</td></tr>
    <tr><td>- 60 ปีขึ้นไป</td><td style="text-align: center;">${ageBuckets[5]}</td><td style="text-align: center;">${calcPercent(ageBuckets[5], n)}%</td></tr>
    
    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">3. ประเภทบุคลากร</td></tr>
    <tr><td>- ข้าราชการ</td><td style="text-align: center;">${types["ข้าราชการ"]||0}</td><td style="text-align: center;">${calcPercent(types["ข้าราชการ"], n)}%</td></tr>
    <tr><td>- พนักงานราชการ</td><td style="text-align: center;">${types["พนักงานราชการ"]||0}</td><td style="text-align: center;">${calcPercent(types["พนักงานราชการ"], n)}%</td></tr>
    <tr><td>- พนักงานกระทรวงสาธารณสุข</td><td style="text-align: center;">${types["พนักงานกระทรวงสาธารณสุข"]||0}</td><td style="text-align: center;">${calcPercent(types["พนักงานกระทรวงสาธารณสุข"], n)}%</td></tr>
    <tr><td>- ลูกจ้างประจำ</td><td style="text-align: center;">${types["ลูกจ้างประจำ"]||0}</td><td style="text-align: center;">${calcPercent(types["ลูกจ้างประจำ"], n)}%</td></tr>
    <tr><td>- ลูกจ้างชั่วคราว</td><td style="text-align: center;">${types["ลูกจ้างชั่วคราว"]||0}</td><td style="text-align: center;">${calcPercent(types["ลูกจ้างชั่วคราว"], n)}%</td></tr>
    <tr><td>- อื่นๆ (${data.map(i => i.TypeOther).filter(Boolean).join(", ") || "ไม่มี"})</td><td style="text-align: center;">${otherTypesCount}</td><td style="text-align: center;">${calcPercent(otherTypesCount, n)}%</td></tr>
    
    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">4. ตำแหน่งสายงาน (จำแนกตามตำแหน่งที่ส่งจริง)</td></tr>
  `;

  if (n === 0) {
    html += `<tr><td colspan="3" style="text-align: center; color: var(--text-light);">ยังไม่มีข้อมูลสายงาน</td></tr>`;
  } else {
    const sortedPos = Object.keys(positions).sort((a,b) => positions[b] - positions[a]);
    sortedPos.forEach(pos => {
      if (pos !== "ไม่ระบุ") {
        html += `<tr><td>- ${pos}</td><td style="text-align: center;">${positions[pos]}</td><td style="text-align: center;">${calcPercent(positions[pos], n)}%</td></tr>`;
      }
    });
  }

  html += `
    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">5. รายได้รวมต่อเดือนของครอบครัว</td></tr>
    <tr><td>- ต่ำกว่า 10,000 บาท</td><td style="text-align: center;">${incomes["ต่ำกว่า 10,000"]||0}</td><td style="text-align: center;">${calcPercent(incomes["ต่ำกว่า 10,000"], n)}%</td></tr>
    <tr><td>- 10,001 – 30,000 บาท</td><td style="text-align: center;">${incomes["10,001 – 30,000"]||0}</td><td style="text-align: center;">${calcPercent(incomes["10,001 – 30,000"], n)}%</td></tr>
    <tr><td>- 30,001 – 50,000 บาท</td><td style="text-align: center;">${incomes["30,001 – 50,000"]||0}</td><td style="text-align: center;">${calcPercent(incomes["30,001 – 50,000"], n)}%</td></tr>
    <tr><td>- 50,001 – 70,000 บาท</td><td style="text-align: center;">${incomes["50,001 – 70,000"]||0}</td><td style="text-align: center;">${calcPercent(incomes["50,001 – 70,000"], n)}%</td></tr>
    <tr><td>- 70,001 – 90,000 บาท</td><td style="text-align: center;">${incomes["70,001 – 90,000"]||0}</td><td style="text-align: center;">${calcPercent(incomes["70,001 – 90,000"], n)}%</td></tr>
    <tr><td>- มากกว่า 90,000 บาท</td><td style="text-align: center;">${incomes["มากกว่า 90,000"]||0}</td><td style="text-align: center;">${calcPercent(incomes["มากกว่า 90,000"], n)}%</td></tr>
  `;

  document.getElementById("p-table-demographics").innerHTML = html;
}

function renderPublicDemographicsTable(data) {
  const n = data.length;
  const genders = countFieldValues(data, "Gender");
  const ages = data.map(i => parseInt(i.Age)).filter(a => !isNaN(a));
  const ageBuckets = countAgeRanges(data);
  const occupations = countFieldValues(data, "Occupation");
  const rights = countKnownFieldValues(data, "TreatmentRight", [
    "สวัสดิการข้าราชการ",
    "ประกันสังคม",
    "บัตรทอง",
    "อื่นๆ"
  ]);
  const incomes = countFieldValues(data, "Income");

  const minAge = ages.length ? Math.min(...ages) : 0;
  const maxAge = ages.length ? Math.max(...ages) : 0;
  const meanAge = ages.length ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : 0;

  let otherRightsCount = 0;
  data.forEach(item => {
    if (item.TreatmentRight === "อื่นๆ………………………….") otherRightsCount++;
  });

  let html = `
    <tr>
      <th style="width: 50%;">ข้อมูลส่วนบุคคล</th>
      <th style="width: 25%; text-align: center;">จำนวน (คน)</th>
      <th style="width: 25%; text-align: center;">ร้อยละ</th>
    </tr>
    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">1. เพศ</td></tr>
    <tr><td>- ชาย</td><td style="text-align: center;">${genders["ชาย"]||0}</td><td style="text-align: center;">${calcPercent(genders["ชาย"], n)}%</td></tr>
    <tr><td>- หญิง</td><td style="text-align: center;">${genders["หญิง"]||0}</td><td style="text-align: center;">${calcPercent(genders["หญิง"], n)}%</td></tr>
    
    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">2. ช่วงอายุ (ต่ำสุด: ${minAge} ปี, สูงสุด: ${maxAge} ปี, เฉลี่ย: ${meanAge} ปี)</td></tr>
    <tr><td>- ต่ำกว่า 20 ปี</td><td style="text-align: center;">${ageBuckets[0]}</td><td style="text-align: center;">${calcPercent(ageBuckets[0], n)}%</td></tr>
    <tr><td>- 20 - 29 ปี</td><td style="text-align: center;">${ageBuckets[1]}</td><td style="text-align: center;">${calcPercent(ageBuckets[1], n)}%</td></tr>
    <tr><td>- 30 - 39 ปี</td><td style="text-align: center;">${ageBuckets[2]}</td><td style="text-align: center;">${calcPercent(ageBuckets[2], n)}%</td></tr>
    <tr><td>- 40 - 49 ปี</td><td style="text-align: center;">${ageBuckets[3]}</td><td style="text-align: center;">${calcPercent(ageBuckets[3], n)}%</td></tr>
    <tr><td>- 50 - 59 ปี</td><td style="text-align: center;">${ageBuckets[4]}</td><td style="text-align: center;">${calcPercent(ageBuckets[4], n)}%</td></tr>
    <tr><td>- 60 ปีขึ้นไป</td><td style="text-align: center;">${ageBuckets[5]}</td><td style="text-align: center;">${calcPercent(ageBuckets[5], n)}%</td></tr>
    
    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">3. อาชีพหลัก</td></tr>
    <tr><td>- ข้าราชการ/เจ้าหน้าที่รัฐ/รัฐวิสาหกิจ</td><td style="text-align: center;">${occupations["ข้าราชการ/เจ้าหน้าที่รัฐ/รัฐวิสาหกิจ"]||0}</td><td style="text-align: center;">${calcPercent(occupations["ข้าราชการ/เจ้าหน้าที่รัฐ/รัฐวิสาหกิจ"], n)}%</td></tr>
    <tr><td>- พนักงานบริษัท</td><td style="text-align: center;">${occupations["พนักงานบริษัท"]||0}</td><td style="text-align: center;">${calcPercent(occupations["พนักงานบริษัท"], n)}%</td></tr>
    <tr><td>- ค้าขาย/ธุรกิจส่วนตัว</td><td style="text-align: center;">${occupations["ค้าขาย/ธุรกิจส่วนตัว"]||0}</td><td style="text-align: center;">${calcPercent(occupations["ค้าขาย/ธุรกิจส่วนตัว"], n)}%</td></tr>
    <tr><td>- เกษตรกร</td><td style="text-align: center;">${occupations["เกษตรกร"]||0}</td><td style="text-align: center;">${calcPercent(occupations["เกษตรกร"], n)}%</td></tr>
    <tr><td>- รับจ้างทั่วไป/กรรมกร</td><td style="text-align: center;">${occupations["รับจ้างทั่วไป/กรรมกร"]||0}</td><td style="text-align: center;">${calcPercent(occupations["รับจ้างทั่วไป/กรรมกร"], n)}%</td></tr>
    <tr><td>- แม่บ้าน/พ่อบ้าน</td><td style="text-align: center;">${occupations["แม่บ้าน/พ่อบ้าน"]||0}</td><td style="text-align: center;">${calcPercent(occupations["แม่บ้าน/พ่อบ้าน"], n)}%</td></tr>
    <tr><td>- นักเรียน/นักศึกษา</td><td style="text-align: center;">${occupations["นักเรียน/นักศึกษา"]||0}</td><td style="text-align: center;">${calcPercent(occupations["นักเรียน/นักศึกษา"], n)}%</td></tr>
    <tr><td>- อื่นๆ/ว่างงาน</td><td style="text-align: center;">${occupations["อื่นๆ/ว่างงาน"]||0}</td><td style="text-align: center;">${calcPercent(occupations["อื่นๆ/ว่างงาน"], n)}%</td></tr>
    
    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">4. สิทธิ์การตรวจรักษาโรค</td></tr>
    <tr><td>- สวัสดิการข้าราชการ</td><td style="text-align: center;">${rights["สวัสดิการข้าราชการ"]||0}</td><td style="text-align: center;">${calcPercent(rights["สวัสดิการข้าราชการ"], n)}%</td></tr>
    <tr><td>- ประกันสังคม</td><td style="text-align: center;">${rights["ประกันสังคม"]||0}</td><td style="text-align: center;">${calcPercent(rights["ประกันสังคม"], n)}%</td></tr>
    <tr><td>- บัตรทอง (หลักประกันสุขภาพ)</td><td style="text-align: center;">${rights["บัตรทอง"]||0}</td><td style="text-align: center;">${calcPercent(rights["บัตรทอง"], n)}%</td></tr>
    <tr><td>- อื่นๆ (${data.map(i => i.TreatmentRightOther).filter(Boolean).join(", ") || "ไม่มี"})</td><td style="text-align: center;">${otherRightsCount}</td><td style="text-align: center;">${calcPercent(otherRightsCount, n)}%</td></tr>
    
    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">5. รายได้รวมต่อเดือนของครอบครัว</td></tr>
    <tr><td>- ต่ำกว่า 10,000 บาท</td><td style="text-align: center;">${incomes["ต่ำกว่า 10,000"]||0}</td><td style="text-align: center;">${calcPercent(incomes["ต่ำกว่า 10,000"], n)}%</td></tr>
    <tr><td>- 10,001 – 30,000 บาท</td><td style="text-align: center;">${incomes["10,001 – 30,000"]||0}</td><td style="text-align: center;">${calcPercent(incomes["10,001 – 30,000"], n)}%</td></tr>
    <tr><td>- 30,001 – 50,000 บาท</td><td style="text-align: center;">${incomes["30,001 – 50,000"]||0}</td><td style="text-align: center;">${calcPercent(incomes["30,001 – 50,000"], n)}%</td></tr>
    <tr><td>- 50,001 – 70,000 บาท</td><td style="text-align: center;">${incomes["50,001 – 70,000"]||0}</td><td style="text-align: center;">${calcPercent(incomes["50,001 – 70,000"], n)}%</td></tr>
    <tr><td>- 70,001 – 90,000 บาท</td><td style="text-align: center;">${incomes["70,001 – 90,000"]||0}</td><td style="text-align: center;">${calcPercent(incomes["70,001 – 90,000"], n)}%</td></tr>
    <tr><td>- มากกว่า 90,000 บาท</td><td style="text-align: center;">${incomes["มากกว่า 90,000"]||0}</td><td style="text-align: center;">${calcPercent(incomes["มากกว่า 90,000"], n)}%</td></tr>
  `;

  document.getElementById("pub-table-demographics").innerHTML = html;
}

function renderPersonnelOpinionsTable(data) {
  const n = data.length;
  
  const pAgree = countFieldValues(data, "AgreeSMC");
  let disagreeReasonStr = data.map(i => i.DisagreeReason).filter(Boolean).join(", ") || "ไม่มี";
  
  const q7 = countFieldValues(data, "FastService");
  const q8 = countFieldValues(data, "WillUseService");
  const q10 = countFieldValues(data, "ConvenientDoctor");
  const q11 = countFieldValues(data, "ReduceQueue");
  const q12 = countFieldValues(data, "ConvenientTime");
  const q13 = countFieldValues(data, "WillingToPayExtra");
  const q15 = countFieldValues(data, "PreferredLocation");

  let html = `
    <tr>
      <th style="width: 50%;">รายละเอียดข้อคำถาม</th>
      <th style="width: 25%; text-align: center;">จำนวน (คน)</th>
      <th style="width: 25%; text-align: center;">ร้อยละ</th>
    </tr>
    
    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">1. ความเห็นชอบการจัดตั้งคลินิกพิเศษเฉพาะทางนอกเวลาราชการ</td></tr>
    <tr><td>- เห็นด้วย</td><td style="text-align: center;">${pAgree["เห็นด้วย"]||0}</td><td style="text-align: center;">${calcPercent(pAgree["เห็นด้วย"], n)}%</td></tr>
    <tr><td>- ไม่เห็นด้วย (เหตุผล: ${disagreeReasonStr})</td><td style="text-align: center;">${(pAgree["ไม่เห็นด้วย"]||0) + (pAgree["ไม่เห็นด้วยระบุเหตุผล................................................................................."]||0)}</td><td style="text-align: center;">${calcPercent((pAgree["ไม่เห็นด้วย"]||0) + (pAgree["ไม่เห็นด้วยระบุเหตุผล................................................................................."]||0), n)}%</td></tr>
    
    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">2. คาดว่าจะได้รับบริการรวดเร็วขึ้นหรือไม่</td></tr>
    <tr><td>- เห็นด้วย/รวดเร็วขึ้น</td><td style="text-align: center;">${q7["เห็นด้วย"]||0}</td><td style="text-align: center;">${calcPercent(q7["เห็นด้วย"], n)}%</td></tr>
    <tr><td>- ไม่เห็นด้วย</td><td style="text-align: center;">${q7["ไม่เห็นด้วย"]||0}</td><td style="text-align: center;">${calcPercent(q7["ไม่เห็นด้วย"], n)}%</td></tr>
    <tr><td>- ไม่แน่ใจ</td><td style="text-align: center;">${q7["ไม่แน่ใจ"]||0}</td><td style="text-align: center;">${calcPercent(q7["ไม่แน่ใจ"], n)}%</td></tr>

    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">3. ทัศนคติความตั้งใจจะเข้าใช้บริการ</td></tr>
    <tr><td>- ใช้บริการ</td><td style="text-align: center;">${q8["ใช้บริการ"]||0}</td><td style="text-align: center;">${calcPercent(q8["ใช้บริการ"], n)}%</td></tr>
    <tr><td>- ไม่ใช้บริการ</td><td style="text-align: center;">${q8["ไม่ใช้บริการ"]||0}</td><td style="text-align: center;">${calcPercent(q8["ไม่ใช้บริการ"], n)}%</td></tr>
    <tr><td>- ไม่แน่ใจ</td><td style="text-align: center;">${q8["ไม่แน่ใจ"]||0}</td><td style="text-align: center;">${calcPercent(q8["ไม่แน่ใจ"], n)}%</td></tr>

    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">4. ช่วยเพิ่มความสะดวกในการเลือกแพทย์เฉพาะทาง</td></tr>
    <tr><td>- เห็นด้วย</td><td style="text-align: center;">${q10["เห็นด้วย"]||0}</td><td style="text-align: center;">${calcPercent(q10["เห็นด้วย"], n)}%</td></tr>
    <tr><td>- ไม่เห็นด้วย</td><td style="text-align: center;">${q10["ไม่เห็นด้วย"]||0}</td><td style="text-align: center;">${calcPercent(q10["ไม่เห็นด้วย"], n)}%</td></tr>
    <tr><td>- ไม่แน่ใจ</td><td style="text-align: center;">${q10["ไม่แน่ใจ"]||0}</td><td style="text-align: center;">${calcPercent(q10["ไม่แน่ใจ"], n)}%</td></tr>

    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">5. ช่วยลดเวลารอคอยคิวผ่าตัด</td></tr>
    <tr><td>- เห็นด้วย</td><td style="text-align: center;">${q11["เห็นด้วย"]||0}</td><td style="text-align: center;">${calcPercent(q11["เห็นด้วย"], n)}%</td></tr>
    <tr><td>- ไม่เห็นด้วย</td><td style="text-align: center;">${q11["ไม่เห็นด้วย"]||0}</td><td style="text-align: center;">${calcPercent(q11["ไม่เห็นด้วย"], n)}%</td></tr>
    <tr><td>- ไม่แน่ใจ</td><td style="text-align: center;">${q11["ไม่แน่ใจ"]||0}</td><td style="text-align: center;">${calcPercent(q11["ไม่แน่ใจ"], n)}%</td></tr>

    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">6. ช่วงเวลาที่สะดวกมาใช้บริการ</td></tr>
    <tr><td>- กลางวัน</td><td style="text-align: center;">${q12["กลางวัน"]||0}</td><td style="text-align: center;">${calcPercent(q12["กลางวัน"], n)}%</td></tr>
    <tr><td>- ตอนเย็น</td><td style="text-align: center;">${q12["ตอนเย็น"]||0}</td><td style="text-align: center;">${calcPercent(q12["ตอนเย็น"], n)}%</td></tr>
    <tr><td>- กลางคืน</td><td style="text-align: center;">${q12["กลางคืน"]||0}</td><td style="text-align: center;">${calcPercent(q12["กลางคืน"], n)}%</td></tr>
    <tr><td>- ตลอดทั้งวัน</td><td style="text-align: center;">${q12["ตลอดทั้งวัน"]||0}</td><td style="text-align: center;">${calcPercent(q12["ตลอดทั้งวัน"], n)}%</td></tr>

    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">7. ความยินดีที่จะชำระค่าบริการเพิ่มเติม</td></tr>
    <tr><td>- ยินดีจ่ายเพิ่ม</td><td style="text-align: center;">${q13["ยินดีจ่ายเพิ่ม"]||0}</td><td style="text-align: center;">${calcPercent(q13["ยินดีจ่ายเพิ่ม"], n)}%</td></tr>
    <tr><td>- ไม่ยินดีจ่ายเพิ่ม</td><td style="text-align: center;">${q13["ไม่ยินดีจ่ายเพิ่ม"]||0}</td><td style="text-align: center;">${calcPercent(q13["ไม่ยินดีจ่ายเพิ่ม"], n)}%</td></tr>
    <tr><td>- ไม่แน่ใจ</td><td style="text-align: center;">${q13["ไม่แน่ใจ"]||0}</td><td style="text-align: center;">${calcPercent(q13["ไม่แน่ใจ"], n)}%</td></tr>

    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">8. สถานที่ที่ประสงค์ให้จัดบริการ</td></tr>
    <tr><td>- ในโรงพยาบาล (แยกส่วนชัดเจน)</td><td style="text-align: center;">${q15["จัดบริการในโรงพยาบาล แต่ให้มีการแยกส่วนชัดเจน"]||0}</td><td style="text-align: center;">${calcPercent(q15["จัดบริการในโรงพยาบาล แต่ให้มีการแยกส่วนชัดเจน"], n)}%</td></tr>
    <tr><td>- นอกโรงพยาบาล หรือสถานที่อื่นๆ</td><td style="text-align: center;">${q15["จัดบริการนอกโรงพยาบาล หรือสถานที่อื่นๆ"]||0}</td><td style="text-align: center;">${calcPercent(q15["จัดบริการนอกโรงพยาบาล หรือสถานที่อื่นๆ"], n)}%</td></tr>
    <tr><td>- อื่นๆ (${data.map(i => i.PreferredLocationOther).filter(Boolean).join(", ") || "ไม่มี"})</td><td style="text-align: center;">${q15["อื่นๆ (ระบุ)......................................................."]||0}</td><td style="text-align: center;">${calcPercent(q15["อื่นๆ (ระบุ)......................................................."], n)}%</td></tr>
  `;

  document.getElementById("p-table-opinions").innerHTML = html;
}

function renderPublicOpinionsTable(data) {
  const n = data.length;
  
  const q6 = countFieldValues(data, "AgreeSMCHospital");
  const q7 = countFieldValues(data, "AgreeSMCOPD");
  const q8 = countFieldValues(data, "AgreeSMCIPD");
  const q9 = countFieldValues(data, "AgreeSMCOR");
  const q10 = countFieldValues(data, "FastService");
  const q11 = countFieldValues(data, "WillUseService");
  const q13 = countFieldValues(data, "ConvenientDoctor");
  const q14 = countFieldValues(data, "ReduceQueue");
  const q15 = countFieldValues(data, "ConvenientTime");
  const q16 = countFieldValues(data, "WillingToPayExtra");
  const q18 = countFieldValues(data, "PreferredLocation");

  let html = `
    <tr>
      <th style="width: 50%;">รายละเอียดข้อคำถาม</th>
      <th style="width: 25%; text-align: center;">จำนวน (คน)</th>
      <th style="width: 25%; text-align: center;">ร้อยละ</th>
    </tr>
    
    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">1. ความเห็นชอบการจัดตั้งคลินิกพิเศษเฉพาะทางในภาพรวมโรงพยาบาล</td></tr>
    <tr><td>- เห็นด้วย</td><td style="text-align: center;">${q6["เห็นด้วย"]||0}</td><td style="text-align: center;">${calcPercent(q6["เห็นด้วย"], n)}%</td></tr>
    <tr><td>- ไม่เห็นด้วย</td><td style="text-align: center;">${(q6["ไม่เห็นด้วย"]||0) + (q6["ไม่เห็นด้วยระบุเหตุผล................................................................................."]||0)}</td><td style="text-align: center;">${calcPercent((q6["ไม่เห็นด้วย"]||0) + (q6["ไม่เห็นด้วยระบุเหตุผล................................................................................."]||0), n)}%</td></tr>

    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">2. เห็นชอบกับการบริการผู้ป่วยนอก (OPD) นอกเวลา</td></tr>
    <tr><td>- เห็นด้วย</td><td style="text-align: center;">${q7["เห็นด้วย"]||0}</td><td style="text-align: center;">${calcPercent(q7["เห็นด้วย"], n)}%</td></tr>
    <tr><td>- ไม่เห็นด้วย</td><td style="text-align: center;">${(q7["ไม่เห็นด้วย"]||0) + (q7["ไม่เห็นด้วยระบุเหตุผล................................................................................."]||0)}</td><td style="text-align: center;">${calcPercent((q7["ไม่เห็นด้วย"]||0) + (q7["ไม่เห็นด้วยระบุเหตุผล................................................................................."]||0), n)}%</td></tr>

    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">3. เห็นชอบกับการจัดบริการหอผู้ป่วยใน (IPD) นอกเวลา</td></tr>
    <tr><td>- เห็นด้วย</td><td style="text-align: center;">${q8["เห็นด้วย"]||0}</td><td style="text-align: center;">${calcPercent(q8["เห็นด้วย"], n)}%</td></tr>
    <tr><td>- ไม่เห็นด้วย</td><td style="text-align: center;">${(q8["ไม่เห็นด้วย"]||0) + (q8["ไม่เห็นด้วยระบุเหตุผล................................................................................."]||0)}</td><td style="text-align: center;">${calcPercent((q8["ไม่เห็นด้วย"]||0) + (q8["ไม่เห็นด้วยระบุเหตุผล................................................................................."]||0), n)}%</td></tr>

    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">4. เห็นชอบกับการผ่าตัดที่ไม่วิกฤต/ไม่ฉุกเฉินนอกเวลา</td></tr>
    <tr><td>- เห็นด้วย</td><td style="text-align: center;">${q9["เห็นด้วย"]||0}</td><td style="text-align: center;">${calcPercent(q9["เห็นด้วย"], n)}%</td></tr>
    <tr><td>- ไม่เห็นด้วย</td><td style="text-align: center;">${(q9["ไม่เห็นด้วย"]||0) + (q9["ไม่เห็นด้วยระบุเหตุผล................................................................................."]||0)}</td><td style="text-align: center;">${calcPercent((q9["ไม่เห็นด้วย"]||0) + (q9["ไม่เห็นด้วยระบุเหตุผล................................................................................."]||0), n)}%</td></tr>

    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">5. คาดว่าจะได้รับบริการรวดเร็วขึ้นหรือไม่</td></tr>
    <tr><td>- เห็นด้วย/รวดเร็วขึ้น</td><td style="text-align: center;">${q10["เห็นด้วย"]||0}</td><td style="text-align: center;">${calcPercent(q10["เห็นด้วย"], n)}%</td></tr>
    <tr><td>- ไม่เห็นด้วย</td><td style="text-align: center;">${q10["ไม่เห็นด้วย"]||0}</td><td style="text-align: center;">${calcPercent(q10["ไม่เห็นด้วย"], n)}%</td></tr>
    <tr><td>- ไม่แน่ใจ</td><td style="text-align: center;">${q10["ไม่แน่ใจ"]||0}</td><td style="text-align: center;">${calcPercent(q10["ไม่แน่ใจ"], n)}%</td></tr>

    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">6. ทัศนคติความตั้งใจจะเข้าใช้บริการ</td></tr>
    <tr><td>- ใช้บริการ</td><td style="text-align: center;">${q11["ใช้บริการ"]||0}</td><td style="text-align: center;">${calcPercent(q11["ใช้บริการ"], n)}%</td></tr>
    <tr><td>- ไม่ใช้บริการ</td><td style="text-align: center;">${q11["ไม่ใช้บริการ"]||0}</td><td style="text-align: center;">${calcPercent(q11["ไม่ใช้บริการ"], n)}%</td></tr>
    <tr><td>- ไม่แน่ใจ</td><td style="text-align: center;">${q11["ไม่แน่ใจ"]||0}</td><td style="text-align: center;">${calcPercent(q11["ไม่แน่ใจ"], n)}%</td></tr>

    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">7. ช่วยเพิ่มความสะดวกในการเลือกแพทย์เฉพาะทาง</td></tr>
    <tr><td>- เห็นด้วย</td><td style="text-align: center;">${q13["เห็นด้วย"]||0}</td><td style="text-align: center;">${calcPercent(q13["เห็นด้วย"], n)}%</td></tr>
    <tr><td>- ไม่เห็นด้วย</td><td style="text-align: center;">${q13["ไม่เห็นด้วย"]||0}</td><td style="text-align: center;">${calcPercent(q13["ไม่เห็นด้วย"], n)}%</td></tr>
    <tr><td>- ไม่แน่ใจ</td><td style="text-align: center;">${q13["ไม่แน่ใจ"]||0}</td><td style="text-align: center;">${calcPercent(q13["ไม่แน่ใจ"], n)}%</td></tr>

    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">8. ช่วยลดเวลารอคอยคิวผ่าตัด</td></tr>
    <tr><td>- เห็นด้วย</td><td style="text-align: center;">${q14["เห็นด้วย"]||0}</td><td style="text-align: center;">${calcPercent(q14["เห็นด้วย"], n)}%</td></tr>
    <tr><td>- ไม่เห็นด้วย</td><td style="text-align: center;">${q14["ไม่เห็นด้วย"]||0}</td><td style="text-align: center;">${calcPercent(q14["ไม่เห็นด้วย"], n)}%</td></tr>
    <tr><td>- ไม่แน่ใจ</td><td style="text-align: center;">${q14["ไม่แน่ใจ"]||0}</td><td style="text-align: center;">${calcPercent(q14["ไม่แน่ใจ"], n)}%</td></tr>

    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">9. ช่วงเวลาที่สะดวกมาใช้บริการ</td></tr>
    <tr><td>- เวลา 08.00 น. – 16.00 น.</td><td style="text-align: center;">${q15["เวลา 08.00 น. – 16.00 น."]||0}</td><td style="text-align: center;">${calcPercent(q15["เวลา 08.00 น. – 16.00 น."], n)}%</td></tr>
    <tr><td>- เวลา 17.00 น. – 21.00 น.</td><td style="text-align: center;">${q15["เวลา 17.00 น. – 21.00 น."]||0}</td><td style="text-align: center;">${calcPercent(q15["เวลา 17.00 น. – 21.00 น."], n)}%</td></tr>
    <tr><td>- เวลา 21.00 น. เป็นต้นไป</td><td style="text-align: center;">${q15["เวลา 21.00 น. เป็นต้นไป"]||0}</td><td style="text-align: center;">${calcPercent(q15["เวลา 21.00 น. เป็นต้นไป"], n)}%</td></tr>
    <tr><td>- เวลา 24 ชั่วโมง</td><td style="text-align: center;">${q15["เวลา 24 ชั่วโมง"]||0}</td><td style="text-align: center;">${calcPercent(q15["เวลา 24 ชั่วโมง"], n)}%</td></tr>

    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">10. ความยินดีที่จะชำระค่าบริการเพิ่มเติม</td></tr>
    <tr><td>- ยินดีจ่ายเพิ่ม</td><td style="text-align: center;">${q16["ยินดีจ่ายเพิ่ม"]||0}</td><td style="text-align: center;">${calcPercent(q16["ยินดีจ่ายเพิ่ม"], n)}%</td></tr>
    <tr><td>- ไม่ยินดีจ่ายเพิ่ม</td><td style="text-align: center;">${q16["ไม่ยินดีจ่ายเพิ่ม"]||0}</td><td style="text-align: center;">${calcPercent(q16["ไม่ยินดีจ่ายเพิ่ม"], n)}%</td></tr>
    <tr><td>- ไม่แน่ใจ</td><td style="text-align: center;">${q16["ไม่แน่ใจ"]||0}</td><td style="text-align: center;">${calcPercent(q16["ไม่แน่ใจ"], n)}%</td></tr>

    <tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">11. สถานที่ที่ประสงค์ให้จัดบริการ</td></tr>
    <tr><td>- ในโรงพยาบาล (แยกส่วนชัดเจน)</td><td style="text-align: center;">${q18["จัดบริการในโรงพยาบาล แต่ให้มีการแยกส่วนชัดเจน"]||0}</td><td style="text-align: center;">${calcPercent(q18["จัดบริการในโรงพยาบาล แต่ให้มีการแยกส่วนชัดเจน"], n)}%</td></tr>
    <tr><td>- นอกโรงพยาบาล หรือสถานที่อื่นๆ</td><td style="text-align: center;">${q18["จัดบริการนอกโรงพยาบาล หรือสถานที่อื่นๆ"]||0}</td><td style="text-align: center;">${calcPercent(q18["จัดบริการนอกโรงพยาบาล หรือสถานที่อื่นๆ"], n)}%</td></tr>
    <tr><td>- อื่นๆ (${data.map(i => i.PreferredLocationOther).filter(Boolean).join(", ") || "ไม่มี"})</td><td style="text-align: center;">${q18["อื่นๆ (ระบุ)......................................................."]||0}</td><td style="text-align: center;">${calcPercent(q18["อื่นๆ (ระบุ)......................................................."], n)}%</td></tr>
  `;

  document.getElementById("pub-table-opinions").innerHTML = html;
}

function renderPersonnelFeedbackLists(data) {
  const opdList = document.getElementById("p-list-opd");
  const ipdList = document.getElementById("p-list-ipd");
  const orList = document.getElementById("p-list-or");
  const sugList = document.getElementById("p-list-suggestions");

  opdList.innerHTML = data.filter(i => i.OPDService).map(i => `<li><strong>บริการ:</strong> ${i.OPDService} <span style="color:#64748B;">(เหตุผล: ${i.OPDReason || "ไม่ได้ระบุ"})</span></li>`).join("") || "<li>ไม่มีการระบุข้อคิดเห็น</li>";
  ipdList.innerHTML = data.filter(i => i.IPDService).map(i => `<li><strong>บริการ:</strong> ${i.IPDService} <span style="color:#64748B;">(เหตุผล: ${i.IPDReason || "ไม่ได้ระบุ"})</span></li>`).join("") || "<li>ไม่มีการระบุข้อคิดเห็น</li>";
  orList.innerHTML = data.filter(i => i.ORService).map(i => `<li><strong>บริการ:</strong> ${i.ORService} <span style="color:#64748B;">(เหตุผล: ${i.ORReason || "ไม่ได้ระบุ"})</span></li>`).join("") || "<li>ไม่มีการระบุข้อคิดเห็น</li>";
  sugList.innerHTML = data.filter(i => i.Suggestions).map(i => `<li>${i.Suggestions}</li>`).join("") || "<li>ไม่มีข้อเสนอแนะเพิ่มเติม</li>";
}

function renderPublicFeedbackLists(data) {
  const opdList = document.getElementById("pub-list-opd");
  const ipdList = document.getElementById("pub-list-ipd");
  const orList = document.getElementById("pub-list-or");
  const sugList = document.getElementById("pub-list-suggestions");

  opdList.innerHTML = data.filter(i => i.OPDService).map(i => `<li><strong>บริการ:</strong> ${i.OPDService} <span style="color:#64748B;">(เหตุผล: ${i.OPDReason || "ไม่ได้ระบุ"})</span></li>`).join("") || "<li>ไม่มีการระบุข้อคิดเห็น</li>";
  ipdList.innerHTML = data.filter(i => i.IPDService).map(i => `<li><strong>บริการ:</strong> ${i.IPDService} <span style="color:#64748B;">(เหตุผล: ${i.IPDReason || "ไม่ได้ระบุ"})</span></li>`).join("") || "<li>ไม่มีการระบุข้อคิดเห็น</li>";
  orList.innerHTML = data.filter(i => i.ORService).map(i => `<li><strong>บริการ:</strong> ${i.ORService} <span style="color:#64748B;">(เหตุผล: ${i.ORReason || "ไม่ได้ระบุ"})</span></li>`).join("") || "<li>ไม่มีการระบุข้อคิดเห็น</li>";
  sugList.innerHTML = data.filter(i => i.Suggestions).map(i => `<li>${i.Suggestions}</li>`).join("") || "<li>ไม่มีข้อเสนอแนะเพิ่มเติม</li>";
}

function calcPercent(val, total) {
  if (!total || !val) return 0;
  return ((val / total) * 100).toFixed(1);
}

// ----------------------------------------------------
// EXPORT EXCEL (CSV file with UTF-8 BOM representation)
// ----------------------------------------------------
function exportDataToCsv(type) {
  const data = type === "personnel" ? globalSurveyData.personnel : globalSurveyData.public;
  if (data.length === 0) {
    alert("ไม่มีข้อมูลที่จะส่งออกในขณะนี้");
    return;
  }

  let headers = [];
  let keys = [];

  if (type === "personnel") {
    keys = ["Timestamp", "Gender", "Age", "Type", "TypeOther", "Position", "PositionOther", "Income", "AgreeSMC", "DisagreeReason", "FastService", "WillUseService", "DesiredClinics", "DesiredClinicsOther", "ConvenientDoctor", "ReduceQueue", "ConvenientTime", "WillingToPayExtra", "PayExtraParts", "PayExtraPartsOther", "PreferredLocation", "PreferredLocationOther", "OPDService", "OPDReason", "IPDService", "IPDReason", "ORService", "ORReason", "Suggestions"];
    headers = ["ประทับเวลา", "เพศ", "อายุ", "ประเภทบุคลากร", "ระบุประเภทอื่นๆ", "ตำแหน่งสายงาน", "ระบุตำแหน่งอื่นๆ", "รายได้รวมต่อเดือนของครอบครัว", "เห็นด้วยต่อ SMC", "เหตุผลไม่เห็นด้วย SMC", "บริการที่รวดเร็วขึ้น", "ความตั้งใจจะใช้บริการ", "คลินิกเฉพาะทางที่ต้องการ", "ระบุคลินิกอื่นๆ", "ความสะดวกเลือกแพทย์เฉพาะทาง", "ลดเวลารอผ่าตัด", "ช่วงเวลาสะดวกรับบริการ", "ยินดีจ่ายเพิ่ม", "ส่วนที่สมัครใจจ่ายเพิ่ม", "ระบุส่วนเพิ่มเติมอื่นๆ", "สถานที่ต้องการให้จัดบริการ", "ระบุสถานที่อื่นๆ", "OPD บริการที่อยากเห็น", "OPD เหตุผลประกอบ", "IPD บริการที่อยากเห็น", "IPD เหตุผลประกอบ", "OR บริการที่อยากเห็น", "OR เหตุผลประกอบ", "ข้อเสนอแนะอื่นๆ"];
  } else {
    keys = ["Timestamp", "Gender", "Age", "Occupation", "OccupationOther", "TreatmentRight", "TreatmentRightOther", "Income", "AgreeSMCHospital", "DisagreeReasonHospital", "AgreeSMCOPD", "DisagreeReasonOPD", "AgreeSMCIPD", "DisagreeReasonIPD", "AgreeSMCOR", "DisagreeReasonOR", "FastService", "WillUseService", "DesiredClinics", "DesiredClinicsOther", "ConvenientDoctor", "ReduceQueue", "ConvenientTime", "WillingToPayExtra", "PayExtraParts", "PayExtraPartsOther", "PreferredLocation", "PreferredLocationOther", "OPDService", "OPDReason", "IPDService", "IPDReason", "ORService", "ORReason", "Suggestions"];
    headers = ["ประทับเวลา", "เพศ", "อายุ", "อาชีพหลัก", "ระบุอาชีพอื่นๆ", "สิทธิ์การรักษา", "ระบุสิทธิ์อื่นๆ", "รายได้รวมต่อเดือนของครอบครัว", "เห็นด้วยต่อ SMC ในรพ.", "เหตุผลไม่เห็นด้วย SMC ในรพ.", "เห็นด้วยต่อ SMC ที่ OPD", "เหตุผลไม่เห็นด้วย SMC ที่ OPD", "เห็นด้วยต่อ SMC ที่ IPD", "เหตุผลไม่เห็นด้วย SMC ที่ IPD", "เห็นด้วยต่อ SMC ในการผ่าตัด", "เหตุผลไม่เห็นด้วย SMC ในการผ่าตัด", "บริการที่รวดเร็วขึ้น", "ความตั้งใจจะใช้บริการ", "คลินิกเฉพาะทางที่ต้องการ", "ระบุคลินิกอื่นๆ", "ความสะดวกเลือกแพทย์เฉพาะทาง", "ลดเวลารอผ่าตัด", "ช่วงเวลาสะดวกรับบริการ", "ยินดีจ่ายเพิ่ม", "ส่วนที่สมัครใจจ่ายเพิ่ม", "ระบุส่วนเพิ่มเติมอื่นๆ", "สถานที่ต้องการให้จัดบริการ", "ระบุสถานที่อื่นๆ", "OPD บริการที่อยากเห็น", "OPD เหตุผลประกอบ", "IPD บริการที่อยากเห็น", "IPD เหตุผลประกอบ", "OR บริการที่อยากเห็น", "OR เหตุผลประกอบ", "ข้อเสนอแนะอื่นๆ"];
  }

  let csvContent = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\r\n";

  data.forEach(row => {
    let rowVals = keys.map(key => {
      let val = row[key] || "";
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvContent += rowVals.join(",") + "\r\n";
  });

  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `SMC_Survey_${type === "personnel" ? "Personnel" : "Public"}_RawData.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ----------------------------------------------------
// CHART GENERATION HELPERS
// ----------------------------------------------------
function createPieChart(canvasId, dataObj, colors) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  const labels = Object.keys(dataObj);
  const data = Object.values(dataObj);
  
  return new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

function createBarChart(canvasId, labels, datasets) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  return new Chart(ctx, {
    type: "bar",
    data: { labels: labels, datasets: datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "none" } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

function createHorizontalBarChart(canvasId, labels, datasets) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  return new Chart(ctx, {
    type: "bar",
    data: { labels: labels, datasets: datasets },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "none" } },
      scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

function countAgeRanges(arr) {
  const counts = [0, 0, 0, 0, 0, 0];
  arr.forEach(item => {
    const age = parseInt(item.Age);
    if (isNaN(age)) return;
    if (age < 20) counts[0]++;
    else if (age <= 29) counts[1]++;
    else if (age <= 39) counts[2]++;
    else if (age <= 49) counts[3]++;
    else if (age <= 59) counts[4]++;
    else counts[5]++;
  });
  return counts;
}

function countMultipleChoice(arr, fieldName) {
  const counts = {};
  arr.forEach(item => {
    const rawVal = item[fieldName];
    if (!rawVal) return;
    const choices = rawVal.split(",").map(s => s.trim());
    choices.forEach(choice => {
      let found = false;
      for (let std of CLINICS_LIST) {
        if (choice.includes(std)) {
          counts[std] = (counts[std] || 0) + 1;
          found = true;
          break;
        }
      }
      if (!found && choice) {
        counts["ตรวจสุขภาพ"] = (counts["ตรวจสุขภาพ"] || 0) + 1;
      }
    });
  });
  return counts;
}

function countFieldValues(arr, fieldName) {
  const counts = {};
  arr.forEach(item => {
    let val = item[fieldName];
    if (val === undefined || val === null || val === "") {
      val = "ไม่ระบุ";
    }
    counts[val] = (counts[val] || 0) + 1;
  });
  return counts;
}

function mergeCounts(obj1, obj2) {
  const res = { ...obj1 };
  Object.keys(obj2).forEach(key => {
    res[key] = (res[key] || 0) + obj2[key];
  });
  return res;
}

function showAlertModal(title, message, iconType, callback = null) {
  let modal = document.getElementById("alert-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "alert-modal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-icon" id="modal-icon"></div>
        <h3 id="modal-title" style="margin-bottom: 0.75rem;"></h3>
        <p id="modal-msg" style="color: var(--text-light); margin-bottom: 1.5rem;"></p>
        <button id="modal-close-btn" class="btn btn-primary" style="display: none; width: 100%;">ตกลง</button>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  const icon = document.getElementById("modal-icon");
  const titleEl = document.getElementById("modal-title");
  const msgEl = document.getElementById("modal-msg");
  const btn = document.getElementById("modal-close-btn");
  
  titleEl.innerText = title;
  msgEl.innerText = message;
  
  icon.className = "modal-icon";
  
  if (iconType === "loading") {
    icon.innerHTML = `<span style="font-size: 2.5rem; display:inline-block; animation: spin 1s linear infinite;">⏳</span>`;
    btn.style.display = "none";
  } else if (iconType === "success") {
    icon.classList.add("success");
    icon.innerHTML = "✔";
    btn.style.display = "block";
    btn.className = "btn btn-primary";
  } else if (iconType === "error") {
    icon.classList.add("error");
    icon.innerHTML = "❌";
    btn.style.display = "block";
    btn.className = "btn btn-secondary";
  }
  
  modal.classList.add("active");
  
  btn.onclick = () => {
    modal.classList.remove("active");
    if (callback) callback();
  };
}

// ----------------------------------------------------
// OVERRIDES & ENHANCEMENTS
// Keep these last so they win over the earlier draft helpers.
// ----------------------------------------------------

function getThaiDateText(date = new Date()) {
  const dtf = new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const parts = dtf.formatToParts(date);
  const day = parts.find(p => p.type === "day")?.value || "";
  const month = parts.find(p => p.type === "month")?.value || "";
  const year = parts.find(p => p.type === "year")?.value || "";
  return `${day} เดือน${month} พ.ศ.${year}`;
}

function getThaiDateTimeText(date = new Date()) {
  const dtf = new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  return dtf.format(date);
}

function renderThaiDateLabels() {
  document.querySelectorAll(".thai-date-lbl").forEach(el => {
    el.textContent = `วันที่ ${getThaiDateText()}`;
  });
}

function normalizeOptionByContains(rawValue, options) {
  const value = String(rawValue || "").trim();
  if (!value) return "";
  for (const option of options) {
    if (value === option) return option;
    if (value.includes(option) || option.includes(value)) return option;
  }
  return value;
}

function countKnownFieldValues(arr, fieldName, options) {
  const counts = {};
  const unmatched = {};
  arr.forEach(item => {
    const raw = String(item?.[fieldName] || "").trim();
    if (!raw) {
      counts["ไม่ระบุ"] = (counts["ไม่ระบุ"] || 0) + 1;
      return;
    }
    const normalized = normalizeOptionByContains(raw, options);
    if (options.includes(normalized)) {
      counts[normalized] = (counts[normalized] || 0) + 1;
    } else {
      unmatched[normalized] = (unmatched[normalized] || 0) + 1;
    }
  });
  Object.keys(unmatched).forEach(key => {
    counts[key] = unmatched[key];
  });
  counts._otherCount = Object.values(unmatched).reduce((sum, val) => sum + val, 0);
  counts._otherValues = unmatched;
  return counts;
}

function countMultipleChoice(arr, fieldName, allowedValues = CLINICS_LIST) {
  const counts = {};
  const otherValues = {};
  arr.forEach(item => {
    const raw = item?.[fieldName];
    if (!raw) return;
    String(raw)
      .split(",")
      .map(v => v.trim())
      .filter(Boolean)
      .forEach(choice => {
        const normalized = normalizeOptionByContains(choice, allowedValues);
        if (allowedValues.includes(normalized)) {
          counts[normalized] = (counts[normalized] || 0) + 1;
        } else {
          otherValues[normalized] = (otherValues[normalized] || 0) + 1;
        }
      });
  });
  counts._otherCount = Object.values(otherValues).reduce((sum, val) => sum + val, 0);
  counts._otherValues = otherValues;
  return counts;
}

function summarizeTextValues(values, limit = 4) {
  const unique = [...new Set(values.map(v => String(v || "").trim()).filter(Boolean))];
  if (unique.length === 0) return "ไม่มี";
  if (unique.length <= limit) return unique.join(", ");
  return `${unique.slice(0, limit).join(", ")} ...`;
}

function renderCountRow(label, count, total) {
  return `<tr><td>- ${label}</td><td style="text-align: center;">${count || 0}</td><td style="text-align: center;">${calcPercent(count || 0, total)}%</td></tr>`;
}

function renderSectionHeader(title) {
  return `<tr><td colspan="3" style="font-weight: bold; background-color: #FAFBFD;">${title}</td></tr>`;
}

function renderChoiceSection(title, items, counts, total, otherLabel = null) {
  let html = renderSectionHeader(title);
  items.forEach(item => {
    const label = typeof item === "string" ? item : item.label;
    const key = typeof item === "string" ? item : item.key;
    html += renderCountRow(label, counts[key] || 0, total);
  });
  if (otherLabel && counts._otherCount > 0) {
    const samples = summarizeTextValues(Object.keys(counts._otherValues || {}));
    html += renderCountRow(`${otherLabel} (${samples})`, counts._otherCount, total);
  } else if (otherLabel) {
    html += renderCountRow(otherLabel, 0, total);
  }
  return html;
}

function buildClinicSection(data, total, title = "หากมีการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ ท่านต้องการให้เปิดบริการคลินิกพิเศษเฉพาะทางใดบ้าง (ตอบได้มากกว่า 1 ข้อ)") {
  const clinicCounts = countMultipleChoice(data, "DesiredClinics", CLINICS_LIST);
  const otherTexts = data.map(row => row.DesiredClinicsOther).filter(Boolean);

  let html = renderSectionHeader(title);
  CLINICS_LIST.forEach(clinic => {
    html += renderCountRow(clinic, clinicCounts[clinic] || 0, total);
  });
  html += renderCountRow(`อื่นๆ (${summarizeTextValues(otherTexts)})`, Math.max(clinicCounts._otherCount, otherTexts.length), total);
  return html;
}

function buildPayExtraSection(data, total, title = "หากมีคลินิกพิเศษเฉพาะทางนอกเวลาราชการ ท่านสมัครใจที่จะจ่ายค่าบริการเพิ่มในส่วนใดบ้าง (ตอบได้มากกว่า 1 ข้อ)") {
  const payOptions = [
    "ค่าบริการทางการแพทย์",
    "ค่าธรรมเนียมแพทย์",
    "ค่าห้องพิเศษ",
    "ค่าบริการตรวจพิเศษ (เพิ่มเติม)"
  ];
  const counts = countMultipleChoice(data, "PayExtraParts", payOptions);
  const otherTexts = data.map(row => row.PayExtraPartsOther).filter(Boolean);
  let html = renderSectionHeader(title);
  payOptions.forEach(option => {
    html += renderCountRow(option, counts[option] || 0, total);
  });
  html += renderCountRow(`อื่นๆ (${summarizeTextValues(otherTexts)})`, Math.max(counts._otherCount, otherTexts.length), total);
  return html;
}

function buildPreferredLocationSection(data, total, title = "หากมีคลินิกพิเศษเฉพาะทางนอกเวลาราชการ ท่านต้องการให้จัดบริการที่ใด") {
  const locationOptions = [
    "จัดบริการในโรงพยาบาล แต่ให้มีการแยกส่วนชัดเจน",
    "จัดบริการนอกโรงพยาบาล หรือสถานที่อื่นๆ"
  ];
  const counts = countMultipleChoice(data, "PreferredLocation", locationOptions);
  const otherTexts = data.map(row => row.PreferredLocationOther).filter(Boolean);
  let html = renderSectionHeader(title);
  locationOptions.forEach(option => {
    html += renderCountRow(option, counts[option] || 0, total);
  });
  html += renderCountRow(`อื่นๆ (${summarizeTextValues(otherTexts)})`, Math.max(counts._otherCount, otherTexts.length), total);
  return html;
}

function renderPersonnelDemographicsTable(data) {
  const n = data.length;
  const genders = countFieldValues(data, "Gender");
  const ages = data.map(i => parseInt(i.Age)).filter(a => !isNaN(a));
  const ageBuckets = countAgeRanges(data);
  const types = countFieldValues(data, "Type");
  const positions = countKnownFieldValues(data, "Position", POSITIONS_LIST);
  const incomes = countFieldValues(data, "Income");
  const minAge = ages.length ? Math.min(...ages) : 0;
  const maxAge = ages.length ? Math.max(...ages) : 0;
  const meanAge = ages.length ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : 0;
  const otherTypeTexts = data.map(item => item.TypeOther).filter(Boolean);
  const sortedPositions = Object.keys(positions).filter(key => !key.startsWith("_")).sort((a, b) => (positions[b] || 0) - (positions[a] || 0));

  let rows = "";
  rows += renderSectionHeader("1. เพศ");
  rows += renderCountRow("ชาย", genders["ชาย"] || 0, n);
  rows += renderCountRow("หญิง", genders["หญิง"] || 0, n);
  rows += renderSectionHeader(`2. ช่วงอายุ (ต่ำสุด: ${minAge} ปี, สูงสุด: ${maxAge} ปี, เฉลี่ย: ${meanAge} ปี)`);
  rows += renderCountRow("ต่ำกว่า 20 ปี", ageBuckets[0], n);
  rows += renderCountRow("20 - 29 ปี", ageBuckets[1], n);
  rows += renderCountRow("30 - 39 ปี", ageBuckets[2], n);
  rows += renderCountRow("40 - 49 ปี", ageBuckets[3], n);
  rows += renderCountRow("50 - 59 ปี", ageBuckets[4], n);
  rows += renderCountRow("60 ปีขึ้นไป", ageBuckets[5], n);
  rows += renderSectionHeader("3. ประเภทบุคลากร");
  rows += renderCountRow("ข้าราชการ", types["ข้าราชการ"] || 0, n);
  rows += renderCountRow("พนักงานราชการ", types["พนักงานราชการ"] || 0, n);
  rows += renderCountRow("พนักงานกระทรวงสาธารณสุข", types["พนักงานกระทรวงสาธารณสุข"] || 0, n);
  rows += renderCountRow("ลูกจ้างชั่วคราว", types["ลูกจ้างชั่วคราว"] || 0, n);
  rows += renderCountRow("ลูกจ้างประจำ", types["ลูกจ้างประจำ"] || 0, n);
  rows += renderCountRow(`อื่นๆ (${summarizeTextValues(otherTypeTexts)})`, otherTypeTexts.length, n);
  rows += renderSectionHeader("4. ตำแหน่งสายงาน");
  if (sortedPositions.length === 0) {
    rows += `<tr><td colspan="3" style="text-align:center;color:var(--text-light);">ยังไม่มีข้อมูลตำแหน่งสายงาน</td></tr>`;
  } else {
    sortedPositions.forEach(pos => {
      rows += renderCountRow(pos, positions[pos], n);
    });
  }
  if (positions._otherCount > 0) {
    rows += renderCountRow(`อื่นๆ (${summarizeTextValues(Object.keys(positions._otherValues || {}))})`, positions._otherCount, n);
  }
  rows += renderSectionHeader("5. รายได้รวมต่อเดือนของครอบครัว");
  rows += renderCountRow("ต่ำกว่า 10,000 บาท", incomes["ต่ำกว่า 10,000 บาท"] || incomes["ต่ำกว่า 10,000"] || 0, n);
  rows += renderCountRow("10,001 – 30,000 บาท", incomes["10,001 – 30,000"] || 0, n);
  rows += renderCountRow("30,001 – 50,000 บาท", incomes["30,001 – 50,000"] || 0, n);
  rows += renderCountRow("50,001 – 70,000 บาท", incomes["50,001 – 70,000"] || 0, n);
  rows += renderCountRow("70,001 – 90,000 บาท", incomes["70,001 – 90,000"] || 0, n);
  rows += renderCountRow("มากกว่า 90,000 บาท", incomes["มากกว่า 90,000 บาท"] || incomes["มากกว่า 90,000"] || 0, n);

  document.getElementById("p-table-demographics").innerHTML = `
    <thead>
      <tr>
        <th style="width: 50%;">ข้อมูลส่วนบุคคล</th>
        <th style="width: 25%; text-align: center;">จำนวน (คน)</th>
        <th style="width: 25%; text-align: center;">ร้อยละ</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  `;
}

function renderPublicDemographicsTable(data) {
  const n = data.length;
  const genders = countFieldValues(data, "Gender");
  const ages = data.map(i => parseInt(i.Age)).filter(a => !isNaN(a));
  const ageBuckets = countAgeRanges(data);
  const occupations = countFieldValues(data, "Occupation");
  const rights = countFieldValues(data, "TreatmentRight");
  const incomes = countFieldValues(data, "Income");
  const minAge = ages.length ? Math.min(...ages) : 0;
  const maxAge = ages.length ? Math.max(...ages) : 0;
  const meanAge = ages.length ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : 0;

  let html = `
    <tr>
      <th style="width: 50%;">ข้อมูลส่วนบุคคล</th>
      <th style="width: 25%; text-align: center;">จำนวน (คน)</th>
      <th style="width: 25%; text-align: center;">ร้อยละ</th>
    </tr>
    ${renderSectionHeader("1. เพศ")}
    ${renderCountRow("ชาย", genders["ชาย"] || 0, n)}
    ${renderCountRow("หญิง", genders["หญิง"] || 0, n)}
    ${renderSectionHeader(`2. ช่วงอายุ (ต่ำสุด: ${minAge} ปี, สูงสุด: ${maxAge} ปี, เฉลี่ย: ${meanAge} ปี)`) }
    ${renderCountRow("ต่ำกว่า 20 ปี", ageBuckets[0], n)}
    ${renderCountRow("20 - 29 ปี", ageBuckets[1], n)}
    ${renderCountRow("30 - 39 ปี", ageBuckets[2], n)}
    ${renderCountRow("40 - 49 ปี", ageBuckets[3], n)}
    ${renderCountRow("50 - 59 ปี", ageBuckets[4], n)}
    ${renderCountRow("60 ปีขึ้นไป", ageBuckets[5], n)}
    ${renderSectionHeader("3. อาชีพหลัก")}
    ${renderCountRow("ข้าราชการ/เจ้าหน้าที่รัฐ/รัฐวิสาหกิจ", occupations["ข้าราชการ/เจ้าหน้าที่รัฐ/รัฐวิสาหกิจ"] || 0, n)}
    ${renderCountRow("พนักงานบริษัท", occupations["พนักงานบริษัท"] || 0, n)}
    ${renderCountRow("ค้าขาย/ธุรกิจส่วนตัว", occupations["ค้าขาย/ธุรกิจส่วนตัว"] || 0, n)}
    ${renderCountRow("เกษตรกร", occupations["เกษตรกร"] || 0, n)}
    ${renderCountRow("รับจ้างทั่วไป/กรรมกร", occupations["รับจ้างทั่วไป/กรรมกร"] || 0, n)}
    ${renderCountRow("แม่บ้าน/พ่อบ้าน", occupations["แม่บ้าน/พ่อบ้าน"] || 0, n)}
    ${renderCountRow("นักเรียน/นักศึกษา", occupations["นักเรียน/นักศึกษา"] || 0, n)}
    ${renderCountRow("อื่นๆ/ว่างงาน", occupations["อื่นๆ/ว่างงาน"] || 0, n)}
    ${renderSectionHeader("4. สิทธิการตรวจรักษาโรค")}
    ${renderCountRow("สวัสดิการข้าราชการ", rights["สวัสดิการข้าราชการ"] || 0, n)}
    ${renderCountRow("ประกันสังคม", rights["ประกันสังคม"] || 0, n)}
    ${renderCountRow("บัตรทอง (หลักประกันสุขภาพ)", rights["บัตรทอง"] || 0, n)}
    ${renderCountRow(`อื่นๆ (${summarizeTextValues(Object.keys(rights._otherValues || {}))})`, rights["อื่นๆ"] || 0, n)}
    ${rights._otherCount > 0 ? renderCountRow(`อื่นๆ เพิ่มเติม (${summarizeTextValues(Object.keys(rights._otherValues || {}))})`, rights._otherCount, n) : ""}
    ${renderSectionHeader("5. รายได้รวมต่อเดือนของครอบครัว")}
    ${renderCountRow("ต่ำกว่า 10,000 บาท", incomes["ต่ำกว่า 10,000 บาท"] || incomes["ต่ำกว่า 10,000"] || 0, n)}
    ${renderCountRow("10,001 – 30,000 บาท", incomes["10,001 – 30,000"] || 0, n)}
    ${renderCountRow("30,001 – 50,000 บาท", incomes["30,001 – 50,000"] || 0, n)}
    ${renderCountRow("50,001 – 70,000 บาท", incomes["50,001 – 70,000"] || 0, n)}
    ${renderCountRow("70,001 – 90,000 บาท", incomes["70,001 – 90,000"] || 0, n)}
    ${renderCountRow("มากกว่า 90,000 บาท", incomes["มากกว่า 90,000 บาท"] || incomes["มากกว่า 90,000"] || 0, n)}
    </tbody>
  `;

  document.getElementById("pub-table-demographics").innerHTML = html;
}

function renderPersonnelOpinionsTable(data) {
  const n = data.length;
  const agreeSMC = countFieldValues(data, "AgreeSMC");
  const fastService = countFieldValues(data, "FastService");
  const willUse = countFieldValues(data, "WillUseService");
  const clinics = countMultipleChoice(data, "DesiredClinics", CLINICS_LIST);
  const convenientDoctor = countFieldValues(data, "ConvenientDoctor");
  const reduceQueue = countFieldValues(data, "ReduceQueue");
  const convenientTime = countFieldValues(data, "ConvenientTime");
  const payExtra = countFieldValues(data, "WillingToPayExtra");
  const payParts = countMultipleChoice(data, "PayExtraParts", [
    "ค่าบริการทางการแพทย์",
    "ค่าธรรมเนียมแพทย์",
    "ค่าห้องพิเศษ",
    "ค่าบริการตรวจพิเศษ (เพิ่มเติม)"
  ]);
  const location = countFieldValues(data, "PreferredLocation");

  let html = `
    <thead>
      <tr>
        <th style="width: 50%;">รายละเอียด</th>
        <th style="width: 25%; text-align: center;">จำนวน (คน)</th>
        <th style="width: 25%; text-align: center;">ร้อยละ</th>
      </tr>
    </thead>
    <tbody>
    ${renderSectionHeader("1. ท่านเห็นด้วยหรือไม่กับการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการโรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน")}
    ${renderCountRow("เห็นด้วย", agreeSMC["เห็นด้วย"] || 0, n)}
    ${renderCountRow("ไม่เห็นด้วย", agreeSMC["ไม่เห็นด้วย"] || 0, n)}
    ${renderSectionHeader("2. หากมีการจัดคลินิกพิเศษเฉพาะทางนอกเวลาราชการ ท่านคิดว่าทำให้ได้รับบริการรวดเร็วขึ้นหรือไม่")}
    ${renderCountRow("เห็นด้วย/รวดเร็วขึ้น", fastService["เห็นด้วย/รวดเร็วขึ้น"] || 0, n)}
    ${renderCountRow("ไม่เห็นด้วย", fastService["ไม่เห็นด้วย"] || 0, n)}
    ${renderCountRow("ไม่แน่ใจ", fastService["ไม่แน่ใจ"] || 0, n)}
    ${renderSectionHeader("3. หากมีการจัดคลินิกพิเศษเฉพาะทางนอกเวลาราชการ ท่านจะใช้บริการหรือไม่")}
    ${renderCountRow("ใช้บริการ", willUse["ใช้บริการ"] || 0, n)}
    ${renderCountRow("ไม่ใช้บริการ", willUse["ไม่ใช้บริการ"] || 0, n)}
    ${renderCountRow("ไม่แน่ใจ", willUse["ไม่แน่ใจ"] || 0, n)}
    ${buildClinicSection(data, n)}
    ${renderSectionHeader("5. หากมีคลินิกพิเศษเฉพาะทางนอกเวลาราชการ จะทำให้เลือกแพทย์เฉพาะทางได้สะดวกกว่าหรือไม่")}
    ${renderCountRow("เห็นด้วย", convenientDoctor["เห็นด้วย"] || 0, n)}
    ${renderCountRow("ไม่เห็นด้วย", convenientDoctor["ไม่เห็นด้วย"] || 0, n)}
    ${renderCountRow("ไม่แน่ใจ", convenientDoctor["ไม่แน่ใจ"] || 0, n)}
    ${renderSectionHeader("6. หากมีคลินิกพิเศษเฉพาะทางนอกเวลาราชการ จะทำให้ลดระยะเวลารอคอยคิวผ่าตัดได้หรือไม่")}
    ${renderCountRow("เห็นด้วย", reduceQueue["เห็นด้วย"] || 0, n)}
    ${renderCountRow("ไม่เห็นด้วย", reduceQueue["ไม่เห็นด้วย"] || 0, n)}
    ${renderCountRow("ไม่แน่ใจ", reduceQueue["ไม่แน่ใจ"] || 0, n)}
    ${renderSectionHeader("7. ช่วงเวลาที่ท่านสะดวกมาใช้บริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ")}
    ${renderCountRow("กลางวัน", convenientTime["กลางวัน"] || 0, n)}
    ${renderCountRow("ตอนเย็น", convenientTime["ตอนเย็น"] || 0, n)}
    ${renderCountRow("กลางคืน", convenientTime["กลางคืน"] || 0, n)}
    ${renderCountRow("ตลอดทั้งวัน", convenientTime["ตลอดทั้งวัน"] || 0, n)}
    ${renderSectionHeader("8. หากมีคลินิกพิเศษเฉพาะทางนอกเวลาราชการ ท่านยินดีที่จะจ่ายค่าบริการเพิ่มหรือไม่ (โดยใช้สิทธิเดิมได้)")}
    ${renderCountRow("ยินดีจ่ายเพิ่ม", payExtra["ยินดีจ่ายเพิ่ม"] || 0, n)}
    ${renderCountRow("ไม่ยินดีจ่ายเพิ่ม", payExtra["ไม่ยินดีจ่ายเพิ่ม"] || 0, n)}
    ${renderCountRow("ไม่แน่ใจ", payExtra["ไม่แน่ใจ"] || 0, n)}
  ${buildPayExtraSection(data, n)}
  ${buildPreferredLocationSection(data, n)}
    </tbody>
  `;

  document.getElementById("p-table-opinions").innerHTML = html;
}

function renderPublicOpinionsTable(data) {
  const n = data.length;
  const agreeHospital = countFieldValues(data, "AgreeSMCHospital");
  const agreeOPD = countFieldValues(data, "AgreeSMCOPD");
  const agreeIPD = countFieldValues(data, "AgreeSMCIPD");
  const agreeOR = countFieldValues(data, "AgreeSMCOR");
  const fastService = countFieldValues(data, "FastService");
  const willUse = countFieldValues(data, "WillUseService");
  const clinics = countMultipleChoice(data, "DesiredClinics", CLINICS_LIST);
  const convenientDoctor = countFieldValues(data, "ConvenientDoctor");
  const reduceQueue = countFieldValues(data, "ReduceQueue");
  const convenientTime = countFieldValues(data, "ConvenientTime");
  const payExtra = countFieldValues(data, "WillingToPayExtra");
  const payParts = countMultipleChoice(data, "PayExtraParts", [
    "ค่าบริการทางการแพทย์",
    "ค่าธรรมเนียมแพทย์",
    "ค่าห้องพิเศษ",
    "ค่าบริการตรวจพิเศษ (เพิ่มเติม)"
  ]);
  const location = countFieldValues(data, "PreferredLocation");

  let html = `
    <thead>
      <tr>
        <th style="width: 50%;">รายละเอียด</th>
        <th style="width: 25%; text-align: center;">จำนวน (คน)</th>
        <th style="width: 25%; text-align: center;">ร้อยละ</th>
      </tr>
    </thead>
    <tbody>
    ${renderSectionHeader("1. ท่านเห็นด้วยหรือไม่กับการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการโรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน")}
    ${renderCountRow("เห็นด้วย", agreeHospital["เห็นด้วย"] || 0, n)}
    ${renderCountRow("ไม่เห็นด้วย", agreeHospital["ไม่เห็นด้วย"] || 0, n)}
    ${renderSectionHeader("2. หากมีการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ ท่านคิดว่าทำให้ได้รับบริการรวดเร็วขึ้นหรือไม่")}
    ${renderCountRow("เห็นด้วย/รวดเร็วขึ้น", agreeOPD["เห็นด้วย"] || 0, n)}
    ${renderCountRow("ไม่เห็นด้วย", agreeOPD["ไม่เห็นด้วย"] || 0, n)}
    ${renderCountRow("ไม่แน่ใจ", agreeOPD["ไม่แน่ใจ"] || 0, n)}
    ${renderSectionHeader("3. หากมีการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ ท่านจะใช้บริการหรือไม่")}
    ${renderCountRow("ใช้บริการ", agreeIPD["เห็นด้วย"] || 0, n)}
    ${renderCountRow("ไม่ใช้บริการ", agreeIPD["ไม่เห็นด้วย"] || 0, n)}
    ${renderCountRow("ไม่แน่ใจ", agreeIPD["ไม่แน่ใจ"] || 0, n)}
    ${renderSectionHeader("4. หากมีการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ จะทำให้เลือกแพทย์เฉพาะทางได้สะดวกกว่าหรือไม่")}
    ${renderCountRow("เห็นด้วย", agreeOR["เห็นด้วย"] || 0, n)}
    ${renderCountRow("ไม่เห็นด้วย", agreeOR["ไม่เห็นด้วย"] || 0, n)}
    ${renderCountRow("ไม่แน่ใจ", agreeOR["ไม่แน่ใจ"] || 0, n)}
    ${renderSectionHeader("5. หากมีการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ ท่านคิดว่าทำให้ได้รับบริการรวดเร็วขึ้นหรือไม่")}
    ${renderCountRow("เห็นด้วย/รวดเร็วขึ้น", fastService["เห็นด้วย/รวดเร็วขึ้น"] || 0, n)}
    ${renderCountRow("ไม่เห็นด้วย", fastService["ไม่เห็นด้วย"] || 0, n)}
    ${renderCountRow("ไม่แน่ใจ", fastService["ไม่แน่ใจ"] || 0, n)}
    ${renderSectionHeader("6. หากมีการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ ท่านจะใช้บริการหรือไม่")}
    ${renderCountRow("ใช้บริการ", willUse["ใช้บริการ"] || 0, n)}
    ${renderCountRow("ไม่ใช้บริการ", willUse["ไม่ใช้บริการ"] || 0, n)}
    ${renderCountRow("ไม่แน่ใจ", willUse["ไม่แน่ใจ"] || 0, n)}
    ${buildClinicSection(data, n)}
    ${renderSectionHeader("8. หากมีการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ จะทำให้เลือกแพทย์เฉพาะทางได้สะดวกกว่าหรือไม่")}
    ${renderCountRow("เห็นด้วย", convenientDoctor["เห็นด้วย"] || 0, n)}
    ${renderCountRow("ไม่เห็นด้วย", convenientDoctor["ไม่เห็นด้วย"] || 0, n)}
    ${renderCountRow("ไม่แน่ใจ", convenientDoctor["ไม่แน่ใจ"] || 0, n)}
    ${renderSectionHeader("9. หากมีการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ จะทำให้ลดระยะเวลารอคอยคิวผ่าตัดได้หรือไม่")}
    ${renderCountRow("เห็นด้วย", reduceQueue["เห็นด้วย"] || 0, n)}
    ${renderCountRow("ไม่เห็นด้วย", reduceQueue["ไม่เห็นด้วย"] || 0, n)}
    ${renderCountRow("ไม่แน่ใจ", reduceQueue["ไม่แน่ใจ"] || 0, n)}
    ${renderSectionHeader("10. หากมีการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ ท่านสะดวกมาใช้บริการช่วงเวลาใด")}
    ${renderCountRow("กลางวัน", convenientTime["กลางวัน"] || 0, n)}
    ${renderCountRow("ตอนเย็น", convenientTime["ตอนเย็น"] || 0, n)}
    ${renderCountRow("กลางคืน", convenientTime["กลางคืน"] || 0, n)}
    ${renderCountRow("ตลอดทั้งวัน", convenientTime["ตลอดทั้งวัน"] || 0, n)}
    ${renderSectionHeader("11. หากมีการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ ท่านยินดีที่จะจ่ายค่าบริการเพิ่มหรือไม่ (โดยจ่ายเพิ่มเติมส่วนต่างจากสิทธิเดิม)")}
    ${renderCountRow("ยินดีจ่ายเพิ่ม", payExtra["ยินดีจ่ายเพิ่ม"] || 0, n)}
    ${renderCountRow("ไม่ยินดีจ่ายเพิ่ม", payExtra["ไม่ยินดีจ่ายเพิ่ม"] || 0, n)}
    ${renderCountRow("ไม่แน่ใจ", payExtra["ไม่แน่ใจ"] || 0, n)}
    ${buildPayExtraSection(data, n)}
    ${buildPreferredLocationSection(data, n)}
  `;

  document.getElementById("pub-table-opinions").innerHTML = html;
}

function updateDashboardSyncStamp() {
  const nav = document.querySelector(".db-top-nav");
  if (!nav) return;
  let badge = document.getElementById("dashboard-sync-badge");
  if (!badge) {
    badge = document.createElement("div");
    badge.id = "dashboard-sync-badge";
    badge.className = "dashboard-sync-badge";
    nav.appendChild(badge);
  }
  if (dashboardConnectionStatus === "error") {
    badge.textContent = "เชื่อมต่อฐานข้อมูลจริงไม่ได้";
    badge.style.background = "rgba(220, 38, 38, 0.12)";
    badge.style.color = "#991B1B";
  } else {
    badge.textContent = `อัปเดตล่าสุด ${getThaiDateTimeText()}`;
    badge.style.background = "";
    badge.style.color = "";
  }
}

function initPortal() {
  const personnelUrl = new URL("survey-personnel.html", window.location.href).href;
  const publicUrl = new URL("survey-public.html", window.location.href).href;
  const personnelCanvas = document.getElementById("canvas-personnel-qr");
  const publicCanvas = document.getElementById("canvas-public-qr");

  if (typeof QRious === "function" && personnelCanvas) {
    new QRious({ element: personnelCanvas, size: 250, value: personnelUrl });
  }
  if (typeof QRious === "function" && publicCanvas) {
    new QRious({ element: publicCanvas, size: 250, value: publicUrl });
  }

  const personnelBtn = document.getElementById("btn-dl-personnel");
  const publicBtn = document.getElementById("btn-dl-public");
  if (personnelBtn) {
    personnelBtn.addEventListener("click", () => {
      downloadBeautifulQrCard({
        qrCanvas: personnelCanvas,
        surveyUrl: personnelUrl,
        titleText: "สำหรับบุคลากรโรงพยาบาล",
        subtitleText: "แบบสำรวจความคิดเห็นการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ (SMC)",
        filename: "survey_personnel_qr.png"
      });
    });
  }
  if (publicBtn) {
    publicBtn.addEventListener("click", () => {
      downloadBeautifulQrCard({
        qrCanvas: publicCanvas,
        surveyUrl: publicUrl,
        titleText: "สำหรับประชาชนและผู้รับบริการ",
        subtitleText: "แบบสำรวจความคิดเห็นการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ (SMC)",
        filename: "survey_public_qr.png"
      });
    });
  }
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

async function downloadBeautifulQrCard({ qrCanvas, surveyUrl, titleText, subtitleText, filename }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1500;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#F8FAFC";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawRoundedRect(ctx, 32, 32, canvas.width - 64, canvas.height - 64, 36);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.lineWidth = 12;
  ctx.strokeStyle = "#D4AF37";
  ctx.stroke();

  drawRoundedRect(ctx, 60, 60, canvas.width - 120, canvas.height - 120, 28);
  ctx.strokeStyle = "#0B2545";
  ctx.lineWidth = 2;
  ctx.stroke();

  const logo = document.querySelector(".brand-section img");
  const logoSize = 140;
  if (logo && logo.complete && logo.naturalWidth) {
    ctx.drawImage(logo, (canvas.width - logoSize) / 2, 90, logoSize, logoSize);
  } else {
    ctx.fillStyle = "#0B2545";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 160, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#D4AF37";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SMC", canvas.width / 2, 160);
  }

  ctx.fillStyle = "#0B2545";
  ctx.font = "700 42px 'Sarabun', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน", canvas.width / 2, 305);

  ctx.fillStyle = "#64748B";
  ctx.font = "500 24px 'Sarabun', Arial, sans-serif";
  ctx.fillText(subtitleText, canvas.width / 2, 360);

  drawRoundedRect(ctx, 130, 410, canvas.width - 260, 78, 18);
  ctx.fillStyle = "#0B2545";
  ctx.fill();
  ctx.fillStyle = "#D4AF37";
  ctx.font = "700 30px 'Sarabun', Arial, sans-serif";
  ctx.fillText(titleText, canvas.width / 2, 462);

  const qrSize = 560;
  const qrX = (canvas.width - qrSize) / 2;
  const qrY = 540;
  if (qrCanvas) {
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
  } else if (typeof QRious === "function") {
    const fallbackQr = document.createElement("canvas");
    new QRious({ element: fallbackQr, size: 560, value: surveyUrl });
    ctx.drawImage(fallbackQr, qrX, qrY, qrSize, qrSize);
  }

  ctx.fillStyle = "#0B2545";
  ctx.font = "700 28px 'Sarabun', Arial, sans-serif";
  ctx.fillText("สแกนเพื่อเริ่มตอบแบบสอบถาม", canvas.width / 2, 1180);
  ctx.fillStyle = "#64748B";
  ctx.font = "500 22px 'Sarabun', Arial, sans-serif";
  ctx.fillText("ความเห็นของท่านมีความสำคัญต่อการพัฒนาบริการของเรา", canvas.width / 2, 1225);

  const link = document.createElement("a");
  link.download = filename;
  document.body.appendChild(link);
  try {
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (dataUrlError) {
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
    if (!blob) {
      link.remove();
      return;
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } finally {
    link.remove();
  }
}

function setupPositionAutocomplete() {
  const input = document.getElementById("position-input");
  const suggestionsBox = document.getElementById("position-suggestions");
  if (!input || !suggestionsBox) return;

  const renderSuggestions = () => {
    const value = input.value.trim().toLowerCase();
    suggestionsBox.innerHTML = "";

    const matches = POSITIONS_LIST.filter(pos => {
      const lower = String(pos).toLowerCase();
      return !value || lower.includes(value) || value.includes(lower);
    });

    if (matches.length === 0) {
      suggestionsBox.style.display = "none";
      return;
    }

    matches.slice(0, 10).forEach(match => {
      const item = document.createElement("div");
      item.className = "autocomplete-suggestion";
      item.textContent = match;
      item.addEventListener("mousedown", e => {
        e.preventDefault();
        input.value = match;
        suggestionsBox.style.display = "none";
      });
      suggestionsBox.appendChild(item);
    });

    suggestionsBox.style.display = "block";
  };

  input.addEventListener("input", renderSuggestions);
  input.addEventListener("focus", renderSuggestions);
  input.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      suggestionsBox.style.display = "none";
    }
  });
  document.addEventListener("click", e => {
    if (!suggestionsBox.contains(e.target) && e.target !== input) {
      suggestionsBox.style.display = "none";
    }
  });
}

function initSurveyForm(type) {
  const form = document.getElementById(`survey-${type}-form`);
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();

    showAlertModal("กำลังส่งข้อมูล...", "กรุณารอระบบทำการบันทึกข้อมูลแบบสอบถามของท่านสักครู่", "loading");

    const formData = new FormData(form);
    const payload = { surveyType: type };

    for (const [key, val] of formData.entries()) {
      if (key === "DesiredClinics" || key === "PayExtraParts") {
        if (!payload[key]) payload[key] = [];
        payload[key].push(val);
      } else {
        payload[key] = val;
      }
    }

    try {
      await fetch(GAS_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(payload)
      });

      showAlertModal("บันทึกข้อมูลสำเร็จ", "ขอบพระคุณอย่างยิ่งสำหรับความคิดเห็นและข้อเสนอแนะของท่าน", "success", () => {
        window.location.href = "index.html";
      });
    } catch (error) {
      console.error(error);
      showAlertModal("เกิดข้อผิดพลาด", "ไม่สามารถส่งแบบสอบถามได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง", "error");
    }
  });
}

async function loadDashboardData() {
  try {
    const callbackName = `smcDashboard_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const data = await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const cleanup = () => {
        delete window[callbackName];
        script.remove();
      };

      window[callbackName] = payload => {
        cleanup();
        resolve(payload);
      };

      script.onerror = () => {
        cleanup();
        reject(new Error("Dashboard data request failed"));
      };

      const url = new URL(GAS_WEB_APP_URL);
      url.searchParams.set("action", "getData");
      url.searchParams.set("callback", callbackName);
      script.src = url.toString();
      document.head.appendChild(script);
    });

    if (data && data.status === "success") {
      globalSurveyData.personnel = data.personnel || [];
      globalSurveyData.public = data.public || [];
      dashboardConnectionStatus = "ok";
    }
  } catch (err) {
    dashboardConnectionStatus = "error";
    console.error("Could not retrieve database records:", err);
  }
}

function renderPersonnelDashboard() {
  const data = globalSurveyData.personnel;
  const count = data.length;
  let agreeCount = 0;
  let disagreeCount = 0;
  data.forEach(item => {
    if (item.AgreeSMC === "เห็นด้วย") agreeCount++;
    else if (item.AgreeSMC && item.AgreeSMC.includes("ไม่เห็นด้วย")) disagreeCount++;
  });

  const totalEl = document.getElementById("p-count-total");
  const agreeEl = document.getElementById("p-count-agree");
  const disagreeEl = document.getElementById("p-count-disagree");
  if (totalEl) totalEl.innerText = count;
  if (agreeEl) agreeEl.innerText = agreeCount;
  if (disagreeEl) disagreeEl.innerText = disagreeCount;

  const pGenders = countFieldValues(data, "Gender");
  const pAge = countAgeRanges(data);
  const pClinics = countMultipleChoice(data, "DesiredClinics", CLINICS_LIST);
  const clinicLabels = [...CLINICS_LIST];
  const clinicData = clinicLabels.map(c => pClinics[c] || 0);
  if (pClinics._otherCount > 0) {
    clinicLabels.push("อื่นๆ");
    clinicData.push(pClinics._otherCount);
  }

  if (chartInstances.pGender) chartInstances.pGender.destroy();
  if (chartInstances.pAge) chartInstances.pAge.destroy();
  if (chartInstances.pClinics) chartInstances.pClinics.destroy();

  chartInstances.pGender = createPieChart("p-chart-gender", pGenders, ["#0B2545", "#D4AF37"]);
  chartInstances.pAge = createBarChart("p-chart-age", ["ต่ำกว่า 20 ปี", "20 – 29 ปี", "30 – 39 ปี", "40 – 49 ปี", "50 – 59 ปี", "60 ปีขึ้นไป"], [
    { label: "บุคลากร", data: pAge, backgroundColor: "#0B2545" }
  ]);
  chartInstances.pClinics = createHorizontalBarChart("p-chart-clinics", clinicLabels, [
    { label: "คลินิกที่ต้องการเปิด", data: clinicData, backgroundColor: "#D4AF37" }
  ]);

  renderThaiDateLabels();
  renderPersonnelDemographicsTable(data);
  renderPersonnelOpinionsTable(data);
  renderPersonnelFeedbackLists(data);
  updateDashboardSyncStamp();
}

function renderPublicDashboard() {
  const data = globalSurveyData.public;
  const count = data.length;
  let agreeCount = 0;
  let disagreeCount = 0;
  data.forEach(item => {
    if (item.AgreeSMCHospital === "เห็นด้วย") agreeCount++;
    else if (item.AgreeSMCHospital && item.AgreeSMCHospital.includes("ไม่เห็นด้วย")) disagreeCount++;
  });

  const totalEl = document.getElementById("pub-count-total");
  const agreeEl = document.getElementById("pub-count-agree");
  const disagreeEl = document.getElementById("pub-count-disagree");
  if (totalEl) totalEl.innerText = count;
  if (agreeEl) agreeEl.innerText = agreeCount;
  if (disagreeEl) disagreeEl.innerText = disagreeCount;

  const pubGenders = countFieldValues(data, "Gender");
  const pubAge = countAgeRanges(data);
  const pubClinics = countMultipleChoice(data, "DesiredClinics", CLINICS_LIST);
  const clinicLabels = [...CLINICS_LIST];
  const clinicData = clinicLabels.map(c => pubClinics[c] || 0);
  if (pubClinics._otherCount > 0) {
    clinicLabels.push("อื่นๆ");
    clinicData.push(pubClinics._otherCount);
  }

  if (chartInstances.pubGender) chartInstances.pubGender.destroy();
  if (chartInstances.pubAge) chartInstances.pubAge.destroy();
  if (chartInstances.pubClinics) chartInstances.pubClinics.destroy();

  chartInstances.pubGender = createPieChart("pub-chart-gender", pubGenders, ["#0B2545", "#D4AF37"]);
  chartInstances.pubAge = createBarChart("pub-chart-age", ["ต่ำกว่า 20 ปี", "20 – 29 ปี", "30 – 39 ปี", "40 – 49 ปี", "50 – 59 ปี", "60 ปีขึ้นไป"], [
    { label: "ประชาชน", data: pubAge, backgroundColor: "#0B2545" }
  ]);
  chartInstances.pubClinics = createHorizontalBarChart("pub-chart-clinics", clinicLabels, [
    { label: "คลินิกที่ต้องการเปิด", data: clinicData, backgroundColor: "#D4AF37" }
  ]);

  renderThaiDateLabels();
  renderPublicDemographicsTable(data);
  renderPublicOpinionsTable(data);
  renderPublicFeedbackLists(data);
  updateDashboardSyncStamp();
}

function normalizeAcademicReportLabels() {
  const sections = [
    {
      rootId: "tab-personnel-academic",
      titles: [
        "หากมีการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ ท่านอยากเห็นบริการอะไรในแผนกผู้ป่วยนอก (OPD) มากที่สุด และเหตุผลประกอบ",
        "หากมีการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ ท่านอยากเห็นบริการอะไรในแผนกผู้ป่วยใน (IPD) มากที่สุด และเหตุผลประกอบ",
        "หากมีการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ ท่านอยากเห็นบริการอะไรในแผนกผ่าตัด (OR) มากที่สุด และเหตุผลประกอบ",
        "ข้อเสนอแนะอื่นๆ เพิ่มเติม"
      ]
    },
    {
      rootId: "tab-public-academic",
      titles: [
        "หากมีการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ ท่านอยากเห็นบริการอะไรในแผนกผู้ป่วยนอก (OPD) มากที่สุด และเหตุผลประกอบ",
        "หากมีการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ ท่านอยากเห็นบริการอะไรในแผนกผู้ป่วยใน (IPD) มากที่สุด และเหตุผลประกอบ",
        "หากมีการจัดบริการคลินิกพิเศษเฉพาะทางนอกเวลาราชการ ท่านอยากเห็นบริการอะไรในแผนกผ่าตัด (OR) มากที่สุด และเหตุผลประกอบ",
        "ข้อเสนอแนะอื่นๆ เพิ่มเติม"
      ]
    }
  ];

  sections.forEach(section => {
    const root = document.getElementById(section.rootId);
    if (!root) return;
    const headings = root.querySelectorAll("h5");
    section.titles.forEach((title, index) => {
      const heading = headings[index];
      if (heading) heading.textContent = `${index + 1}) ${title}`;
    });
  });
}

async function initDashboard() {
  setupDashboardTabs();
  normalizeAcademicReportLabels();
  await loadDashboardData();
  renderOverviewDashboard();
  renderPersonnelDashboard();
  renderPublicDashboard();

  setInterval(async () => {
    await loadDashboardData();
    renderOverviewDashboard();
    renderPersonnelDashboard();
    renderPublicDashboard();
  }, 20000);
}
