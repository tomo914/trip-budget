// --- 1. HTML要素の取得 ---
// フォームとカード
const budgetForm = document.getElementById('budget-form');
const resultCard = document.getElementById('result-card');
const errorMessage = document.getElementById('error-message');

// 入力要素
const originInput = document.getElementById('origin');
const destinationInput = document.getElementById('destination');
const daysInput = document.getElementById('days');
const travelersInput = document.getElementById('travelers');
const styleInput = document.getElementById('style');
const flightInput = document.getElementById('flight');
const hotelInput = document.getElementById('hotel');
const foodInput = document.getElementById('food');
const transportInput = document.getElementById('transport');
const activitiesInput = document.getElementById('activities');
const otherInput = document.getElementById('other');

// 結果表示用要素
const resDestination = document.getElementById('res-destination');
const resDays = document.getElementById('res-days');
const resTravelers = document.getElementById('res-travelers');
const resStyle = document.getElementById('res-style');
const resTotal = document.getElementById('res-total');
const resPerPerson = document.getElementById('res-per-person');
const resPerDay = document.getElementById('res-per-day');

// 内訳表示用要素
const resFlight = document.getElementById('res-flight');
const resHotel = document.getElementById('res-hotel');
const resFood = document.getElementById('res-food');
const resTransport = document.getElementById('res-transport');
const resActivities = document.getElementById('res-activities');
const resOther = document.getElementById('res-other');


// --- 2. ユーティリティ関数 ---
// 数値を3桁区切りの日本円表記（例: ¥155,000）にフォーマット
function formatJPY(amount) {
  return '¥' + Math.round(amount).toLocaleString('ja-JP');
}

// エラーメッセージの表示/非表示切り替え
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('visible');
  resultCard.classList.add('hidden'); // エラー時は結果カードを隠す
}

function clearError() {
  errorMessage.textContent = '';
  errorMessage.classList.remove('visible');
}


// --- 3. バリデーション関数（入力チェック） ---
function validateInputs() {
  // 1. 必須項目の空チェック
  if (!originInput.value.trim() || !destinationInput.value.trim()) {
    showError('Please enter both origin and destination.');
    return false;
  }

  // 2. 日数のチェック（1以上）
  const days = Number(daysInput.value);
  if (!daysInput.value || isNaN(days) || days < 1) {
    showError('Number of days must be at least 1.');
    return false;
  }

  // 3. 人数のチェック（1以上）
  const travelers = Number(travelersInput.value);
  if (!travelersInput.value || isNaN(travelers) || travelers < 1) {
    showError('Number of travelers must be at least 1.');
    return false;
  }

  // 4. 金額項目のチェック（0以上）
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

  // すべてのチェックを通過
  clearError();
  return true;
}


// --- 4. 自動計算メイン処理 ---
function calculateBudget() {
  // まず入力チェックを実行
  if (!validateInputs()) {
    return; // チェックに通らなければここで計算を中止
  }

  // 数値への変換
  const days = Number(daysInput.value);
  const travelers = Number(travelersInput.value);
  
  const flightPrice = Number(flightInput.value);
  const hotelPrice = Number(hotelInput.value);
  const foodPrice = Number(foodInput.value);
  const transportPrice = Number(transportInput.value);
  const activitiesPrice = Number(activitiesInput.value);
  const otherPrice = Number(otherInput.value);

  // 宿泊数（最低0泊）
  const nights = Math.max(days - 1, 0);

  // 計算処理
  const totalFlight = flightPrice * travelers;
  const totalHotel = hotelPrice * nights * travelers;
  const totalFood = foodPrice * days * travelers;
  const totalTransport = transportPrice * days * travelers;
  const totalActivities = activitiesPrice * days * travelers;
  const totalOther = otherPrice;

  const totalCost = totalFlight + totalHotel + totalFood + totalTransport + totalActivities + totalOther;

  const perPersonCost = totalCost / travelers;
  const perDayCost = totalCost / days;

  // 画面への反映
  resDestination.textContent = destinationInput.value.trim();
  resDays.textContent = days;
  resTravelers.textContent = travelers;
  resStyle.textContent = styleInput.value;

  resTotal.textContent = formatJPY(totalCost);
  resPerPerson.textContent = formatJPY(perPersonCost);
  resPerDay.textContent = formatJPY(perDayCost);

  resFlight.textContent = formatJPY(totalFlight);
  resHotel.textContent = formatJPY(totalHotel);
  resFood.textContent = formatJPY(totalFood);
  resTransport.textContent = formatJPY(totalTransport);
  resActivities.textContent = formatJPY(totalActivities);
  resOther.textContent = formatJPY(totalOther);

  // 結果カードを表示
  resultCard.classList.remove('hidden');
}


// --- 5. イベントリスナー ---
budgetForm.addEventListener('submit', function (event) {
  event.preventDefault();
  calculateBudget();
});