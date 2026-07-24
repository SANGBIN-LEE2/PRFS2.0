// =============================================
// PRFS 2.0 렌더팜 예약 시스템 v2
// Google Apps Script (GAS)
// M동 (Blender) / T동 (C4D) 통합 관리
// =============================================

const CONFIG = {
  SHEETS: {
    M_DONG: 'M동_예약',
    T_DONG: 'T동_예약',
    USERS: '사용자목록',
    LOG: '사용로그',
  },
  TIME_SLOTS: [
    '19:00~23:00',
    '23:00~03:00',
    '03:00~07:00',
    '07:00~11:00',
  ],
};

// =============================================
// 초기 설정 (최초 1회 실행)
// =============================================
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  createReservationSheet(ss, CONFIG.SHEETS.M_DONG, 'M동 (Blender)');
  createReservationSheet(ss, CONFIG.SHEETS.T_DONG, 'T동 (C4D)');
  createUserSheet(ss);
  createLogSheet(ss);
  SpreadsheetApp.getUi().alert('초기 설정 완료!');
}

// =============================================
// 예약 시트 생성 (최적화 버전)
// =============================================
function createReservationSheet(ss, sheetName, title) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  sheet.clear();

  const DAYS = ['일','월','화','수','목','금','토'];
  const today = new Date();
  const numDays = 14; // 2주치만 생성

  // 헤더 데이터
  const titleRow = [`${title} 렌더팜 예약 시스템`, '', '', '', '', ''];
  const headerRow = ['날짜', '요일', ...CONFIG.TIME_SLOTS];

  // 날짜 데이터 한번에 생성
  const dateRows = [];
  for (let i = 0; i < numDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = Utilities.formatDate(d, 'Asia/Seoul', 'yyyy-MM-dd');
    const dayStr = DAYS[d.getDay()];
    dateRows.push([dateStr, dayStr, '', '', '', '']);
  }

  // 한번에 시트에 쓰기 (속도 최적화)
  const allData = [titleRow, headerRow, ...dateRows];
  sheet.getRange(1, 1, allData.length, 6).setValues(allData);

  // 스타일 적용
  // 제목 행
  const titleRange = sheet.getRange(1, 1, 1, 6);
  titleRange.merge();
  titleRange.setBackground('#1A2533').setFontColor('#FFFFFF')
    .setFontSize(13).setFontWeight('bold').setHorizontalAlignment('center');

  // 헤더 행
  sheet.getRange(2, 1, 1, 6)
    .setBackground('#2C3E50').setFontColor('#FFFFFF')
    .setFontWeight('bold').setHorizontalAlignment('center');

  // 날짜 행 배경색
  for (let i = 0; i < numDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const row = i + 3;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    sheet.getRange(row, 1, 1, 6).setBackground(isWeekend ? '#EBF5FB' : '#FFFFFF');
    if (d.getDay() === 0) sheet.getRange(row, 2).setFontColor('#E74C3C');
    if (d.getDay() === 6) sheet.getRange(row, 2).setFontColor('#2980B9');
  }

  // 열 너비
  sheet.setColumnWidth(1, 110);
  sheet.setColumnWidth(2, 50);
  for (let i = 3; i <= 6; i++) sheet.setColumnWidth(i, 140);

  return sheet;
}

// =============================================
// 사용자 목록 시트 생성
// =============================================
function createUserSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEETS.USERS);
  sheet.clear();

  const headers = [['학번', '이름', '사용 DCC', '주간 예약 수', '페널티 횟수', '상태']];
  sheet.getRange(1, 1, 1, 6).setValues(headers);
  sheet.getRange(1, 1, 1, 6)
    .setBackground('#2C3E50').setFontColor('#FFFFFF')
    .setFontWeight('bold').setHorizontalAlignment('center');
}

// =============================================
// 사용 로그 시트 생성
// =============================================
function createLogSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.LOG);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEETS.LOG);
  sheet.clear();

  const headers = [['타임스탬프', '학번', '이름', '실습실', '날짜', '타임슬롯', '액션']];
  sheet.getRange(1, 1, 1, 7).setValues(headers);
  sheet.getRange(1, 1, 1, 7)
    .setBackground('#2C3E50').setFontColor('#FFFFFF')
    .setFontWeight('bold').setHorizontalAlignment('center');
}

