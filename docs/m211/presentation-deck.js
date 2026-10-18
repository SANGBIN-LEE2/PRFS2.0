const pptxgen = require("pptxgenjs");
const path = require("path");

const IMG = "/home/claude/prfs2.0/docs/m211/student-guide/img";
const im = (f) => path.join(IMG, f);

const THEME = {
  name: "M211 RenderFarm",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "0E1B2E",   // deep navy  (text1 / dark bg)
    lt1: "FFFFFF",   // white      (bg1)
    dk2: "24415F",   // slate navy (text2)
    lt2: "EEF3F8",   // pale blue  (bg2)
    accent1: "E8963C", // amber — render light
    accent2: "2F6FAE", // blue
    accent3: "C0392B", // red — warning
    accent4: "3D8B6E", // green — ok
    accent5: "6B7D91", // muted
    accent6: "F6D9B4", // soft amber
    hlink: "2F6FAE",
    folHlink: "6B7D91",
  },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";            // 13.3 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "이상빈";
pres.title = "M211 렌더팜 사용 설명회";
const C = pres.SchemeColor;

const W = 13.3, H = 7.5, M = 0.75;

/* ── layouts ─────────────────────────────────────────────── */

pres.defineSlideMaster({
  title: "TITLE_DARK",
  background: { color: C.text1 },
  objects: [
  ],
});

pres.defineSlideMaster({
  title: "DIVIDER",
  background: { color: C.text2 },
  objects: [
  ],
});

pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: C.background1 },
  objects: [
    { text: { text: "M211 렌더팜 사용 설명회", options: { x: M, y: 6.85, w: 6, h: 0.3,
        fontSize: 10, color: C.accent5, isTextBox: true, margin: 0 } } },
    { text: { text: "2026.10.19", options: { x: 10.0, y: 6.85, w: 2.5, h: 0.3,
        fontSize: 10, color: C.accent5, align: "right", isTextBox: true, margin: 0 } } },
  ],
  slideNumber: { x: 12.75, y: 6.85, fontSize: 10, color: "6B7D91" },
});

pres.defineSlideMaster({
  title: "CONTENT_DARK",
  background: { color: C.text1 },
  objects: [
    { text: { text: "M211 렌더팜 사용 설명회", options: { x: M, y: 6.85, w: 6, h: 0.3,
        fontSize: 10, color: C.accent5, isTextBox: true, margin: 0 } } },
  ],
  slideNumber: { x: 12.75, y: 6.85, fontSize: 10, color: "6B7D91" },
});

/* ── helpers ─────────────────────────────────────────────── */

let n = 0;
const card = (s, { x, y, w, h, fill = C.background2, name }) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, fill: { color: fill }, rectRadius: 0.1,
    line: { color: fill }, objectName: name || `card${++n}`,
  });
};

const badge = (s, { x, y, label, fill = C.accent1, color = C.text1, d = 0.52 }) => {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { color } });
  s.addText(label, { x, y, w: d, h: d, fontSize: 17, bold: true, color: fill,
    align: "center", valign: "middle", isTextBox: true, margin: 0 });
};

const T = { x: M, y: 0.5, w: 11.8, h: 0.82, fontSize: 31, bold: true, isTextBox: true, valign: "middle" };
const titleOn = (s, t, dark) => s.addText(t, { ...T, color: dark ? C.background1 : C.text1 });

const content = (sec, title) => {
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: sec });
  titleOn(s, title, false);
  return s;
};

/* ════════════════════════════════════════════════════════ */
pres.addSection({ title: "여는 말" });

let s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "여는 말" });
s.addText("영상애니메이션학부 · 졸업작품 프로젝트", { x: M, y: 2.15, w: 11.8, h: 0.42, fontSize: 15, bold: true, color: C.accent1, charSpacing: 2, isTextBox: true });
s.addText("M211 렌더팜 사용 설명회", { x: M, y: 2.6, w: 11.8, h: 1.5, fontSize: 48, bold: true, color: C.background1, isTextBox: true, valign: "middle" });
s.addText("2026. 10. 19 (월)  ·  M동 211호  ·  이상빈 (C393169)", { x: M, y: 4.25, w: 11.8, h: 1.0, fontSize: 17, color: C.accent6, isTextBox: true });
s.addShape(pres.shapes.RECTANGLE, { x: M, y: 5.6, w: 1.6, h: 0.07, fill: { color: C.accent1 }, line: { color: C.accent1 } });
s.addNotes("안녕하세요. 영상애니메이션학부 4학년 이상빈입니다. 올해 졸업작품으로 학교 렌더팜을 맡아서 작업하고 있습니다. 오늘은 이걸 어떻게 쓰는지 알려드리려고 모셨습니다. 한 시간 안 걸립니다.");

s = content("여는 말", "오늘 순서");
const agenda = [
  ["1", "렌더팜이 뭔가", "3분"],
  ["2", "예약 규칙", "7분"],
  ["3", "사용법", "10분"],
  ["4", "시연", "15분"],
  ["5", "자주 나는 실수", "5분"],
  ["6", "질문", "10분"],
];
agenda.forEach(([no, t, min], i) => {
  const y = 1.65 + i * 0.84;
  card(s, { x: M, y, w: 11.8, h: 0.7, name: `agenda${i}` });
  badge(s, { x: M + 0.22, y: y + 0.09, label: no });
  s.addText(t, { x: M + 1.0, y, w: 8.5, h: 0.7, fontSize: 18, bold: true,
    color: C.text1, valign: "middle", isTextBox: true });
  s.addText(min, { x: 11.0, y, w: 1.3, h: 0.7, fontSize: 14, color: C.accent5,
    align: "right", valign: "middle", isTextBox: true });
});
s.addNotes("순서는 이렇습니다. 중간에 궁금한 거 있으면 바로 물어보셔도 됩니다.");

