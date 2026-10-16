// ───────────────────────────────────────────────
// M211 렌더팜 예약 시트 자동화
// ───────────────────────────────────────────────

const SHEET_BOOKING = '예약';
const SHEET_USERS   = '사용자 관리';
const SHEET_LOG     = '변경로그';

const FIRST_ROW = 4;   // 예약 그리드 시작 행
const LAST_ROW  = 21;  // 예약 그리드 끝 행 (6블록 x 3그룹)
const FIRST_COL = 3;   // C열 (월)
const LAST_COL  = 9;   // I열 (일)


// 시트 열릴 때 메뉴 추가
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('렌더팜')
    .addItem('주간 예약 초기화', 'resetWeek')
    .addItem('예약 현황 요약', 'showSummary')
    .addToUi();
}


// 셀 수정 시 검증
function onEdit(e) {
  const sh = e.range.getSheet();
  if (sh.getName() !== SHEET_BOOKING) return;

  const r = e.range.getRow();
  const c = e.range.getColumn();
  if (r < FIRST_ROW || r > LAST_ROW) return;
  if (c < FIRST_COL || c > LAST_COL) return;

  const newVal = (e.value    || '').toString().trim();
  const oldVal = (e.oldValue || '').toString().trim();

  writeLog(e.range.getA1Notation(), oldVal, newVal);

  if (newVal === '') return;  // 예약 취소는 통과

  // 1) 등록된 학번인지 확인
  if (getQuota(newVal) === null) {
    e.range.setValue(oldVal);
    SpreadsheetApp.getActiveSpreadsheet()
      .toast('등록되지 않은 학번입니다: ' + newVal, '예약 거부', 5);
    return;
  }

  // 2) 할당량 초과 여부
  const used  = countBookings(newVal);
  const quota = getQuota(newVal);
  if (used > quota) {
    e.range.setValue(oldVal);
    SpreadsheetApp.getActiveSpreadsheet()
      .toast(newVal + ' 주간 할당량(' + quota + '블록) 초과', '예약 거부', 5);
  }
}


// 학번의 주간 할당량 조회 (미등록이면 null)
function getQuota(studentId) {
  const sh = SpreadsheetApp.getActiveSpreadsheet()
                           .getSheetByName(SHEET_USERS);
  const data = sh.getRange(4, 1, 30, 3).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0].toString().trim() === studentId) {
      return Number(data[i][2]) || 0;
    }
  }
  return null;
}


// 예약 그리드에서 해당 학번 개수 세기
function countBookings(studentId) {
  const sh = SpreadsheetApp.getActiveSpreadsheet()
                           .getSheetByName(SHEET_BOOKING);
  const values = sh.getRange(
    FIRST_ROW, FIRST_COL,
    LAST_ROW - FIRST_ROW + 1,
    LAST_COL  - FIRST_COL + 1
  ).getValues();

  let count = 0;
  values.forEach(function (row) {
    row.forEach(function (cell) {
      if (cell.toString().trim() === studentId) count++;
    });
  });
  return count;
}


// 변경 이력 기록
function writeLog(cellRef, oldVal, newVal) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_LOG);

  if (!sh) {
    sh = ss.insertSheet(SHEET_LOG);
    sh.appendRow(['시각', '편집자', '셀', '이전 값', '변경 값']);
    sh.getRange(1, 1, 1, 5).setFontWeight('bold');
  }

  let editor = '';
  try { editor = Session.getActiveUser().getEmail(); } catch (err) {}

  sh.appendRow([
    new Date(),
    editor,
    cellRef,
    oldVal,
    newVal
  ]);
}


// 주간 예약 초기화
function resetWeek() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.alert(
    '주간 예약 초기화',
    '예약 시트의 모든 예약을 지웁니다. 계속하시겠습니까?',
    ui.ButtonSet.YES_NO
  );
  if (res !== ui.Button.YES) return;

  SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName(SHEET_BOOKING)
    .getRange(
      FIRST_ROW, FIRST_COL,
      LAST_ROW - FIRST_ROW + 1,
      LAST_COL  - FIRST_COL + 1
    ).clearContent();

  ui.alert('초기화가 완료되었습니다.');
}


// 예약 현황 요약
function showSummary() {
  const sh = SpreadsheetApp.getActiveSpreadsheet()
                           .getSheetByName(SHEET_BOOKING);
  const values = sh.getRange(
    FIRST_ROW, FIRST_COL,
    LAST_ROW - FIRST_ROW + 1,
    LAST_COL  - FIRST_COL + 1
  ).getValues();

  const counts = {};
  let total = 0, filled = 0;

  values.forEach(function (row) {
    row.forEach(function (cell) {
      total++;
      const v = cell.toString().trim();
      if (v !== '') {
        filled++;
        counts[v] = (counts[v] || 0) + 1;
      }
    });
  });

  let msg = '전체 ' + total + '블록 중 ' + filled + '블록 예약됨\n'
          + '점유율 ' + Math.round(filled / total * 100) + '%\n\n';

  Object.keys(counts).sort().forEach(function (k) {
    msg += k + ' : ' + counts[k] + '블록\n';
  });

  SpreadsheetApp.getUi().alert('예약 현황', msg,
    SpreadsheetApp.getUi().ButtonSet.OK);
}