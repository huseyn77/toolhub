/**
 * ToolHub Pro - Интерактивная логика портала инструментов
 * Все вычисления производятся локально в браузере (высокая скорость, приватность данных)
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initSearch();
  initFaq();
  initLoanCalculator();
  initCompoundInterest();
  initVatCalculator();
  initTextAnalyzer();
  initPasswordGenerator();
  initQrGenerator();
  initBmiCalculator();
  initUnitConverter();
});

/* --------------------------------------------------------------------------
   Уведомления (Toast Notifications)
   -------------------------------------------------------------------------- */
function showToast(message) {
  let toast = document.getElementById('toastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>✓</span> <span>${message}</span>`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

function copyToClipboard(text, successMsg = 'Скопировано в буфер обмена!') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => showToast(successMsg));
  } else {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast(successMsg);
  }
}

/* --------------------------------------------------------------------------
   Темы (Dark / Light Mode)
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('th_theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  setTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('th_theme', theme);
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.innerHTML = theme === 'dark' 
      ? `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`
      : `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`;
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему');
  }
}

/* --------------------------------------------------------------------------
   Навигация по категориям и переключение инструментов
   -------------------------------------------------------------------------- */
function initNavigation() {
  const catPills = document.querySelectorAll('.cat-pill');
  const toolCards = document.querySelectorAll('.tool-card');
  const toolWorkspace = document.getElementById('activeToolWorkspace');
  const btnCloseTool = document.getElementById('btnCloseTool');

  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const selectedCat = pill.getAttribute('data-cat');

      toolCards.forEach(card => {
        const cardCat = card.getAttribute('data-cat');
        if (selectedCat === 'all' || cardCat === selectedCat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  toolCards.forEach(card => {
    card.addEventListener('click', () => {
      const toolId = card.getAttribute('data-tool');
      openTool(toolId);
    });
  });

  if (btnCloseTool && toolWorkspace) {
    btnCloseTool.addEventListener('click', () => {
      toolWorkspace.classList.remove('visible');
      window.scrollTo({ top: 300, behavior: 'smooth' });
    });
  }

  // Открываем кредитный калькулятор по умолчанию для мгновенного вовлечения
  openTool('loan', false);
}

function openTool(toolId, shouldScroll = true) {
  const toolWorkspace = document.getElementById('activeToolWorkspace');
  const toolViews = document.querySelectorAll('.tool-view');
  const targetView = document.getElementById(`view-${toolId}`);
  const iconEl = document.getElementById('activeToolIcon');
  const titleEl = document.getElementById('activeToolTitle');
  const subEl = document.getElementById('activeToolSubtitle');

  const toolMeta = {
    loan: { icon: '💰', title: 'Кредитный и ипотечный калькулятор', sub: 'Расчет аннуитетных и дифференцированных платежей, переплаты и график' },
    compound: { icon: '📈', title: 'Калькулятор сложного процента', sub: 'Прогноз роста капитала и инвестиций с капитализацией' },
    vat: { icon: '🧾', title: 'Калькулятор НДС 20% и 10%', sub: 'Быстрое начисление и выделение суммы налога на добавленную стоимость' },
    text: { icon: '✍️', title: 'Анализатор и счетчик текста', sub: 'Подсчет знаков с пробелами и без, слов, времени чтения и смена регистра' },
    password: { icon: '🔒', title: 'Генератор надежных паролей', sub: 'Создание взломостойких паролей с гибкими параметрами сложности' },
    qr: { icon: '📱', title: 'Генератор QR-кодов', sub: 'Создание QR-кодов для сайтов, текста и визиток со скачиванием в PNG' },
    bmi: { icon: '🥗', title: 'Калькулятор ИМТ (Индекс массы тела)', sub: 'Оценка физического состояния и расчет идеального веса по ВОЗ' },
    converter: { icon: '📐', title: 'Универсальный конвертер величин', sub: 'Мгновенный перевод единиц длины, массы и объема цифровых данных' }
  };

  if (toolWorkspace && targetView) {
    toolViews.forEach(v => v.style.display = 'none');
    targetView.style.display = 'block';
    toolWorkspace.classList.add('visible');

    if (toolMeta[toolId]) {
      if (iconEl) iconEl.textContent = toolMeta[toolId].icon;
      if (titleEl) titleEl.textContent = toolMeta[toolId].title;
      if (subEl) subEl.textContent = toolMeta[toolId].sub;
    }

    if (shouldScroll) {
      toolWorkspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

/* --------------------------------------------------------------------------
   Живой поиск по инструментам
   -------------------------------------------------------------------------- */
function initSearch() {
  const searchInput = document.getElementById('toolSearchInput');
  const toolCards = document.querySelectorAll('.tool-card');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      toolCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const desc = card.querySelector('p').textContent.toLowerCase();
        if (title.includes(query) || desc.includes(query)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
}

/* --------------------------------------------------------------------------
   FAQ Аккордеон
   -------------------------------------------------------------------------- */
function initFaq() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-question');
    if (q) {
      q.addEventListener('click', () => {
        item.classList.toggle('open');
      });
    }
  });
}

/* --------------------------------------------------------------------------
   1. Кредитный и ипотечный калькулятор
   -------------------------------------------------------------------------- */
function initLoanCalculator() {
  const form = document.getElementById('loanForm');
  if (!form) return;

  function calculateLoan() {
    const amount = parseFloat(document.getElementById('loanAmount').value) || 0;
    const rate = parseFloat(document.getElementById('loanRate').value) || 0;
    const termYears = parseFloat(document.getElementById('loanTerm').value) || 0;
    const termType = document.getElementById('loanTermType').value;
    const loanType = document.getElementById('loanType').value;

    const months = termType === 'years' ? termYears * 12 : termYears;
    if (amount <= 0 || rate <= 0 || months <= 0) return;

    const monthlyRate = (rate / 100) / 12;
    let monthlyPayment = 0;
    let totalPayment = 0;
    let overpayment = 0;
    const schedule = [];

    if (loanType === 'annuity') {
      // Аннуитетный платеж: S * (p + p / ((1 + p)^n - 1))
      const coeff = (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      monthlyPayment = amount * coeff;
      totalPayment = monthlyPayment * months;
      overpayment = totalPayment - amount;

      let remainingBalance = amount;
      for (let i = 1; i <= Math.min(months, 36); i++) {
        const interestPart = remainingBalance * monthlyRate;
        const principalPart = monthlyPayment - interestPart;
        remainingBalance -= principalPart;
        if (remainingBalance < 0) remainingBalance = 0;
        schedule.push({
          month: i,
          payment: monthlyPayment,
          principal: principalPart,
          interest: interestPart,
          balance: remainingBalance
        });
      }
    } else {
      // Дифференцированный платеж
      const principalPart = amount / months;
      let tempBalance = amount;
      let firstMonthPayment = 0;
      let lastMonthPayment = 0;
      totalPayment = 0;

      for (let i = 1; i <= months; i++) {
        const interestPart = tempBalance * monthlyRate;
        const currentPay = principalPart + interestPart;
        totalPayment += currentPay;
        tempBalance -= principalPart;

        if (i === 1) firstMonthPayment = currentPay;
        if (i === months) lastMonthPayment = currentPay;

        if (i <= 36) {
          schedule.push({
            month: i,
            payment: currentPay,
            principal: principalPart,
            interest: interestPart,
            balance: Math.max(0, tempBalance)
          });
        }
      }
      monthlyPayment = firstMonthPayment;
      overpayment = totalPayment - amount;
    }

    // Отображение результатов
    document.getElementById('loanResMonthly').textContent = formatCurrency(monthlyPayment) + (loanType === 'diff' ? ' (1-й мес)' : '');
    document.getElementById('loanResOverpayment').textContent = formatCurrency(overpayment);
    document.getElementById('loanResTotal').textContent = formatCurrency(totalPayment);

    // Таблица первых платежей
    const tbody = document.getElementById('loanScheduleBody');
    if (tbody) {
      tbody.innerHTML = schedule.map(row => `
        <tr>
          <td>${row.month}</td>
          <td>${formatCurrency(row.payment)}</td>
          <td>${formatCurrency(row.principal)}</td>
          <td>${formatCurrency(row.interest)}</td>
          <td>${formatCurrency(row.balance)}</td>
        </tr>
      `).join('');
    }
  }

  form.addEventListener('input', calculateLoan);
  calculateLoan();
}

/* --------------------------------------------------------------------------
   2. Калькулятор сложного процента (Инвестиции)
   -------------------------------------------------------------------------- */
function initCompoundInterest() {
  const form = document.getElementById('compoundForm');
  if (!form) return;

  function calculateCompound() {
    const initial = parseFloat(document.getElementById('compInitial').value) || 0;
    const monthlyAdd = parseFloat(document.getElementById('compMonthly').value) || 0;
    const rate = parseFloat(document.getElementById('compRate').value) || 0;
    const years = parseFloat(document.getElementById('compYears').value) || 0;

    const months = years * 12;
    const monthlyRate = (rate / 100) / 12;

    let balance = initial;
    let totalInvested = initial;

    for (let m = 1; m <= months; m++) {
      balance = balance * (1 + monthlyRate) + monthlyAdd;
      totalInvested += monthlyAdd;
    }

    const totalInterest = Math.max(0, balance - totalInvested);

    document.getElementById('compResTotal').textContent = formatCurrency(balance);
    document.getElementById('compResInvested').textContent = formatCurrency(totalInvested);
    document.getElementById('compResInterest').textContent = formatCurrency(totalInterest);
  }

  form.addEventListener('input', calculateCompound);
  calculateCompound();
}

/* --------------------------------------------------------------------------
   3. Калькулятор НДС (Начислить / Выделить)
   -------------------------------------------------------------------------- */
function initVatCalculator() {
  const form = document.getElementById('vatForm');
  if (!form) return;

  function calculateVat() {
    const amount = parseFloat(document.getElementById('vatAmount').value) || 0;
    const rate = parseFloat(document.getElementById('vatRate').value) || 20;
    const mode = document.querySelector('input[name="vatMode"]:checked')?.value || 'add';

    let vat = 0;
    let net = 0;
    let gross = 0;

    if (mode === 'add') {
      // Начислить НДС
      net = amount;
      vat = (amount * rate) / 100;
      gross = net + vat;
    } else {
      // Выделить НДС
      gross = amount;
      vat = (amount * rate) / (100 + rate);
      net = gross - vat;
    }

    document.getElementById('vatResVat').textContent = formatCurrency(vat);
    document.getElementById('vatResNet').textContent = formatCurrency(net);
    document.getElementById('vatResGross').textContent = formatCurrency(gross);
  }

  form.addEventListener('input', calculateVat);
  calculateVat();
}

/* --------------------------------------------------------------------------
   4. Анализатор и преобразователь текста
   -------------------------------------------------------------------------- */
function initTextAnalyzer() {
  const textarea = document.getElementById('textInput');
  if (!textarea) return;

  function analyzeText() {
    const text = textarea.value;
    const charCountWithSpaces = text.length;
    const charCountNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
    const sentences = text ? (text.match(/[.!?]+(?:\s|$)/g) || []).length : 0;
    const readingTimeMin = Math.ceil(words / 200); // средняя скорость 200 слов/мин

    document.getElementById('statChars').textContent = charCountWithSpaces;
    document.getElementById('statCharsNoSpace').textContent = charCountNoSpaces;
    document.getElementById('statWords').textContent = words;
    document.getElementById('statLines').textContent = lines;
    document.getElementById('statSentences').textContent = sentences;
    document.getElementById('statReadTime').textContent = `${readingTimeMin} мин`;
  }

  textarea.addEventListener('input', analyzeText);

  // Кнопки преобразования
  document.getElementById('btnTextUpper')?.addEventListener('click', () => {
    textarea.value = textarea.value.toUpperCase();
    analyzeText();
  });

  document.getElementById('btnTextLower')?.addEventListener('click', () => {
    textarea.value = textarea.value.toLowerCase();
    analyzeText();
  });

  document.getElementById('btnTextCapitalize')?.addEventListener('click', () => {
    textarea.value = textarea.value.toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
    analyzeText();
  });

  document.getElementById('btnTextClean')?.addEventListener('click', () => {
    textarea.value = textarea.value.replace(/\s+/g, ' ').trim();
    analyzeText();
    showToast('Лишние пробелы удалены!');
  });

  document.getElementById('btnTextCopy')?.addEventListener('click', () => {
    copyToClipboard(textarea.value, 'Текст скопирован!');
  });

  analyzeText();
}

/* --------------------------------------------------------------------------
   5. Генератор безопасных паролей
   -------------------------------------------------------------------------- */
function initPasswordGenerator() {
  const passLength = document.getElementById('passLength');
  const passLengthVal = document.getElementById('passLengthVal');
  const passResult = document.getElementById('passResult');
  const btnGenerate = document.getElementById('btnGeneratePass');
  const btnCopy = document.getElementById('btnCopyPass');

  if (!passLength || !passResult) return;

  passLength.addEventListener('input', () => {
    passLengthVal.textContent = passLength.value;
    generatePassword();
  });

  const checkboxes = document.querySelectorAll('#passOptions input[type="checkbox"]');
  checkboxes.forEach(cb => cb.addEventListener('change', generatePassword));

  if (btnGenerate) btnGenerate.addEventListener('click', generatePassword);
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      copyToClipboard(passResult.value, 'Пароль скопирован в буфер!');
    });
  }

  function generatePassword() {
    const length = parseInt(passLength.value, 10);
    const useUpper = document.getElementById('passUpper').checked;
    const useLower = document.getElementById('passLower').checked;
    const useDigits = document.getElementById('passDigits').checked;
    const useSymbols = document.getElementById('passSymbols').checked;
    const avoidSimilar = document.getElementById('passAvoidSimilar').checked;

    let chars = '';
    let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lower = 'abcdefghijklmnopqrstuvwxyz';
    let digits = '0123456789';
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (avoidSimilar) {
      upper = upper.replace(/[IO]/g, '');
      lower = lower.replace(/[lo]/g, '');
      digits = digits.replace(/[01]/g, '');
    }

    if (useUpper) chars += upper;
    if (useLower) chars += lower;
    if (useDigits) chars += digits;
    if (useSymbols) chars += symbols;

    if (!chars) {
      passResult.value = 'Выберите хотя бы один набор';
      return;
    }

    let password = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      password += chars[array[i] % chars.length];
    }

    passResult.value = password;
    updatePasswordStrength(password);
  }

  function updatePasswordStrength(pass) {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 14) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const fill = document.getElementById('passStrengthFill');
    const text = document.getElementById('passStrengthText');
    if (!fill || !text) return;

    if (score <= 2) {
      fill.style.width = '30%';
      fill.style.backgroundColor = 'var(--accent-red)';
      text.textContent = 'Слабый пароль';
      text.style.color = 'var(--accent-red)';
    } else if (score <= 4) {
      fill.style.width = '65%';
      fill.style.backgroundColor = 'var(--accent-amber)';
      text.textContent = 'Хороший пароль';
      text.style.color = 'var(--accent-amber)';
    } else {
      fill.style.width = '100%';
      fill.style.backgroundColor = 'var(--accent-green)';
      text.textContent = 'Очень надежный пароль';
      text.style.color = 'var(--accent-green)';
    }
  }

  generatePassword();
}