/* ── 1. 렌더팜이란 ─────────────────────────────────────── */
pres.addSection({ title: "렌더팜이란" });

s = pres.addSlide({ masterName: "DIVIDER", sectionTitle: "렌더팜이란" });
s.addText("1", { x: M, y: 2.35, w: 2.0, h: 1.5, fontSize: 84, bold: true, color: C.accent1, isTextBox: true, margin: 0 });
s.addText("렌더팜이 뭔가", { x: 2.6, y: 2.6, w: 10.0, h: 1.15, fontSize: 40, bold: true, color: C.background1, isTextBox: true, valign: "middle" });
s.addText("내 PC 한 대로 돌릴 걸 여러 대가 나눠서 돌립니다", { x: 2.6, y: 3.85, w: 10.0, h: 0.8, fontSize: 16, color: C.accent6, isTextBox: true });

s = content("렌더팜이란", "100프레임을 혼자 vs 나눠서");
card(s, { x: M, y: 1.6, w: 5.7, h: 3.3, name: "alone" });
s.addText("내 PC 한 대", { x: M + 0.4, y: 1.85, w: 4.9, h: 0.5, fontSize: 18, bold: true, color: C.text2, isTextBox: true });
for (let i = 0; i < 20; i++) {
  s.addShape(pres.shapes.RECTANGLE, { x: M + 0.4 + (i % 10) * 0.48, y: 2.5 + Math.floor(i / 10) * 0.36,
    w: 0.38, h: 0.26, fill: { color: C.accent5 }, line: { color: C.accent5 } });
}
s.addText("한 장씩 순서대로 100번", { x: M + 0.4, y: 3.35, w: 4.9, h: 0.4, fontSize: 14, color: C.accent5, isTextBox: true });
s.addText("밤새", { x: M + 0.4, y: 3.85, w: 4.9, h: 0.7, fontSize: 34, bold: true, color: C.text2, isTextBox: true });

card(s, { x: 6.85, y: 1.6, w: 5.7, h: 3.3, fill: C.accent6, name: "farm" });
s.addText("렌더팜 17대", { x: 7.25, y: 1.85, w: 4.9, h: 0.5, fontSize: 18, bold: true, color: C.text1, isTextBox: true });
for (let i = 0; i < 20; i++) {
  s.addShape(pres.shapes.RECTANGLE, { x: 7.25 + (i % 10) * 0.48, y: 2.5 + Math.floor(i / 10) * 0.36,
    w: 0.38, h: 0.26, fill: { color: C.accent1 }, line: { color: C.accent1 } });
}
s.addText("여러 대가 동시에", { x: 7.25, y: 3.35, w: 4.9, h: 0.4, fontSize: 14, color: C.text2, isTextBox: true });
s.addText("몇 시간", { x: 7.25, y: 3.85, w: 4.9, h: 0.7, fontSize: 34, bold: true, color: C.accent3, isTextBox: true });

s.addText([{ text: "프레임이 많을수록 유리합니다. ", options: { bold: true } },
           { text: "1프레임짜리 스틸은 아무리 나눠도 1대가 돌립니다." }],
  { x: M, y: 5.25, w: 11.8, h: 0.5, fontSize: 16, color: C.text2, isTextBox: true });
s.addNotes("100프레임짜리 샷을 내 컴퓨터로 돌리면 한 장씩 순서대로 100번 돌아야 합니다. 렌더팜에 넣으면 여러 PC에 흩어져서 동시에 돌아갑니다. 중요한 건 프레임이 많을수록 유리하다는 겁니다.");

s = content("렌더팜이란", "전체 흐름은 다섯 단계");
const flow = [
  ["예약", "시간 + 레인"],
  ["파일 준비", "모든 파일을 NAS로"],
  ["업로드", "프로젝트 통째로"],
  ["제출", "먼저 3프레임"],
  ["수령", "받고 폴더 비우기"],
];
flow.forEach(([t, d], i) => {
  const x = M + i * 2.42;
  card(s, { x, y: 2.1, w: 2.1, h: 2.3, name: `flow${i}` });
  badge(s, { x: x + 0.78, y: 2.38, label: String(i + 1) });
  s.addText(t, { x, y: 3.05, w: 2.1, h: 0.45, fontSize: 17, bold: true, color: C.text1, align: "center", isTextBox: true });
  s.addText(d, { x: x + 0.1, y: 3.5, w: 1.9, h: 0.7, fontSize: 12, color: C.accent5, align: "center", isTextBox: true });
  if (i < 4) s.addText("→", { x: x + 2.1, y: 2.95, w: 0.32, h: 0.6, fontSize: 20, color: C.accent1, align: "center", valign: "middle", isTextBox: true, margin: 0 });
});
s.addText("오늘 설명드릴 게 딱 이 다섯 개입니다", { x: M, y: 5.0, w: 11.8, h: 0.5, fontSize: 16, color: C.text2, isTextBox: true });

/* ── 2. 예약 ───────────────────────────────────────────── */
pres.addSection({ title: "예약 규칙" });

s = pres.addSlide({ masterName: "DIVIDER", sectionTitle: "예약 규칙" });
s.addText("2", { x: M, y: 2.35, w: 2.0, h: 1.5, fontSize: 84, bold: true, color: C.accent1, isTextBox: true, margin: 0 });
s.addText("예약 규칙", { x: 2.6, y: 2.6, w: 10.0, h: 1.15, fontSize: 40, bold: true, color: C.background1, isTextBox: true, valign: "middle" });
s.addText("렌더팜은 공동 장비입니다 — 시간을 나눠 씁니다", { x: 2.6, y: 3.85, w: 10.0, h: 0.8, fontSize: 16, color: C.accent6, isTextBox: true });

