# NAS 안내문

NAS 공유폴더 최상단 `00_READ_ME_FIRST/` 에 올라가는 텍스트 안내문은
[`nas-template/00_READ_ME_FIRST/`](../../nas-template/00_READ_ME_FIRST/) 에 있다.

```
\\223.194.101.83\2026_renderfarm\00_READ_ME_FIRST\
  ├ 00_학생공지문.txt
  ├ 01_렌더팜_사용안내.txt
  ├ 02_폴더구조_규칙.txt
  ├ 03_자주발생하는문제.txt
  └ 04_렌더팜_사용법.pdf     ← docs/pdf/M211_학생사용법_4p.pdf 를 이 이름으로 올림
```

## 편집 규칙

- **UTF-8 BOM + CRLF** 로 저장한다. 윈도 메모장에서 깨지지 않게 하기 위함이다.
- 마크다운이 아니라 **고정폭 텍스트**다. 메모장에서 그대로 읽히는 모양을 유지한다.
- 내용이 바뀌면 노션을 먼저 고치고 여기를 맞춘다. 노션이 상위 문서다.

```python
body = body.replace("\n", "\r\n")
io.open(name, "w", encoding="utf-8-sig", newline="").write(body)
```

## 올리는 법

파일 네 개를 NAS `00_READ_ME_FIRST\` 에 덮어쓴다. 학생 쪽에서 캐시되지 않으므로
올리는 즉시 반영된다.