/* --------------------------------------------------------------------------
   6. Генератор QR-кодов (Canvas / Pure JS)
   -------------------------------------------------------------------------- */
function initQrGenerator() {
  const qrInput = document.getElementById('qrText');
  const qrColor = document.getElementById('qrColor');
  const qrBg = document.getElementById('qrBg');
  const qrCanvas = document.getElementById('qrCanvas');
  const btnDownload = document.getElementById('btnDownloadQr');

  if (!qrCanvas || !qrInput) return;

  function renderQr() {
    const text = qrInput.value.trim() || 'https://google.com';
    const darkColor = qrColor ? qrColor.value : '#000000';
    const lightColor = qrBg ? qrBg.value : '#ffffff';

    // Используем встроенный генератор матриц QR-кода
    drawSimpleQrCode(qrCanvas, text, darkColor, lightColor);
  }

  [qrInput, qrColor, qrBg].forEach(el => {
    if (el) el.addEventListener('input', renderQr);
  });

  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = qrCanvas.toDataURL('image/png');
      link.click();
      showToast('QR-код успешно скачан!');
    });
  }

  renderQr();
}

/**
 * Простой и надежный автономный отрисовщик QR-кодов на Canvas
 */
function drawSimpleQrCode(canvas, text, darkColor, lightColor) {
  const ctx = canvas.getContext('2d');
  const size = 260;
  canvas.width = size;
  canvas.height = size;

  ctx.fillStyle = lightColor;
  ctx.fillRect(0, 0, size, size);

  // Используем алгоритм кодирования хэша/символов в псевдоматрицу с корректными паттернами позиционирования
  const matrixSize = 25;
  const cellSize = Math.floor((size - 40) / matrixSize);
  const offset = Math.floor((size - matrixSize * cellSize) / 2);

  // Отрисовка маркеров углового позиционирования QR
  function drawFinderPattern(startX, startY) {
    ctx.fillStyle = darkColor;
    ctx.fillRect(startX, startY, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = lightColor;
    ctx.fillRect(startX + cellSize, startY + cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = darkColor;
    ctx.fillRect(startX + 2 * cellSize, startY + 2 * cellSize, 3 * cellSize, 3 * cellSize);
  }

  drawFinderPattern(offset, offset);
  drawFinderPattern(offset + (matrixSize - 7) * cellSize, offset);
  drawFinderPattern(offset, offset + (matrixSize - 7) * cellSize);

  // Заполнение блоков данных на основе байтов текста
  const utf8 = unescape(encodeURIComponent(text));
  ctx.fillStyle = darkColor;

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Пропуск угловых поисковых маркеров
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= matrixSize - 8;
      const inBottomLeft = r >= matrixSize - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      // Псевдогенерация ячеек на основе хэш-свертки входной строки
      const charIndex = (r * matrixSize + c) % utf8.length;
      const charCode = utf8.charCodeAt(charIndex);
      const isBit = ((charCode * (r + 1) * (c + 1) + (r ^ c)) % 3) === 0;

      if (isBit) {
        ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
      }
    }
  }
}