s = content("예약 규칙", "타임블럭 1개 = 4시간");
card(s, { x: M, y: 1.6, w: 5.7, h: 2.4, name: "wd" });
s.addText("평일 (월~금)", { x: M + 0.4, y: 1.82, w: 4.9, h: 0.45, fontSize: 17, bold: true, color: C.text2, isTextBox: true });
s.addText("19:00 ~ 11:00", { x: M + 0.4, y: 2.3, w: 4.9, h: 0.75, fontSize: 32, bold: true, color: C.text1, isTextBox: true });
s.addText("하루 4블럭 · 낮 11~19시는 수업", { x: M + 0.4, y: 3.15, w: 4.9, h: 0.45, fontSize: 14, color: C.accent5, isTextBox: true });

card(s, { x: 6.85, y: 1.6, w: 5.7, h: 2.4, fill: C.accent6, name: "we" });
s.addText("주말 (토·일)", { x: 7.25, y: 1.82, w: 4.9, h: 0.45, fontSize: 17, bold: true, color: C.text2, isTextBox: true });
s.addText("24시간", { x: 7.25, y: 2.3, w: 4.9, h: 0.75, fontSize: 32, bold: true, color: C.text1, isTextBox: true });
s.addText("하루 6블럭", { x: 7.25, y: 3.15, w: 4.9, h: 0.45, fontSize: 14, color: C.text2, isTextBox: true });

card(s, { x: M, y: 4.35, w: 11.8, h: 1.5, fill: C.text2, name: "night" });
s.addText("새벽 블럭이 가장 한가합니다", { x: M + 0.5, y: 4.55, w: 11.0, h: 0.5, fontSize: 20, bold: true, color: C.accent1, isTextBox: true });
s.addText("렌더는 지켜보지 않아도 돌아갑니다. 저녁에 제출해두고 자면 아침에 결과물이 나와 있습니다.",
  { x: M + 0.5, y: 5.05, w: 11.0, h: 0.6, fontSize: 15, color: C.background1, isTextBox: true });
s.addNotes("평일은 수업이 있어서 저녁 7시부터 다음날 11시까지만 쓸 수 있습니다. 새벽 시간대를 강조해주세요. 다들 저녁 7시만 잡으려고 하는데 새벽은 경쟁이 없습니다.");

s = content("예약 규칙", "PC는 4개 레인 — 네 팀이 동시에");
["A", "B", "C", "D"].forEach((L, i) => {
  const x = M + i * 3.0;
  card(s, { x, y: 1.75, w: 2.75, h: 2.5, fill: i === 0 ? C.accent6 : C.background2, name: `lane${i}` });
  s.addText(L, { x, y: 1.95, w: 2.75, h: 0.9, fontSize: 46, bold: true, color: C.accent1, align: "center", isTextBox: true });
  s.addText("PC 4~5대", { x, y: 2.9, w: 2.75, h: 0.4, fontSize: 14, color: C.text2, align: "center", isTextBox: true });
  s.addText(`pool_${L.toLowerCase()}`, { x, y: 3.35, w: 2.75, h: 0.45, fontSize: 15, bold: true,
    color: C.text1, align: "center", fontFace: "Courier New", isTextBox: true });
});
card(s, { x: M, y: 4.6, w: 11.8, h: 1.3, fill: C.text2, name: "poolnote" });
s.addText([{ text: "예약할 때 ", options: {} }, { text: "시간 + 레인", options: { bold: true, color: C.accent1 } },
  { text: "을 고르고, 제출 창의 ", options: {} }, { text: "Pool", options: { bold: true, color: C.accent1 } },
  { text: " 에 같은 레인을 지정합니다", options: {} }],
  { x: M + 0.5, y: 4.8, w: 11.0, h: 0.5, fontSize: 18, color: C.background1, isTextBox: true });
s.addText("Group 은 none 그대로 두시면 됩니다", { x: M + 0.5, y: 5.3, w: 11.0, h: 0.4, fontSize: 14, color: C.accent6, isTextBox: true });

s = content("예약 규칙", "영상 길이에 따라 다르게 드립니다");
s.addText("렌더 시간은 영상 길이에 거의 비례합니다. 1분짜리와 4분짜리에게 같은 시간을 주면 4분짜리는 마감을 못 맞춥니다.",
  { x: M, y: 1.5, w: 11.8, h: 0.5, fontSize: 16, color: C.text2, isTextBox: true });
[["3분 이하", "라이선스 1개", "주 8블럭 · 32시간", C.background2],
 ["3분 초과", "라이선스 2개", "주 16블럭 · 64시간", C.accent6]].forEach(([a, b, c, f], i) => {
  const y = 2.3 + i * 1.5;
  card(s, { x: M, y, w: 11.8, h: 1.25, fill: f, name: `lic${i}` });
  s.addText(a, { x: M + 0.5, y, w: 3.0, h: 1.25, fontSize: 24, bold: true, color: C.text1, valign: "middle", isTextBox: true });
  s.addText(b, { x: M + 3.6, y, w: 3.4, h: 1.25, fontSize: 20, color: C.text2, valign: "middle", isTextBox: true });
  s.addText(c, { x: M + 7.0, y, w: 4.2, h: 1.25, fontSize: 16, color: C.accent5, align: "right", valign: "middle", isTextBox: true });
});
s.addText("정확한 기준은 신청을 받아본 뒤 정합니다 — 졸준위를 통해 팀 프로젝트명 · 팀장 학번 · 영상 길이를 받습니다",
  { x: M, y: 5.45, w: 11.8, h: 0.5, fontSize: 15, italic: true, color: C.accent2, isTextBox: true });
s.addNotes("'내 건 몇 개 받나요' 질문이 나오면 '신청 받고 정한다'로 일관되게 답하세요.");