// =============================================
// 예약 추가
// =============================================
function addReservation(dong, date, timeSlot, studentId, studentName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = dong === 'M' ? CONFIG.SHEETS.M_DONG : CONFIG.SHEETS.T_DONG;
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();

  // 날짜 행 찾기
  let targetRow = -1;
  for (let i = 2; i < data.length; i++) {
    if (data[i][0] === date) { targetRow = i + 1; break; }
  }
  if (targetRow === -1) return { success: false, message: '날짜를 찾을 수 없습니다.' };

  // 타임슬롯 열
  const timeSlotCol = CONFIG.TIME_SLOTS.indexOf(timeSlot) + 3;
  if (timeSlotCol < 3) return { success: false, message: '잘못된 타임슬롯입니다.' };

  // 중복 확인
  if (data[targetRow - 1][timeSlotCol - 1] !== '') {
    return { success: false, message: '이미 예약된 시간대입니다.' };
  }

  // 주간 3블럭 제한
  if (getWeeklyCount(data, studentId, date) >= 3) {
    return { success: false, message: '주간 최대 3블럭을 초과하였습니다.' };
  }

  // 예약 등록
  sheet.getRange(targetRow, timeSlotCol)
    .setValue(`${studentName}\n(${studentId})`)
    .setBackground('#AED6F1')
    .setHorizontalAlignment('center')
    .setWrap(true);

  addLog(studentId, studentName, dong === 'M' ? 'M동' : 'T동', date, timeSlot, '예약');
  return { success: true, message: '예약 완료!' };
}

// =============================================
// 예약 취소
// =============================================
function cancelReservation(dong, date, timeSlot, studentId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = dong === 'M' ? CONFIG.SHEETS.M_DONG : CONFIG.SHEETS.T_DONG;
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();

  let targetRow = -1;
  for (let i = 2; i < data.length; i++) {
    if (data[i][0] === date) { targetRow = i + 1; break; }
  }
  if (targetRow === -1) return { success: false, message: '날짜를 찾을 수 없습니다.' };

  const timeSlotCol = CONFIG.TIME_SLOTS.indexOf(timeSlot) + 3;
  const cellValue = data[targetRow - 1][timeSlotCol - 1];

  if (!cellValue.includes(studentId)) {
    return { success: false, message: '본인 예약만 취소할 수 있습니다.' };
  }

  sheet.getRange(targetRow, timeSlotCol).setValue('').setBackground('#FFFFFF');
  addLog(studentId, '', dong === 'M' ? 'M동' : 'T동', date, timeSlot, '취소');
  return { success: true, message: '예약 취소 완료!' };
}

// =============================================
// 주간 예약 수 확인
// =============================================
function getWeeklyCount(data, studentId, date) {
  const target = new Date(date);
  const day = target.getDay();
  const monday = new Date(target);
  monday.setDate(target.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  let count = 0;
  for (let i = 2; i < data.length; i++) {
    const rowDate = new Date(data[i][0]);
    if (rowDate >= monday && rowDate <= sunday) {
      for (let j = 2; j <= 5; j++) {
        if (data[i][j] && String(data[i][j]).includes(studentId)) count++;
      }
    }
  }
  return count;
}

// =============================================
// 로그 기록
// =============================================
function addLog(studentId, studentName, dong, date, timeSlot, action) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = ss.getSheetByName(CONFIG.SHEETS.LOG);
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
  logSheet.appendRow([timestamp, studentId, studentName, dong, date, timeSlot, action]);
}

// =============================================
// 날짜 업데이트
// =============================================
function updateDates() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  [CONFIG.SHEETS.M_DONG, CONFIG.SHEETS.T_DONG].forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet) {
      const title = name === CONFIG.SHEETS.M_DONG ? 'M동 (Blender)' : 'T동 (C4D)';
      createReservationSheet(ss, name, title);
    }
  });
}

// =============================================
// 현황 요약
// =============================================
function getSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
  let summary = `📊 렌더팜 현황 (${today})\n\n`;

  [
    { name: 'M동 (Blender)', sheet: CONFIG.SHEETS.M_DONG },
    { name: 'T동 (C4D)', sheet: CONFIG.SHEETS.T_DONG }
  ].forEach(({ name, sheet: sheetName }) => {
    const sheet = ss.getSheetByName(sheetName);
    const data = sheet.getDataRange().getValues();
    summary += `🖥️ ${name}\n`;
    for (let i = 2; i < data.length; i++) {
      if (data[i][0] === today) {
        CONFIG.TIME_SLOTS.forEach((slot, j) => {
          summary += `  ${slot}: ${data[i][j + 2] || '비어있음'}\n`;
        });
        break;
      }
    }
    summary += '\n';
  });

  SpreadsheetApp.getUi().alert(summary);
}

// =============================================
// 메뉴 추가
// =============================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🎬 렌더팜 관리')
    .addItem('📋 오늘 현황 보기', 'getSummary')
    .addSeparator()
    .addItem('🔄 날짜 업데이트', 'updateDates')
    .addSeparator()
    .addItem('⚙️ 초기 설정 (최초 1회)', 'setupSheets')
    .addToUi();
}