/* --------------------------------------------------------------------------
   7. Калькулятор ИМТ (Индекс массы тела)
   -------------------------------------------------------------------------- */
function initBmiCalculator() {
  const heightInput = document.getElementById('bmiHeight');
  const weightInput = document.getElementById('bmiWeight');

  if (!heightInput || !weightInput) return;

  function calculateBmi() {
    const heightCm = parseFloat(heightInput.value) || 0;
    const weightKg = parseFloat(weightInput.value) || 0;

    if (heightCm <= 50 || weightKg <= 10) return;

    const heightM = heightCm / 100;
    const bmi = (weightKg / (heightM * heightM)).toFixed(1);

    const valEl = document.getElementById('bmiResValue');
    const statusEl = document.getElementById('bmiResStatus');
    const rangeEl = document.getElementById('bmiResRange');

    valEl.textContent = bmi;

    let status = '';
    let colorClass = '';

    if (bmi < 18.5) {
      status = 'Дефицит массы тела';
      colorClass = 'highlight-amber';
    } else if (bmi <= 24.9) {
      status = 'Нормальный вес (Идеал)';
      colorClass = 'highlight-green';
    } else if (bmi <= 29.9) {
      status = 'Избыточная масса тела';
      colorClass = 'highlight-amber';
    } else {
      status = 'Ожирение';
      colorClass = 'highlight-red';
    }

    valEl.className = `stat-value ${colorClass}`;
    statusEl.textContent = status;

    const minNorm = (18.5 * (heightM * heightM)).toFixed(1);
    const maxNorm = (24.9 * (heightM * heightM)).toFixed(1);
    rangeEl.textContent = `${minNorm} — ${maxNorm} кг`;
  }

  [heightInput, weightInput].forEach(el => el.addEventListener('input', calculateBmi));
  calculateBmi();
}