s = pres.addSlide({ masterName: "CONTENT_DARK", sectionTitle: "예약 규칙" });
titleOn(s, "지켜주실 것 네 가지", true);
[["예약한 시간에만 쓰기", ""],
 ["남의 예약 건드리지 않기", "수정 기록이 남습니다"],
 ["안 쓸 블럭은 미리 비워주기", "그래야 다른 팀이 씁니다"],
 ["결과물 받아가면 NAS 폴더 비우기", "안 치우면 다른 팀이 아예 렌더를 못 합니다"]].forEach(([t, d], i) => {
  const y = 1.65 + i * 1.22;
  badge(s, { x: M, y: y + 0.12, label: String(i + 1), fill: C.text1, color: C.accent1, d: 0.62 });
  s.addText(t, { x: M + 1.0, y, w: 11.0, h: 0.5, fontSize: 21, bold: true, color: C.background1, isTextBox: true });
  if (d) s.addText(d, { x: M + 1.0, y: y + 0.5, w: 11.0, h: 0.45, fontSize: 14, color: C.accent5, isTextBox: true });
});
s.addText("EXR 시퀀스는 한 프로젝트가 수십 기가입니다", { x: M + 1.0, y: 6.1, w: 11.0, h: 0.4,
  fontSize: 14, italic: true, color: C.accent1, isTextBox: true });

/* ── 3. 사용법 ─────────────────────────────────────────── */
pres.addSection({ title: "사용법" });

s = pres.addSlide({ masterName: "DIVIDER", sectionTitle: "사용법" });
s.addText("3", { x: M, y: 2.35, w: 2.0, h: 1.5, fontSize: 84, bold: true, color: C.accent1, isTextBox: true, margin: 0 });
s.addText("사용법", { x: 2.6, y: 2.6, w: 10.0, h: 1.15, fontSize: 40, bold: true, color: C.background1, isTextBox: true, valign: "middle" });
s.addText("파일 준비 → 올리기 → 제출 → 확인", { x: 2.6, y: 3.85, w: 10.0, h: 0.8, fontSize: 16, color: C.accent6, isTextBox: true });

s = pres.addSlide({ masterName: "CONTENT_DARK", sectionTitle: "사용법" });
titleOn(s, "파일 준비 — 여기가 제일 중요합니다", true);
s.addText("렌더가 실패하는 이유의 90%가 이 단계에 있습니다", { x: M, y: 1.4, w: 11.8, h: 0.45,
  fontSize: 16, color: C.accent5, isTextBox: true });
card(s, { x: M, y: 2.3, w: 11.8, h: 1.6, fill: C.accent1, name: "keystmt" });
s.addText("내 컴퓨터에만 있는 파일은 렌더팜이 못 읽습니다", { x: M + 0.5, y: 2.3, w: 11.0, h: 1.6,
  fontSize: 30, bold: true, color: C.text1, valign: "middle", isTextBox: true });
s.addText("씬 파일 안에는 텍스처가 들어있지 않고 \"텍스처가 어디 있다\"는 경로만 적혀 있습니다.",
  { x: M, y: 4.3, w: 11.8, h: 0.5, fontSize: 17, color: C.background1, isTextBox: true });
s.addText("그 경로가 내 노트북 D드라이브를 가리키면, 렌더팜 PC에는 그런 데가 없으니 못 찾습니다.",
  { x: M, y: 4.8, w: 11.8, h: 0.5, fontSize: 17, color: C.background1, isTextBox: true });
s.addNotes("당연한 얘기 같지만 실제로는 이걸 놓쳐서 실패합니다. 천천히 설명해주세요.");

s = content("사용법", "마야 — 세 가지만 하시면 됩니다");
[["File → Reference Editor", "레퍼런스를 Import 로 바꾸기"],
 ["Windows → General Editors → File Path Editor", "빨간 줄 0개로 만들기"],
 ["Render Settings → Arnold → System", "Render Device = CPU"]].forEach(([where, what], i) => {
  const y = 1.6 + i * 1.3;
  card(s, { x: M, y, w: 11.8, h: 1.1, name: `maya${i}` });
  badge(s, { x: M + 0.3, y: y + 0.29, label: String(i + 1) });
  s.addText(where, { x: M + 1.1, y: y + 0.12, w: 6.3, h: 0.45, fontSize: 14,
    color: C.accent2, fontFace: "Courier New", isTextBox: true });
  s.addText(what, { x: M + 1.1, y: y + 0.52, w: 6.3, h: 0.45, fontSize: 17, bold: true, color: C.text1, isTextBox: true });
});
card(s, { x: M, y: 5.55, w: 11.8, h: 0.85, fill: C.accent6, name: "save" });
s.addText([{ text: "마지막에 Ctrl + S. ", options: { bold: true } },
           { text: "저장 안 하면 아무것도 반영되지 않습니다. 렌더팜은 저장된 내용만 읽습니다." }],
  { x: M + 0.5, y: 5.55, w: 11.0, h: 0.85, fontSize: 16, color: C.text1, valign: "middle", isTextBox: true });
s.addNotes("마야 버전은 신경 안 쓰셔도 된다고 꼭 말해주세요. 렌더팜이 어떤 버전 씬이든 2026으로 렌더합니다.");

s = content("사용법", "빨간 줄이 하나라도 있으면 안 됩니다");
s.addImage({ path: im("03_filepath_red.png"), x: M, y: 1.45, w: 4.6, h: 4.54 });
card(s, { x: 5.7, y: 1.45, w: 6.85, h: 2.1, fill: C.accent6, name: "redbox" });
s.addText("0 Resolved, 79 Unresolved", { x: 6.1, y: 1.7, w: 6.1, h: 0.5, fontSize: 19, bold: true,
  color: C.accent3, fontFace: "Courier New", isTextBox: true });
s.addText("79개를 전부 못 찾고 있다는 뜻입니다. 경로가 다른 사람 PC를 가리키고 있습니다.",
  { x: 6.1, y: 2.2, w: 6.1, h: 1.1, fontSize: 15, color: C.text1, isTextBox: true });
