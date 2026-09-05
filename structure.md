## POPUP

- 설정
- 방송일정

## SIDE PANEL

- 리스트 설정
- 도배 리스트

## CONTENT SCRIPTS

| 진입점        | 대상              | all_frames | run_at |
| ------------- | ----------------- | ---------- | ------ |
| `live`        | play.sooplive.com |            |        |
| `vod`         | vod.sooplive.com  |            |        |
| `content.css` | play.sooplive.com |            |        |

## STORAGE (chrome.storage.local)

| 키                  | 내용                                 |
| ------------------- | ------------------------------------ |
| `config`            | 설정값 (토글, 다운로드 경로, 예외어) |
| `mujisung:list`     | 원격에서 받아온 도배 카탈로그        |
| `mujisung:custom`   | 사용자가 추가한 도배                 |
| `mujisung:fromChat` | 채팅에서 자동 수집한 도배            |
| `block:users`       | 차단한 채팅 닉네임                   |
| `autoUp:custom`     | 자동 UP 대상 스트리머 ID             |
