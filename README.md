# 한글 알키오네 (Hangul Alcyone)

한국어의 형태 결합을 화학 반응처럼 다루는 2D 퍼즐 게임. 본 레포는 Vercel 배포용 웹 프로토타입.

## 본질

> 내가 매일 쓰는 한국어를, 처음 보는 사람처럼 분해·결합하며 다시 발견하는 게임.

## 현재 상태 (MVP D1~D3 equivalent)

- 6×8 음절 보드, 인접 두 음절 클릭 후 또 다른 인접 음절 클릭으로 스왑
- 가로/세로 인접 매칭, 합성어(예: `사과나무`) 우선 매칭
- 발견한 단어 사이드 패널 + 카테고리·뜻 표시
- 50개 시드 단어 (음식·동물·자연·일상)

## 아직 없음 (D4+ 로드맵)

- 단어 제거 → 낙하 → 콤보 체인
- 점수 가중치·콤보 배율
- 스테이지 진행·튜토리얼·결과 화면
- 사운드·햅틱
- 음운 변화·자모 분해

## 기술 스택

```
Next.js 16 (App Router, Turbopack)
React 19
Tailwind CSS v4
TypeScript
next/font/google: Noto_Sans_KR, Nanum_Myeongjo
```

원래 브리프는 Flutter + Flame (모바일). Vercel 배포 1순위로 Next.js 웹으로 선회.
모바일은 추후 PWA 또는 Flutter 재진입 시점에 결정.

## 디렉터리

```
src/
├── app/                  # App Router (layout, page, globals.css)
├── game/                 # 게임 로직
│   ├── types.ts          # WordEntry, Stage, Match, CategoryId
│   ├── dictionary.ts     # 50 시드 단어 + 인덱스
│   ├── match.ts          # 가로/세로 longest-first 매칭 검출
│   └── stage.ts          # 스테이지 1 초기 배치
└── components/
    └── GameBoard.tsx     # 클라이언트 컴포넌트 (DOM 그리드)
```

## 개발

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## 배포

GitHub에 push되어 있고 Vercel과 연결되면 자동 배포. 별도 설정 파일 불필요.

## 디자인 원칙

브리프의 톤(베이지 베이스, 따뜻한 황색 포인트, 차분함)을 CSS 변수로 노출.
`src/app/globals.css`의 `--background`, `--match-glow`, `--accent` 등 참고.