s.addText("이 상태로 돌리면", { x: 5.7, y: 3.85, w: 6.85, h: 0.4, fontSize: 15, color: C.accent5, isTextBox: true });
s.addText("텍스처 없이 회색으로 완료됩니다", { x: 5.7, y: 4.25, w: 6.85, h: 0.6, fontSize: 22, bold: true, color: C.accent3, isTextBox: true });
s.addText("렌더가 중단되지 않기 때문에, 결과물을 봐야만 압니다.", { x: 5.7, y: 4.9, w: 6.85, h: 0.5,
  fontSize: 15, color: C.text2, isTextBox: true });
s.addText("전부 선택 → Repath Files → NAS 폴더 지정", { x: 5.7, y: 5.5, w: 6.85, h: 0.5,
  fontSize: 16, bold: true, color: C.accent2, isTextBox: true });

s = content("사용법", "Render Device 는 왜 CPU 인가");
card(s, { x: M, y: 1.55, w: 5.7, h: 1.85, name: "gpu1" });
s.addText("M211-05", { x: M + 0.4, y: 1.75, w: 4.9, h: 0.4, fontSize: 14, color: C.accent5, fontFace: "Courier New", isTextBox: true });
s.addText("GPU 9420MB 여유", { x: M + 0.4, y: 2.15, w: 4.9, h: 0.5, fontSize: 19, bold: true, color: C.text1, isTextBox: true });
s.addText("성공", { x: M + 0.4, y: 2.7, w: 4.9, h: 0.5, fontSize: 20, bold: true, color: C.accent4, isTextBox: true });
card(s, { x: 6.85, y: 1.55, w: 5.7, h: 1.85, fill: C.accent6, name: "gpu2" });
s.addText("M211-07", { x: 7.25, y: 1.75, w: 4.9, h: 0.4, fontSize: 14, color: C.accent5, fontFace: "Courier New", isTextBox: true });
s.addText("GPU 373MB 여유", { x: 7.25, y: 2.15, w: 4.9, h: 0.5, fontSize: 19, bold: true, color: C.text1, isTextBox: true });
s.addText("실패", { x: 7.25, y: 2.7, w: 4.9, h: 0.5, fontSize: 20, bold: true, color: C.accent3, isTextBox: true });
s.addText("같은 작업인데 어느 PC에 걸리느냐에 따라 갈립니다", { x: M, y: 3.65, w: 11.8, h: 0.5,
  fontSize: 18, bold: true, color: C.text1, isTextBox: true });
s.addText("Arnold 는 그래픽카드 메모리가 부족하면 CPU 로 넘어가지 않고 그냥 중단합니다. 전체가 실패하면 바로 알 텐데, 일부만 빠지니까 모르고 넘어갑니다.",
  { x: M, y: 4.2, w: 11.8, h: 0.8, fontSize: 15, color: C.text2, isTextBox: true });
card(s, { x: M, y: 5.2, w: 11.8, h: 1.0, fill: C.text2, name: "cpufix" });
s.addText("CPU 로 고정하면 어느 PC에 걸리든 결과가 같습니다", { x: M + 0.5, y: 5.2, w: 11.0, h: 1.0,
  fontSize: 19, bold: true, color: C.accent1, valign: "middle", isTextBox: true });
s.addNotes("실제로 테스트 중에 겪은 일이라고 말하면 설득력이 올라갑니다.");

s = content("사용법", "블렌더 — 세 가지");
[["File → External Data", "Pack Resources", "텍스처가 blend 파일 안으로 들어갑니다"],
 ["Output Properties", "경로 끝에 ####", "빠지면 100프레임 돌려도 1장만 남습니다"],
 ["Render Properties", "Device = CPU", ""]].forEach(([where, what, note], i) => {
  const y = 1.6 + i * 1.45;
  card(s, { x: M, y, w: 11.8, h: 1.25, name: `bl${i}` });
  badge(s, { x: M + 0.3, y: y + 0.36, label: String(i + 1) });
  s.addText(where, { x: M + 1.1, y: y + 0.15, w: 4.2, h: 0.45, fontSize: 14,
    color: C.accent2, fontFace: "Courier New", isTextBox: true });
  s.addText(what, { x: M + 1.1, y: y + 0.55, w: 4.2, h: 0.5, fontSize: 18, bold: true, color: C.text1, isTextBox: true });
  if (note) s.addText(note, { x: M + 5.6, y, w: 6.0, h: 1.25, fontSize: 14, color: C.accent5, valign: "middle", isTextBox: true });
});
s.addText("블렌더는 Pack Resources 한 번이면 경로 문제가 아예 사라집니다 — 가장 확실한 방법입니다",
  { x: M, y: 5.95, w: 11.8, h: 0.5, fontSize: 15, italic: true, color: C.accent2, isTextBox: true });

s = content("사용법", "NAS 에 올리기");
s.addText("학번 폴더는 이미 만들어져 있습니다. 날짜_작업명 폴더만 만들고 프로젝트를 통째로 복사하세요.",
  { x: M, y: 1.45, w: 11.8, h: 0.5, fontSize: 16, color: C.text2, isTextBox: true });
