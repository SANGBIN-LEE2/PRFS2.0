// =============================================
// PRFS 2.0 렌더팜 예약 시스템 v4
// 기간: 2026.09.22 ~ 2026.11.28
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
  START_DATE: '2026-09-22',
  END_DATE: '2026-11-28',
};

// =============================================
// 초기 설정 (최초 1회 실행)
// 시트 구조만 만들기 - 날짜는 별도 실행
// =============================================
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  setupReservationSheet(ss, CONFIG.SHEETS.M_DONG, 'M동 (Blender)');
  setupReservationSheet(ss, CONFIG.SHEETS.T_DONG, 'T동 (C4D)');
  setupUserSheet(ss);
  setupLogSheet(ss);

  SpreadsheetApp.getUi().alert('✅ 시트 생성 완료!\n\n다음으로 fillDates_Part1 → fillDates_Part2 순서로 실행해주세요.');
}

// 예약 시트 생성 (헤더만)
function setupReservationSheet(ss, sheetName, title) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  sheet.clear();

  sheet.getRange(1, 1, 2, 6).setValues([
    [`[${title}] 렌더팜 예약표 (2026.09.22 ~ 2026.11.28)`, '', '', '', '', ''],
    ['날짜', '요일', ...CONFIG.TIME_SLOTS]
  ]);
}

// =============================================
// 날짜 채우기 - 1부 (9월 22일 ~ 10월 25일)
// =============================================
function fillDates_Part1() {
  fillDateRange('2026-09-22', '2026-10-25');
  SpreadsheetApp.getUi().alert('✅ 1부 완료! (9/22 ~ 10/25)\n\n이제 fillDates_Part2 실행해주세요.');
}

// =============================================
// 날짜 채우기 - 2부 (10월 26일 ~ 11월 28일)
// =============================================
function fillDates_Part2() {
  fillDateRange('2026-10-26', '2026-11-28');
  SpreadsheetApp.getUi().alert('✅ 2부 완료! (10/26 ~ 11/28)\n\n날짜 설정이 모두 완료되었습니다!');
}

// 날짜 범위 채우기 공통 함수
function fillDateRange(startStr, endStr) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const DAYS = ['일','월','화','수','목','금','토'];

  const start = new Date(startStr);
  const end = new Date(endStr);
  const rows = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    rows.push([
      Utilities.formatDate(d, 'Asia/Seoul', 'yyyy-MM-dd'),
      DAYS[d.getDay()],
      '', '', '', ''
    ]);
  }

  [CONFIG.SHEETS.M_DONG, CONFIG.SHEETS.T_DONG].forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, rows.length, 6).setValues(rows);
  });
}

// 사용자 목록 시트
function setupUserSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEETS.USERS);
  sheet.clear();
  sheet.getRange(1, 1, 1, 6).setValues([
    ['학번', '이름', '사용 DCC', '주간 예약 수', '페널티', '상태']
  ]);
}

// 로그 시트
function setupLogSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.LOG);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEETS.LOG);
  sheet.clear();
  sheet.getRange(1, 1, 1, 7).setValues([
    ['타임스탬프', '학번', '이름', '실습실', '날짜', '타임슬롯', '액션']
  ]);
}

// =============================================
// 예약 추가
// =============================================
function addReservation(dong, date, timeSlot, studentId, studentName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(dong === 'M' ? CONFIG.SHEETS.M_DONG : CONFIG.SHEETS.T_DONG);
  const data = sheet.getDataRange().getValues();

  let targetRow = -1;
  for (let i = 2; i < data.length; i++) {
    if (data[i][0] === date) { targetRow = i + 1; break; }
  }
  if (targetRow === -1) return { success: false, message: '날짜를 찾을 수 없습니다.' };

  const col = CONFIG.TIME_SLOTS.indexOf(timeSlot) + 3;
  if (col < 3) return { success: false, message: '잘못된 타임슬롯입니다.' };
  if (data[targetRow-1][col-1] !== '') return { success: false, message: '이미 예약된 시간대입니다.' };
  if (getWeeklyCount(data, studentId, date) >= 3) return { success: false, message: '주간 3블럭 초과입니다.' };

  sheet.getRange(targetRow, col).setValue(`${studentName}(${studentId})`);
  addLog(studentId, studentName, dong === 'M' ? 'M동' : 'T동', date, timeSlot, '예약');
  return { success: true, message: '예약 완료!' };
}

// =============================================
// 예약 취소
// =============================================
function cancelReservation(dong, date, timeSlot, studentId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(dong === 'M' ? CONFIG.SHEETS.M_DONG : CONFIG.SHEETS.T_DONG);
  const data = sheet.getDataRange().getValues();

  let targetRow = -1;
  for (let i = 2; i < data.length; i++) {
    if (data[i][0] === date) { targetRow = i + 1; break; }
  }
  if (targetRow === -1) return { success: false, message: '날짜를 찾을 수 없습니다.' };

  const col = CONFIG.TIME_SLOTS.indexOf(timeSlot) + 3;
  if (!String(data[targetRow-1][col-1]).includes(studentId)) {
    return { success: false, message: '본인 예약만 취소 가능합니다.' };
  }

  sheet.getRange(targetRow, col).setValue('');
  addLog(studentId, '', dong === 'M' ? 'M동' : 'T동', date, timeSlot, '취소');
  return { success: true, message: '취소 완료!' };
}

// 주간 예약 수
function getWeeklyCount(data, studentId, date) {
  const target = new Date(date);
  const day = target.getDay();
  const monday = new Date(target);
  monday.setDate(target.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  let count = 0;
  for (let i = 2; i < data.length; i++) {
    const d = new Date(data[i][0]);
    if (d >= monday && d <= sunday) {
      for (let j = 2; j <= 5; j++) {
        if (String(data[i][j]).includes(studentId)) count++;
      }
    }
  }
  return count;
}

// 로그 기록
function addLog(studentId, studentName, dong, date, timeSlot, action) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
  ss.getSheetByName(CONFIG.SHEETS.LOG).appendRow(
    [timestamp, studentId, studentName, dong, date, timeSlot, action]
  );
}

// 현황 보기
function getSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
  let msg = `📊 오늘(${today}) 현황\n\n`;

  [
    ['M동 (Blender)', CONFIG.SHEETS.M_DONG],
    ['T동 (C4D)', CONFIG.SHEETS.T_DONG]
  ].forEach(([name, sheetName]) => {
    const data = ss.getSheetByName(sheetName).getDataRange().getValues();
    msg += `🖥️ ${name}\n`;
    for (let i = 2; i < data.length; i++) {
      if (data[i][0] === today) {
        CONFIG.TIME_SLOTS.forEach((slot, j) => {
          msg += `  ${slot}: ${data[i][j+2] || '비어있음'}\n`;
        });
        break;
      }
    }
    msg += '\n';
  });

  SpreadsheetApp.getUi().alert(msg);
}

// 메뉴
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🎬 렌더팜 관리')
    .addItem('📋 오늘 현황', 'getSummary')
    .addSeparator()
    .addItem('⚙️ 초기 설정 (최초 1회)', 'setupSheets')
    .addItem('📅 날짜 채우기 1부 (9/22~10/25)', 'fillDates_Part1')
    .addItem('📅 날짜 채우기 2부 (10/26~11/28)', 'fillDates_Part2')
    .addToUi();
}
