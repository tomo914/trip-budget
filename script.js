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

// 無料の為替APIから最新レートを取得（ベース: JPY）
async function fetchExchangeRates() {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/JPY');
    const data = await response.json();
    if (data && data.rates) {
      exchangeRates = data.rates;
      console.log('Exchange rates loaded successfully:', exchangeRates);
      // レート読み込み完了時に計算機も更新
      updateConverter();
    }
  } catch (error) {
    console.error('Failed to fetch rates, falling back to default JPY.', error);
  }
}

fetchExchangeRates();

// 指定した通貨表記にフォーマットする関数
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

  // 1 JPY = rate foreign_currency
  // したがって foreign_currency -> JPY は amount / rate
  const rate = exchangeRates[currency];
  if (rate) {
    const jpyValue = amount / rate;
    converterJpyResult.textContent = '¥' + Math.round(jpyValue).toLocaleString('en-US');
  } else {
    converterJpyResult.textContent = '¥0';
  }
}

// 外貨金額の入力や通貨切り替え時に即座に計算
foreignAmountInput.addEventListener('input', updateConverter);
foreignCurrencySelect.addEventListener('change', updateConverter);


// --- 4. バリデーション処理 ---
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


// --- 5. 自動計算メイン処理 ---
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

  resultCard.classList.remove('hidden');
}


// --- 6. イベントリスナー ---
budgetForm.addEventListener('submit', function (event) {
  event.preventDefault();
  calculateBudget();
});