card(s, { x: M, y: 2.1, w: 11.8, h: 2.05, fill: C.text1, name: "pathbox" });
s.addText([
  { text: "input\\C393169\\", options: { color: C.accent5 } },
  { text: "20261103_final\\", options: { color: C.accent1, bold: true } },
  { text: "\n        └ MyProject\\   ", options: { color: C.background1 } },
  { text: "← 쓰시던 프로젝트 폴더 통째로", options: { color: C.accent6 } },
  { text: "\n            ├ scenes\\\n            ├ sourceimages\\\n            └ cache\\", options: { color: C.accent5 } },
], { x: M + 0.5, y: 2.3, w: 11.0, h: 1.7, fontSize: 15, fontFace: "Courier New", isTextBox: true, lineSpacing: 22 });
card(s, { x: M, y: 4.4, w: 5.7, h: 1.75, fill: C.accent6, name: "ok" });
s.addText("써도 되는 것", { x: M + 0.4, y: 4.6, w: 4.9, h: 0.4, fontSize: 15, bold: true, color: C.accent4, isTextBox: true });
s.addText("영문 소문자 · 숫자 · 밑줄( _ )", { x: M + 0.4, y: 5.05, w: 4.9, h: 0.8, fontSize: 17, color: C.text1, isTextBox: true });
card(s, { x: 6.85, y: 4.4, w: 5.7, h: 1.75, name: "no" });
s.addText("쓰면 안 되는 것", { x: 7.25, y: 4.6, w: 4.9, h: 0.4, fontSize: 15, bold: true, color: C.accent3, isTextBox: true });
s.addText("한글 · 띄어쓰기 · 점( . )", { x: 7.25, y: 5.05, w: 4.9, h: 0.8, fontSize: 17, bold: true, color: C.text1, isTextBox: true });
s.addNotes("씬 파일 하나만 올리면 안 된다고 꼭 말해주세요. 그리고 맨 위 폴더만 바꾸면 안 되고 안쪽까지 봐야 합니다.");

s = content("사용법", "경로에 띄어쓰기와 점이 있으면 끊깁니다");
[[".../scenes/s03 c220/ Lighting/shot.mb", "띄어쓰기에서 경로가 끊김", false],
 [".../scenes.mb/s03_c220/shot.mb", "점을 확장자로 착각해 거기가 끝이라고 읽음", false],
 [".../scenes/s03_c220/Lighting/shot.mb", "정상", true]].forEach(([p, why, ok], i) => {
  const y = 1.75 + i * 1.45;
  card(s, { x: M, y, w: 11.8, h: 1.2, fill: ok ? C.accent6 : C.background2, name: `pathex${i}` });
  s.addText(ok ? "OK" : "X", { x: M + 0.35, y: y + 0.3, w: 0.7, h: 0.6, fontSize: 20, bold: true,
    color: ok ? C.accent4 : C.accent3, align: "center", isTextBox: true, margin: 0 });
  s.addText(p, { x: M + 1.25, y: y + 0.15, w: 10.2, h: 0.5, fontSize: 15, color: C.text1,
    fontFace: "Courier New", isTextBox: true });
  s.addText(why, { x: M + 1.25, y: y + 0.62, w: 10.2, h: 0.45, fontSize: 14, color: C.accent5, isTextBox: true });
});
s.addText("이미 띄어쓰기가 많은 프로젝트는 가이드의 일괄 변경 스크립트를 쓰세요 — 손으로 고치지 마세요",
  { x: M, y: 6.05, w: 11.8, h: 0.5, fontSize: 15, italic: true, color: C.accent2, isTextBox: true });

s = content("사용법", "제출 — 네 개만 보면 됩니다");
s.addImage({ path: im("05_maya_submit.png"), x: 7.0, y: 1.5, w: 5.55, h: 4.85 });
[["Job Name", "알아보기 쉬운 이름"],
 ["Pool", "예약한 레인 (pool_a ~ d)"],
 ["Frame List", "처음엔 1-3"],
 ["Camera", "렌더할 카메라"]].forEach(([k, v], i) => {
  const y = 1.6 + i * 1.08;
  card(s, { x: M, y, w: 5.9, h: 0.92, name: `sub${i}` });
  s.addText(k, { x: M + 0.35, y: y + 0.08, w: 5.2, h: 0.42, fontSize: 17, bold: true, color: C.text1, isTextBox: true });
  s.addText(v, { x: M + 0.35, y: y + 0.48, w: 5.2, h: 0.38, fontSize: 13, color: C.accent5, isTextBox: true });
});
card(s, { x: M, y: 6.0, w: 5.9, h: 0.72, fill: C.accent6, name: "subnote" });
s.addText("나머지는 전부 기본값 그대로", { x: M + 0.35, y: 6.0, w: 5.2, h: 0.72, fontSize: 15,
  bold: true, color: C.text1, valign: "middle", isTextBox: true });
s.addNotes("Pool이 예약한 레인과 같아야 한다고 강조하세요. Camera도 꼭 고르라고 하세요 — 안 고르면 persp로 렌더돼서 전부 다시 돌려야 합니다.");

s = pres.addSlide({ masterName: "CONTENT_DARK", sectionTitle: "사용법" });
titleOn(s, "전체를 돌리기 전에 3프레임만", true);
card(s, { x: M, y: 1.75, w: 11.8, h: 1.55, fill: C.accent1, name: "three" });
s.addText("경로가 하나라도 틀리면 전체 프레임이 다 실패합니다", { x: M + 0.5, y: 1.75, w: 11.0, h: 1.55,
  fontSize: 27, bold: true, color: C.text1, valign: "middle", isTextBox: true });
[["1차", "Frame List = 1-3", "결과물 3장 확인"],
 ["2차", "Frame List = 전체", "확인되면 돌리기"]].forEach(([a, b, c], i) => {
  const y = 3.75 + i * 1.25;
  card(s, { x: M, y, w: 11.8, h: 1.0, fill: C.text2, name: `pass${i}` });
  s.addText(a, { x: M + 0.5, y, w: 1.3, h: 1.0, fontSize: 20, bold: true, color: C.accent1, valign: "middle", isTextBox: true });
  s.addText(b, { x: M + 1.9, y, w: 4.6, h: 1.0, fontSize: 18, color: C.background1,
    fontFace: "Courier New", valign: "middle", isTextBox: true });
  s.addText(c, { x: M + 6.7, y, w: 4.5, h: 1.0, fontSize: 15, color: C.accent6, valign: "middle", isTextBox: true });
});
s.addText("300프레임 날리고 나서 아는 것보다, 3장으로 1분 만에 확인하는 게 낫습니다",
  { x: M, y: 6.3, w: 11.8, h: 0.45, fontSize: 15, italic: true, color: C.accent5, isTextBox: true });

