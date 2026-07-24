// =============================================
// PRFS 2.0 렌더팜 예약 시스템
// Google Apps Script (GAS)
// M동 (Blender) / T동 (C4D) 통합 관리
// =============================================

// =============================================
// 설정값
// =============================================
const CONFIG = {
  // 시트 이름
  SHEETS: {
    M_DONG: 'M동_예약',      // M동 Blender 예약 시트
    T_DONG: 'T동_예약',      // T동 C4D 예약 시트
    USERS: '사용자목록',      // 등록된 사용자 목록
    LOG: '사용로그',          // 사용 기록
  },

  // 타임 슬롯 (4타임제)
  TIME_SLOTS: [
    '19:00 ~ 23:00',
    '23:00 ~ 03:00',
    '03:00 ~ 07:00',
    '07:00 ~ 11:00',
  ],

  // 페널티 기준
  PENALTY: {
    WARNING: 1,       // 1회: 경고
    MINUS_2: 2,       // 2회: 해당 주 -2블럭
    SUSPEND_3: 3,     // 3회: 3일 정지
    REVOKE: 4,        // 4회 이상: 사용권 박탈
  }
};

// =============================================
// 초기 설정 (최초 1회 실행)
// =============================================
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // M동 예약 시트 생성
  createReservationSheet(ss, CONFIG.SHEETS.M_DONG, 'M동 (Blender)');

  // T동 예약 시트 생성
  createReservationSheet(ss, CONFIG.SHEETS.T_DONG, 'T동 (C4D)');

  // 사용자 목록 시트 생성
  createUserSheet(ss);

  // 사용 로그 시트 생성
  createLogSheet(ss);

  SpreadsheetApp.getUi().alert('초기 설정이 완료되었습니다!');
}

// =============================================
// 예약 시트 생성
// =============================================
function createReservationSheet(ss, sheetName, title) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  sheet.clear();

  // 헤더 설정
  const headers = ['날짜', '요일', ...CONFIG.TIME_SLOTS, '비고'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#2C3E50')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // 제목 행 추가
  sheet.insertRowBefore(1);
  sheet.getRange(1, 1, 1, headers.length).merge();
  sheet.getRange(1, 1).setValue(`${title} 렌더팜 예약 시스템`);
  sheet.getRange(1, 1)
    .setBackground('#1A2533')
    .setFontColor('#FFFFFF')
    .setFontSize(14)
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // 열 너비 설정
  sheet.setColumnWidth(1, 100); // 날짜
  sheet.setColumnWidth(2, 60);  // 요일
  for (let i = 3; i <= 6; i++) {
    sheet.setColumnWidth(i, 150); // 타임슬롯
  }
  sheet.setColumnWidth(7, 200); // 비고

  // 날짜 자동 채우기 (오늘부터 4주)
  fillDates(sheet);

  return sheet;
}

// =============================================
// 날짜 자동 채우기
// =============================================
function fillDates(sheet) {
  const today = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];

  for (let i = 0; i < 28; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const row = i + 3; // 헤더 2행 이후부터
    const dateStr = Utilities.formatDate(date, 'Asia/Seoul', 'yyyy-MM-dd');
    const dayStr = days[date.getDay()];

    sheet.getRange(row, 1).setValue(dateStr);
    sheet.getRange(row, 2).setValue(dayStr);

    // 주말 배경색 설정
    if (date.getDay() === 0 || date.getDay() === 6) {
      sheet.getRange(row, 1, 1, 7).setBackground('#EBF5FB');
    } else {
      sheet.getRange(row, 1, 1, 7).setBackground('#FFFFFF');
    }

    // 요일 색상
    if (date.getDay() === 0) sheet.getRange(row, 2).setFontColor('#E74C3C'); // 일
    if (date.getDay() === 6) sheet.getRange(row, 2).setFontColor('#2980B9'); // 토
  }
}

// =============================================
// 사용자 목록 시트 생성
// =============================================
function createUserSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.USERS);
  }
  sheet.clear();

  const headers = ['학번', '이름', '사용 DCC', '주간 예약 수', '페널티 횟수', '상태', '비고'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#2C3E50')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // 열 너비
  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 100);
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 100);
  sheet.setColumnWidth(7, 200);
}

// =============================================
// 사용 로그 시트 생성
// =============================================
function createLogSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.SHEETS.LOG);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEETS.LOG);
  }
  sheet.clear();

  const headers = ['타임스탬프', '학번', '이름', '실습실', '날짜', '타임슬롯', '액션', '비고'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#2C3E50')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
}

