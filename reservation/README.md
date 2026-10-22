# 예약 시스템

## 운영 중인 것

| | 링크 |
| --- | --- |
| **신청 폼** | https://docs.google.com/forms/d/e/1FAIpQLSfbWrXeXCUe12EwPCIoiAbDmlwUmZwM81xKunAflxbeJOMFSw/viewform |
| **예약 시트** | https://docs.google.com/spreadsheets/d/1tZ0nRIrGapK0XOyFLU7rCGR2lg47N2PYhEed6g6LB14/edit |

폼 응답이 시트의 `설문지 응답 시트1` 탭으로 들어오고, `명단` 탭이 그것을 읽는다. 구조는
[`docs/m211/operations-model.md`](../docs/m211/operations-model.md) 6절에 있다.

## 파일

| 파일 | 설명 |
| --- | --- |
| `build_sheet_2026.py` | **현재 시트를 생성한 스크립트.** 주차 탭 10개 + 명단 + 사용 규칙을 xlsx로 만든다 |
| `build_booking_sheet.py` | 이전 버전 (학번-first 이전 구조). 참고용 |
| `m211_booking.gs` · `reservation_system.gs` | Apps Script 초안. **쓰지 않는다** — 아래 참고 |
| `M211_렌더팜_신청_예약시트.xlsx` · `m211_booking_template.xlsx` | 이전 버전 산출물 |

## 시트를 다시 만들어야 할 때

```bash
python3 reservation/build_sheet_2026.py      # → 2026_렌더팜_예약시트.xlsx
```

구글 시트에서 `파일 → 가져오기 → 업로드 → 스프레드시트 바꾸기`. URL과 공유 설정이 유지된다.

**가져온 뒤 두 가지를 손으로 해야 한다.** 구글 시트가 엑셀의 일부 설정을 읽지 못한다.

1. **학번 드롭다운** — 주차 시트에서 `C10:I25` 와 `H2:I9` 에 데이터 확인(범위 `=명단!$A$2:$A$41`)을 걸고, `C2:I25` 를 복사해 나머지 주차 시트 `C2` 에 붙여넣는다.
2. **폼 연결 수식** — 명단 `A2` · `B2` · `C2` 에 응답 시트를 읽는 ARRAYFORMULA를 넣는다.

```
A2  =ARRAYFORMULA(IF('설문지 응답 시트1'!C2:C41="","",'설문지 응답 시트1'!C2:C41))
B2  =ARRAYFORMULA(IF('설문지 응답 시트1'!C2:C41="","",'설문지 응답 시트1'!E2:E41))
C2  =ARRAYFORMULA(IF('설문지 응답 시트1'!C2:C41="","",'설문지 응답 시트1'!F2:F41))
```

> 열 번호는 **폼 질문 순서에 묶여 있다.** 폼에서 질문 순서를 바꾸면 이 수식도 고쳐야 한다.

## Apps Script를 쓰지 않는 이유

자동화 초안(`*.gs`)을 만들었으나 채택하지 않았다. 권한 승인 단계에서 구글이 `차단된 앱` 으로
막는 경우가 있고(임베디드 브라우저·다중 로그인), 운영자가 매번 그 벽을 넘어야 하는 구조는
인계에 적합하지 않다. **수식만으로 같은 결과가 나오므로 수식 쪽을 택했다.**

ARRAYFORMULA 한 칸이 열 전체를 책임지므로, 아래 행을 실수로 지워도 수식이 사라지지 않는다.
칸마다 수식을 깔면 범위 삭제 한 번에 전부 날아간다 — 실제로 두 번 겪었다.