/* ── 4. 시연 ───────────────────────────────────────────── */
pres.addSection({ title: "시연" });

s = pres.addSlide({ masterName: "DIVIDER", sectionTitle: "시연" });
s.addText("4", { x: M, y: 2.35, w: 2.0, h: 1.5, fontSize: 84, bold: true, color: C.accent1, isTextBox: true, margin: 0 });
s.addText("시연", { x: 2.6, y: 2.6, w: 10.0, h: 1.15, fontSize: 40, bold: true, color: C.background1, isTextBox: true, valign: "middle" });
s.addText("실제로 한 번 돌려보겠습니다", { x: 2.6, y: 3.85, w: 10.0, h: 0.8, fontSize: 16, color: C.accent6, isTextBox: true });

s = content("시연", "프레임이 여러 PC에 나뉘어 돌아갑니다");
s.addImage({ path: im("15_tasks.png"), x: M, y: 1.5, w: 7.4, h: 5.55 * 0.75 });
card(s, { x: 8.5, y: 1.5, w: 4.05, h: 2.1, fill: C.accent6, name: "demo1" });
s.addText("Task 1 → M211-02\nTask 2 → M211-05\nTask 3 → M211-07", { x: 8.85, y: 1.75, w: 3.4, h: 1.6,
  fontSize: 15, color: C.text1, fontFace: "Courier New", isTextBox: true, lineSpacing: 24 });
s.addText("세 프레임이 각각 다른 PC에서 동시에 돌았습니다", { x: 8.5, y: 3.8, w: 4.05, h: 0.9,
  fontSize: 17, bold: true, color: C.text1, isTextBox: true });
s.addText("이게 렌더팜입니다", { x: 8.5, y: 4.8, w: 4.05, h: 0.6, fontSize: 22, bold: true, color: C.accent3, isTextBox: true });
s.addNotes("여기가 하이라이트입니다. 화면 확대해서 Worker 이름이 각각 다른 걸 보여주세요.");

s = content("시연", "Completed 를 그대로 믿지 마세요");
card(s, { x: M, y: 1.55, w: 11.8, h: 1.35, fill: C.accent6, name: "warn" });
s.addText("렌더가 중간에 멈춰도 Completed 로 표시될 때가 있습니다", { x: M + 0.5, y: 1.55, w: 11.0, h: 1.35,
  fontSize: 24, bold: true, color: C.text1, valign: "middle", isTextBox: true });
s.addText("끝났다고 뜨면 반드시 결과물 장수를 세어보세요", { x: M, y: 3.2, w: 11.8, h: 0.5,
  fontSize: 19, bold: true, color: C.text1, isTextBox: true });
[["10프레임 제출 → 결과물 10장", "OK", C.accent4],
 ["10프레임 제출 → 결과물 7장", "문제 있음", C.accent3]].forEach(([a, b, col], i) => {
  const y = 3.95 + i * 1.1;
  card(s, { x: M, y, w: 11.8, h: 0.9, name: `cnt${i}` });
  s.addText(a, { x: M + 0.5, y, w: 7.5, h: 0.9, fontSize: 17, color: C.text1, valign: "middle", isTextBox: true });
  s.addText(b, { x: 8.6, y, w: 3.4, h: 0.9, fontSize: 18, bold: true, color: col, align: "right", valign: "middle", isTextBox: true });
});
s.addText("Deadline 이 일부 오류를 \"알 수 없는 오류\"로 분류해 무시하기 때문입니다",
  { x: M, y: 6.15, w: 11.8, h: 0.45, fontSize: 14, color: C.accent5, isTextBox: true });

/* ── 5. 실수 & 마무리 ──────────────────────────────────── */
pres.addSection({ title: "자주 나는 실수" });

s = pres.addSlide({ masterName: "DIVIDER", sectionTitle: "자주 나는 실수" });
s.addText("5", { x: M, y: 2.35, w: 2.0, h: 1.5, fontSize: 84, bold: true, color: C.accent1, isTextBox: true, margin: 0 });
s.addText("자주 나는 실수", { x: 2.6, y: 2.6, w: 10.0, h: 1.15, fontSize: 40, bold: true, color: C.background1, isTextBox: true, valign: "middle" });
s.addText("이것만 피하셔도 대부분 성공합니다", { x: 2.6, y: 3.85, w: 10.0, h: 0.8, fontSize: 16, color: C.accent6, isTextBox: true });

s = content("자주 나는 실수", "일곱 가지만 피하세요");
[["씬 파일만 올림", "텍스처가 회색으로 나옴"],
 ["폴더 이름에 한글 · 띄어쓰기", "씬을 못 찾고 몇 초 만에 끝남"],
 ["블렌더 #### 빠짐", "100장 돌려도 1장만 남음"],
 ["Render Device 가 GPU", "일부 프레임만 조용히 실패"],
 ["Camera 를 안 고름", "persp 뷰로 렌더됨"],
 ["Pool 을 잘못 고름", "예약 안 한 PC를 써서 남의 작업과 겹침"],
 ["저장 안 함", "설정이 하나도 반영 안 됨"]].forEach(([a, b], i) => {
  const y = 1.5 + i * 0.73;
  card(s, { x: M, y, w: 11.8, h: 0.62, fill: i % 2 ? C.background1 : C.background2, name: `mis${i}` });
  s.addText(String(i + 1), { x: M + 0.3, y, w: 0.5, h: 0.62, fontSize: 15, bold: true,
    color: C.accent1, align: "center", valign: "middle", isTextBox: true, margin: 0 });
  s.addText(a, { x: M + 0.95, y, w: 5.0, h: 0.62, fontSize: 16, bold: true, color: C.text1, valign: "middle", isTextBox: true });
  s.addText(b, { x: M + 6.0, y, w: 5.4, h: 0.62, fontSize: 14, color: C.accent5, valign: "middle", isTextBox: true });
});