// =============================================
// 예약 추가
// =============================================
function addReservation(dong, date, timeSlot, studentId, studentName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = dong === 'M' ? CONFIG.SHEETS.M_DONG : CONFIG.SHEETS.T_DONG;
  const sheet = ss.getSheetByName(sheetName);

  // 날짜 행 찾기
  const dateCol = 1;
  const dataRange = sheet.getRange(3, 1, sheet.getLastRow() - 2, 1).getValues();
  let targetRow = -1;

  for (let i = 0; i < dataRange.length; i++) {
    if (dataRange[i][0] === date) {
      targetRow = i + 3;
      break;
    }
  }

  if (targetRow === -1) {
    return { success: false, message: '해당 날짜를 찾을 수 없습니다.' };
  }

  // 타임슬롯 열 찾기
  const timeSlotCol = CONFIG.TIME_SLOTS.indexOf(timeSlot) + 3;
  if (timeSlotCol < 3) {
    return { success: false, message: '잘못된 타임슬롯입니다.' };
  }

  // 중복 예약 확인
  const existingValue = sheet.getRange(targetRow, timeSlotCol).getValue();
  if (existingValue !== '') {
    return { success: false, message: `이미 예약된 시간대입니다. (예약자: ${existingValue})` };
  }

  // 주간 예약 수 확인 (1인 최대 3블럭)
  const weeklyCount = getWeeklyReservationCount(dong, studentId, date);
  if (weeklyCount >= 3) {
    return { success: false, message: '주간 최대 예약 수(3블럭)를 초과하였습니다.' };
  }

  // 예약 등록
  const cellValue = `${studentName}\n(${studentId})`;
  sheet.getRange(targetRow, timeSlotCol)
    .setValue(cellValue)
    .setBackground('#AED6F1')
    .setHorizontalAlignment('center')
    .setWrap(true);

  // 로그 기록
  addLog(studentId, studentName, dong === 'M' ? 'M동' : 'T동', date, timeSlot, '예약');

  return { success: true, message: '예약이 완료되었습니다!' };
}

// =============================================
// 예약 취소
// =============================================
function cancelReservation(dong, date, timeSlot, studentId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = dong === 'M' ? CONFIG.SHEETS.M_DONG : CONFIG.SHEETS.T_DONG;
  const sheet = ss.getSheetByName(sheetName);

  // 날짜 행 찾기
  const dataRange = sheet.getRange(3, 1, sheet.getLastRow() - 2, 1).getValues();
  let targetRow = -1;

  for (let i = 0; i < dataRange.length; i++) {
    if (dataRange[i][0] === date) {
      targetRow = i + 3;
      break;
    }
  }

  if (targetRow === -1) {
    return { success: false, message: '해당 날짜를 찾을 수 없습니다.' };
  }

  const timeSlotCol = CONFIG.TIME_SLOTS.indexOf(timeSlot) + 3;
  const existingValue = sheet.getRange(targetRow, timeSlotCol).getValue();

  // 본인 예약인지 확인
  if (!existingValue.includes(studentId)) {
    return { success: false, message: '본인의 예약만 취소할 수 있습니다.' };
  }

  // 예약 취소
  sheet.getRange(targetRow, timeSlotCol)
    .setValue('')
    .setBackground('#FFFFFF');

  // 로그 기록
  addLog(studentId, '', dong === 'M' ? 'M동' : 'T동', date, timeSlot, '취소');

  return { success: true, message: '예약이 취소되었습니다.' };
}

// =============================================
// 주간 예약 수 확인
// =============================================
function getWeeklyReservationCount(dong, studentId, date) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = dong === 'M' ? CONFIG.SHEETS.M_DONG : CONFIG.SHEETS.T_DONG;
  const sheet = ss.getSheetByName(sheetName);

  // 해당 주의 월~일 계산
  const targetDate = new Date(date);
  const day = targetDate.getDay();
  const monday = new Date(targetDate);
  monday.setDate(targetDate.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  let count = 0;
  const dataRange = sheet.getRange(3, 1, sheet.getLastRow() - 2, 7).getValues();

  for (let i = 0; i < dataRange.length; i++) {
    const rowDate = new Date(dataRange[i][0]);
    if (rowDate >= monday && rowDate <= sunday) {
      for (let j = 2; j <= 5; j++) {
        if (dataRange[i][j] && dataRange[i][j].includes(studentId)) {
          count++;
        }
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
  logSheet.appendRow([timestamp, studentId, studentName, dong, date, timeSlot, action, '']);
}

// =============================================
// 날짜 주기적 업데이트 (트리거 설정 필요)
// 매일 자정에 실행하도록 트리거 설정
// =============================================
function updateDates() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  [CONFIG.SHEETS.M_DONG, CONFIG.SHEETS.T_DONG].forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) fillDates(sheet);
  });
}

// =============================================
// 관리자용: 사용자 등록
// =============================================
function registerUser(studentId, studentName, dcc) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName(CONFIG.SHEETS.USERS);

  // 중복 확인
  const data = userSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === studentId) {
      return { success: false, message: '이미 등록된 학번입니다.' };
    }
  }

  userSheet.appendRow([studentId, studentName, dcc, 0, 0, '정상', '']);
  return { success: true, message: '사용자가 등록되었습니다.' };
}

// =============================================
// 관리자용: 전체 현황 요약
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
    const dataRange = sheet.getRange(3, 1, sheet.getLastRow() - 2, 7).getValues();

    summary += `🖥️ ${name}\n`;
    for (let i = 0; i < dataRange.length; i++) {
      if (dataRange[i][0] === today) {
        summary += `  오늘 예약 현황:\n`;
        CONFIG.TIME_SLOTS.forEach((slot, j) => {
          const val = dataRange[i][j + 2];
          summary += `  ${slot}: ${val || '비어있음'}\n`;
        });
        break;
      }
    }
    summary += '\n';
  });

  SpreadsheetApp.getUi().alert(summary);
}

// =============================================
// 메뉴 추가 (스프레드시트 열릴 때 자동 실행)
// =============================================
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🎬 렌더팜 관리')
    .addItem('📋 현황 보기', 'getSummary')
    .addSeparator()
    .addItem('🔄 날짜 업데이트', 'updateDates')
    .addSeparator()
    .addItem('⚙️ 초기 설정 (최초 1회)', 'setupSheets')
    .addToUi();
}