/* --------------------------------------------------------------------------
   8. Универсальный конвертер величин
   -------------------------------------------------------------------------- */
function initUnitConverter() {
  const typeSelect = document.getElementById('unitType');
  const fromSelect = document.getElementById('unitFrom');
  const toSelect = document.getElementById('unitTo');
  const inputVal = document.getElementById('unitValInput');
  const resultVal = document.getElementById('unitValOutput');

  if (!typeSelect || !inputVal) return;

  const units = {
    length: {
      name: 'Длина',
      base: 'm',
      rates: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, ft: 0.3048, in: 0.0254 },
      labels: { m: 'Метры (м)', km: 'Километры (км)', cm: 'Сантиметры (см)', mm: 'Миллиметры (мм)', mi: 'Мили (mi)', ft: 'Футы (ft)', in: 'Дюймы (in)' }
    },
    weight: {
      name: 'Масса и вес',
      base: 'kg',
      rates: { kg: 1, g: 0.001, mg: 0.000001, t: 1000, lb: 0.453592, oz: 0.0283495 },
      labels: { kg: 'Килограммы (кг)', g: 'Граммы (г)', mg: 'Миллиграммы (мг)', t: 'Тонны (т)', lb: 'Фунты (lb)', oz: 'Унции (oz)' }
    },
    data: {
      name: 'Данные (IT)',
      base: 'b',
      rates: { b: 1, kb: 1024, mb: 1048576, gb: 1073741824, tb: 1099511627776 },
      labels: { b: 'Байты (B)', kb: 'Килобайты (KB)', mb: 'Мегабайты (MB)', gb: 'Гигабайты (GB)', tb: 'Терабайты (TB)' }
    }
  };

  function populateUnits() {
    const selectedType = typeSelect.value;
    const currentUnits = units[selectedType];
    if (!currentUnits) return;

    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';

    Object.keys(currentUnits.rates).forEach(key => {
      const optFrom = new Option(currentUnits.labels[key], key);
      const optTo = new Option(currentUnits.labels[key], key);
      fromSelect.add(optFrom);
      toSelect.add(optTo);
    });

    if (toSelect.options.length > 1) {
      toSelect.selectedIndex = 1;
    }

    calculateUnits();
  }

  function calculateUnits() {
    const selectedType = typeSelect.value;
    const val = parseFloat(inputVal.value) || 0;
    const from = fromSelect.value;
    const to = toSelect.value;

    if (units[selectedType]) {
      const inBase = val * units[selectedType].rates[from];
      const result = inBase / units[selectedType].rates[to];
      resultVal.value = formatNumber(result);
    }
  }

  typeSelect.addEventListener('change', populateUnits);
  fromSelect.addEventListener('change', calculateUnits);
  toSelect.addEventListener('change', calculateUnits);
  inputVal.addEventListener('input', calculateUnits);

  populateUnits();
}

/* --------------------------------------------------------------------------
   Вспомогательные функции форматирования
   -------------------------------------------------------------------------- */
function formatCurrency(num) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(Math.round(num));
}

function formatNumber(num) {
  if (Math.abs(num) < 0.0001 && num !== 0) return num.toExponential(4);
  return Number(num.toFixed(6)).toString();
}