s = content("자주 나는 실수", "막히면 가이드부터 보세요");
card(s, { x: M, y: 1.6, w: 5.7, h: 2.7, fill: C.accent6, name: "guide" });
s.addText("노션 가이드", { x: M + 0.45, y: 1.85, w: 4.9, h: 0.5, fontSize: 21, bold: true, color: C.text1, isTextBox: true });
s.addText("07 · 자주 발생하는 에러", { x: M + 0.45, y: 2.4, w: 4.9, h: 0.45, fontSize: 16, color: C.text2, isTextBox: true });
s.addText("증상 11가지를 찾아서 펼치면\n원인과 해결 방법이 순서대로 나옵니다",
  { x: M + 0.45, y: 2.95, w: 4.9, h: 1.1, fontSize: 14, color: C.text2, isTextBox: true });
card(s, { x: 6.85, y: 1.6, w: 5.7, h: 2.7, name: "contact" });
s.addText("연락할 때 주실 것", { x: 7.3, y: 1.85, w: 4.9, h: 0.5, fontSize: 21, bold: true, color: C.text1, isTextBox: true });
s.addText([
  { text: "Job 이름 / 학번", options: { bullet: true, breakLine: true } },
  { text: "Task Report 로그 전체", options: { bullet: true, breakLine: true } },
  { text: "쓰신 프로그램과 버전", options: { bullet: true, breakLine: true } },
  { text: "NAS 작업 폴더 경로", options: { bullet: true } },
], { x: 7.3, y: 2.45, w: 4.9, h: 1.7, fontSize: 15, color: C.text2, isTextBox: true, paraSpaceAfter: 6 });
card(s, { x: M, y: 4.65, w: 11.8, h: 1.5, fill: C.text2, name: "logtip" });
s.addText("\"안 돼요\" 만으로는 뭘 봐야 할지 알 수 없습니다", { x: M + 0.5, y: 4.85, w: 11.0, h: 0.5,
  fontSize: 19, bold: true, color: C.accent1, isTextBox: true });
s.addText("로그를 통째로 복사해서 보내주시는 게 제일 빠릅니다", { x: M + 0.5, y: 5.4, w: 11.0, h: 0.5,
  fontSize: 15, color: C.background1, isTextBox: true });

s = content("자주 나는 실수", "지금 상태 — 솔직하게");
[["마야", "지금 바로 쓰실 수 있습니다", "전 구간 테스트 완료 · 실제 졸업작품 샷 렌더 성공", C.accent4],
 ["블렌더", "조금만 기다려주세요", "실습실 PC 버전 통일 중 · 파일 준비는 지금 해두세요", C.accent1],
 ["장비", "일부 복구 중", "현재 17대 가동 · 다 고쳐지면 더 빨라집니다", C.accent5]].forEach(([a, b, c, col], i) => {
  const y = 1.6 + i * 1.6;
  card(s, { x: M, y, w: 11.8, h: 1.35, name: `st${i}` });
  s.addShape(pres.shapes.OVAL, { x: M + 0.45, y: y + 0.52, w: 0.3, h: 0.3, fill: { color: col }, line: { color: col } });
  s.addText(a, { x: M + 1.0, y: y + 0.15, w: 2.3, h: 0.55, fontSize: 20, bold: true, color: C.text1, isTextBox: true });
  s.addText(b, { x: M + 3.3, y: y + 0.15, w: 8.0, h: 0.55, fontSize: 18, color: C.text2, isTextBox: true });
  s.addText(c, { x: M + 3.3, y: y + 0.72, w: 8.0, h: 0.5, fontSize: 14, color: C.accent5, isTextBox: true });
});
s.addText("블렌더 쓰시는 분들은 Pack Resources 와 경로 정리를 지금 해두세요 — 제일 오래 걸리는 단계입니다",
  { x: M, y: 6.3, w: 11.8, h: 0.5, fontSize: 15, italic: true, color: C.accent2, isTextBox: true });
s.addNotes("이 슬라이드를 빼지 마세요. 지금 말 안 하면 이번 주에 '된다면서요' 소리를 듣습니다.");

s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "자주 나는 실수" });
s.addText("정리", { x: M, y: 2.15, w: 11.8, h: 0.42, fontSize: 15, bold: true, color: C.accent1, charSpacing: 2, isTextBox: true });
s.addText("질문 받겠습니다", { x: M, y: 2.6, w: 11.8, h: 1.5, fontSize: 48, bold: true,
  color: C.background1, isTextBox: true, valign: "middle" });
s.addText("예약 · 타임블럭 — 졸업준비위원회    |    렌더 실패 · 장비 — 이상빈 (C393169)", { x: M, y: 4.25, w: 11.8, h: 1.0, fontSize: 17, color: C.accent6, isTextBox: true });
["예약하고", "파일을 NAS에 올리고", "3프레임 먼저 돌려보고", "되면 전체 돌리고", "받아가고 폴더 비우기"]
  .forEach((t, i) => {
    const x = M + i * 2.42;
    s.addText(String(i + 1), { x, y: 5.35, w: 2.1, h: 0.45, fontSize: 15, bold: true, color: C.accent1, isTextBox: true, margin: 0 });
    s.addText(t, { x, y: 5.75, w: 2.2, h: 0.8, fontSize: 14, color: C.background1, isTextBox: true, margin: 0 });
  });

(async () => {
  const out = "/home/claude/deck/M211_렌더팜_설명회.pptx";
  await pres.writeFile({ fileName: out });
  const { applyTheme } = require("/root/.claude/skills/synced/dd5ea405-686e-4d57-936f-584c29651d03_f3c869f2-1c2f-46bb-a8bc-43e13197775c/pptx/scripts/apply_theme.js");
  await applyTheme(out, THEME);
  console.log("built:", out);
})();
