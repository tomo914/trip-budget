// --- 1. HTML要素の取得 ---
const budgetForm = document.getElementById('budget-form');
const resultCard = document.getElementById('result-card');
const errorMessage = document.getElementById('error-message');

const originInput = document.getElementById('origin');
const destinationInput = document.getElementById('destination');
const daysInput = document.getElementById('days');
const travelersInput = document.getElementById('travelers');
const styleInput = document.getElementById('style');
const currencyInput = document.getElementById('currency');

const flightInput = document.getElementById('flight');
const hotelInput = document.getElementById('hotel');
const foodInput = document.getElementById('food');
const transportInput = document.getElementById('transport');
const activitiesInput = document.getElementById('activities');
const otherInput = document.getElementById('other');

const resDestination = document.getElementById('res-destination');
const resDays = document.getElementById('res-days');
const resTravelers = document.getElementById('res-travelers');
const resStyle = document.getElementById('res-style');
const resTotal = document.getElementById('res-total');
const resRateInfo = document.getElementById('res-rate-info');
const resPerPerson = document.getElementById('res-per-person');
const resPerDay = document.getElementById('res-per-day');

const resFlight = document.getElementById('res-flight');
const resHotel = document.getElementById('res-hotel');
const resFood = document.getElementById('res-food');
const resTransport = document.getElementById('res-transport');
const resActivities = document.getElementById('res-activities');
const resOther = document.getElementById('res-other');

// 外貨計算機要素
const foreignAmountInput = document.getElementById('foreign-amount');
const foreignCurrencySelect = document.getElementById('foreign-currency');
const converterJpyResult = document.getElementById('converter-jpy-result');

// グラフ用変数
let budgetChartInstance = null;


// --- 2. 為替API & 通貨フォーマットの設定 ---
let exchangeRates = { JPY: 1 };

const currencySymbols = {
  JPY: '¥',
  USD: '$',
  EUR: '€',
  THB: '฿',
  KRW: '₩',
  CNY: '¥'
};

async function fetchExchangeRates() {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/JPY');
    const data = await response.json();
    if (data && data.rates) {
      exchangeRates = data.rates;
      console.log('Exchange rates loaded successfully:', exchangeRates);
      updateConverter();
    }
  } catch (error) {
    console.error('Failed to fetch rates, falling back to default JPY.', error);
  }
}

fetchExchangeRates();

function formatCurrency(amountJPY, targetCurrency) {
  const symbol = currencySymbols[targetCurrency] || '';
  const rate = exchangeRates[targetCurrency] || 1;
  const convertedAmount = amountJPY * rate;

  const decimals = (targetCurrency === 'JPY' || targetCurrency === 'KRW') ? 0 : 2;

  return symbol + convertedAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

// --- 3. 外貨計算機のリアルタイム換算処理 ---
function updateConverter() {
  const amount = parseFloat(foreignAmountInput.value);
  const currency = foreignCurrencySelect.value;

  if (isNaN(amount) || amount <= 0) {
    converterJpyResult.textContent = '¥0';
    return;
  }

  const rate = exchangeRates[currency];
  if (rate) {
    const jpyValue = amount / rate;
    converterJpyResult.textContent = '¥' + Math.round(jpyValue).toLocaleString('en-US');
  } else {
    converterJpyResult.textContent = '¥0';
  }
}

foreignAmountInput.addEventListener('input', updateConverter);
foreignCurrencySelect.addEventListener('change', updateConverter);


// --- 4. 円グラフ描画機能 ---
function renderChart(dataValues, currencySymbol) {
  const ctx = document.getElementById('budgetChart').getContext('2d');

  // 既にグラフが存在する場合は一度破棄して再描画
  if (budgetChartInstance) {
    budgetChartInstance.destroy();
  }

  budgetChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Flight', 'Accommodation', 'Food', 'Transportation', 'Activities', 'Other'],
      datasets: [{
        data: dataValues,
        backgroundColor: [
          '#0071e3', // Flight (Blue)
          '#34c759', // Accommodation (Green)
          '#ff9500', // Food (Orange)
          '#af52de', // Transport (Purple)
          '#ff2d55', // Activities (Pink)
          '#8e8e93'  // Other (Grey)
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 14,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: ${currencySymbol}${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
            }
          }
        }
      },
      cutout: '65%' // ドーナツの穴の大きさ
    }
  });
}


