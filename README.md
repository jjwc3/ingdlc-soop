# INGDLC for SOOP

SOOP(숲) 라이브·VOD 페이지에 부가 기능을 더하는 Chrome 확장이다.

## 기능

### LIVE (`play.sooplive.com`)

- **도배 도우미** — 사이드 패널에서 도배 문구를 검색·복사 (`Alt+M`)
- **화면 캡쳐** — 재생 중인 화질 그대로 PNG 저장 (`Alt+C`)
- **음량 평준화** — `DynamicsCompressorNode`로 볼륨 편차 완화 (`Alt+A`)
- **채팅 필터링** — 닉네임 차단, 등급별(팬·구독자) 숨기기
- **채팅에서 도배 수집** — 반복 + 이모지 패턴을 자동으로 목록에 추가
- **자동 UP** — 지정한 스트리머 방송에서 자정 이후 UP 클릭
- 타임라인 클릭 시 복사, 방송 시작 시 새로고침, 광고 자동 스킵, 복붙 금지 해제

### VOD / catch (`vod.sooplive.com`)

- **클립 다운로드** — m3u8을 세그먼트 단위로 받아 mp4로 저장 (`Alt+D`)
- 화면 캡쳐, 음량 평준화

### POPUP

- 기능별 ON / 단축키 / 단축키+버튼 설정
- 방송 일정 (Google Sheets)

## 개발

패키지 매니저는 [bun](https://bun.sh)을 쓴다.

```bash
bun install
bun run dev      # vite dev (chrome://extensions에서 dist 로드)
bun run build    # 빌드 + zip
bun run lint
bun run format
```

## 구조

```
src/
├── background.ts       서비스 워커 (사이드패널, 다운로드, m3u8 감지, 저장소 마이그레이션)
├── components/         팝업·사이드패널용 Svelte 컴포넌트
├── modules/            설정 타입·기본값·저장소
├── lib/                요소 대기, m3u8 파싱·다운로드
├── content/            콘텐츠 스크립트 (진입점별 디렉터리)
├── popup/              설정 UI
└── sidepanel/          도배 도우미 UI
```

자세한 진입점·저장소 목록은 [structure.md](./structure.md) 참고.

## 고지

스트리머·저작권자의 동의 없이 녹화된 영상 및 캡쳐 이미지를 공유하는 경우,
그 책임은 전적으로 사용자에게 있다.