// --- 5. バリデーション処理 ---
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('visible');
  resultCard.classList.add('hidden');
}

function clearError() {
  errorMessage.textContent = '';
  errorMessage.classList.remove('visible');
}

function validateInputs() {
  if (!originInput.value.trim() || !destinationInput.value.trim()) {
    showError('Please enter both origin and destination.');
    return false;
  }

  const days = Number(daysInput.value);
  if (!daysInput.value || isNaN(days) || days < 1) {
    showError('Number of days must be at least 1.');
    return false;
  }

  const travelers = Number(travelersInput.value);
  if (!travelersInput.value || isNaN(travelers) || travelers < 1) {
    showError('Number of travelers must be at least 1.');
    return false;
  }

  const moneyInputs = [
    { element: flightInput, label: 'Flight' },
    { element: hotelInput, label: 'Hotel' },
    { element: foodInput, label: 'Food' },
    { element: transportInput, label: 'Transportation' },
    { element: activitiesInput, label: 'Activities' },
    { element: otherInput, label: 'Other' }
  ];

  for (const inputObj of moneyInputs) {
    const value = inputObj.element.value;
    const numberValue = Number(value);

    if (value === '' || isNaN(numberValue)) {
      showError(`Please enter a valid amount for ${inputObj.label}.`);
      return false;
    }

    if (numberValue < 0) {
      showError(`${inputObj.label} expense cannot be negative.`);
      return false;
    }
  }

  clearError();
  return true;
}


// --- 6. 自動計算メイン処理 ---
function calculateBudget() {
  if (!validateInputs()) return;

  const days = Number(daysInput.value);
  const travelers = Number(travelersInput.value);
  const selectedCurrency = currencyInput.value;
  
  const flightPrice = Number(flightInput.value);
  const hotelPrice = Number(hotelInput.value);
  const foodPrice = Number(foodInput.value);
  const transportPrice = Number(transportInput.value);
  const activitiesPrice = Number(activitiesInput.value);
  const otherPrice = Number(otherInput.value);

  const nights = Math.max(days - 1, 0);

  const totalFlight = flightPrice * travelers;
  const totalHotel = hotelPrice * nights * travelers;
  const totalFood = foodPrice * days * travelers;
  const totalTransport = transportPrice * days * travelers;
  const totalActivities = activitiesPrice * days * travelers;
  const totalOther = otherPrice;

  const totalCost = totalFlight + totalHotel + totalFood + totalTransport + totalActivities + totalOther;

  const perPersonCost = totalCost / travelers;
  const perDayCost = totalCost / days;

  resDestination.textContent = destinationInput.value.trim();
  resDays.textContent = days;
  resTravelers.textContent = travelers;
  resStyle.textContent = styleInput.value;

  resTotal.textContent = formatCurrency(totalCost, selectedCurrency);
  resPerPerson.textContent = formatCurrency(perPersonCost, selectedCurrency);
  resPerDay.textContent = formatCurrency(perDayCost, selectedCurrency);

  resFlight.textContent = formatCurrency(totalFlight, selectedCurrency);
  resHotel.textContent = formatCurrency(totalHotel, selectedCurrency);
  resFood.textContent = formatCurrency(totalFood, selectedCurrency);
  resTransport.textContent = formatCurrency(totalTransport, selectedCurrency);
  resActivities.textContent = formatCurrency(totalActivities, selectedCurrency);
  resOther.textContent = formatCurrency(totalOther, selectedCurrency);

  if (selectedCurrency !== 'JPY' && exchangeRates[selectedCurrency]) {
    const rate = exchangeRates[selectedCurrency];
    resRateInfo.textContent = `(Rate: 1 JPY = ${rate.toFixed(4)} ${selectedCurrency})`;
  } else {
    resRateInfo.textContent = '';
  }

  // --- グラフ用データの計算（選択通貨に換算） ---
  const rate = exchangeRates[selectedCurrency] || 1;
  const chartData = [
    totalFlight * rate,
    totalHotel * rate,
    totalFood * rate,
    totalTransport * rate,
    totalActivities * rate,
    totalOther * rate
  ];
  const symbol = currencySymbols[selectedCurrency] || '';

  // 円グラフを描画
  renderChart(chartData, symbol);

  resultCard.classList.remove('hidden');
}


// --- 7. イベントリスナー ---
budgetForm.addEventListener('submit', function (event) {
  event.preventDefault();
  calculateBudget();
});