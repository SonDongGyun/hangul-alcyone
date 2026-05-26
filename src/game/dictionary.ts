import type { WordEntry } from "./types";

const split = (w: string): string[] => Array.from(w);

const raw: Omit<WordEntry, "syllables">[] = [
  // 음식 (13)
  { word: "사과", categories: ["food"], frequency: 1, meaning: "빨갛고 동그란 가을 과일" },
  { word: "포도", categories: ["food"], frequency: 1, meaning: "송이로 자라는 보라색 과일" },
  { word: "수박", categories: ["food"], frequency: 2, meaning: "여름의 큰 초록 과일" },
  { word: "김치", categories: ["food"], frequency: 1, meaning: "한국의 발효된 채소 반찬" },
  { word: "두부", categories: ["food"], frequency: 2, meaning: "콩을 으깨 응고시킨 음식" },
  { word: "고기", categories: ["food"], frequency: 1, meaning: "동물의 살" },
  { word: "라면", categories: ["food"], frequency: 1, meaning: "끓여 먹는 면" },
  { word: "우유", categories: ["food"], frequency: 1, meaning: "젖" },
  { word: "김밥", categories: ["food"], frequency: 1, meaning: "김에 밥을 말아 만든 음식" },
  { word: "만두", categories: ["food"], frequency: 2, meaning: "속을 채워 빚은 음식" },
  { word: "떡국", categories: ["food"], frequency: 2, meaning: "떡을 넣고 끓인 국" },
  { word: "사과나무", categories: ["food", "nature"], frequency: 3, meaning: "사과가 열리는 나무" },
  { word: "김치찌개", categories: ["food"], frequency: 2, meaning: "김치로 끓인 찌개" },

  // 동물 (12)
  { word: "토끼", categories: ["animal"], frequency: 1, meaning: "긴 귀를 가진 작은 동물" },
  { word: "사슴", categories: ["animal"], frequency: 3, meaning: "뿔이 자라는 초식동물" },
  { word: "나비", categories: ["animal"], frequency: 1, meaning: "날개가 큰 곤충" },
  { word: "개미", categories: ["animal"], frequency: 1, meaning: "줄지어 다니는 작은 곤충" },
  { word: "호랑이", categories: ["animal"], frequency: 2, meaning: "줄무늬가 있는 큰 고양잇과 동물" },
  { word: "고양이", categories: ["animal"], frequency: 1, meaning: "집에서 기르는 고양잇과 동물" },
  { word: "강아지", categories: ["animal"], frequency: 1, meaning: "어린 개" },
  { word: "거북이", categories: ["animal"], frequency: 2, meaning: "단단한 등껍질이 있는 동물" },
  { word: "물고기", categories: ["animal", "nature"], frequency: 1, meaning: "물에서 사는 척추동물" },
  { word: "강물", categories: ["nature"], frequency: 2, meaning: "강에 흐르는 물" },
  { word: "병아리", categories: ["animal"], frequency: 2, meaning: "어린 닭" },
  { word: "송아지", categories: ["animal"], frequency: 2, meaning: "어린 소" },

  // 자연 (13)
  { word: "나무", categories: ["nature"], frequency: 1, meaning: "줄기와 잎이 있는 식물" },
  { word: "바다", categories: ["nature"], frequency: 1, meaning: "넓고 짠 물의 영역" },
  { word: "하늘", categories: ["nature"], frequency: 1, meaning: "위에 펼쳐진 공간" },
  { word: "구름", categories: ["nature"], frequency: 1, meaning: "하늘에 떠 있는 물방울 덩어리" },
  { word: "단풍", categories: ["nature"], frequency: 2, meaning: "가을에 잎이 붉어지는 것" },
  { word: "바람", categories: ["nature"], frequency: 1, meaning: "흐르는 공기" },
  { word: "햇빛", categories: ["nature"], frequency: 2, meaning: "해에서 오는 빛" },
  { word: "별빛", categories: ["nature"], frequency: 3, meaning: "별에서 오는 빛" },
  { word: "달빛", categories: ["nature"], frequency: 3, meaning: "달에서 오는 빛" },
  { word: "바닷가", categories: ["nature"], frequency: 2, meaning: "바다와 닿은 땅" },
  { word: "단풍나무", categories: ["nature"], frequency: 3, meaning: "단풍이 드는 나무" },
  { word: "나뭇잎", categories: ["nature"], frequency: 2, meaning: "나무에 달린 잎" },
  { word: "하늘색", categories: ["nature", "daily"], frequency: 3, meaning: "맑은 하늘의 색" },

  // 일상 (12)
  { word: "시계", categories: ["daily"], frequency: 1, meaning: "시간을 표시하는 기계" },
  { word: "의자", categories: ["daily"], frequency: 1, meaning: "앉기 위한 가구" },
  { word: "신발", categories: ["daily"], frequency: 1, meaning: "발에 신는 물건" },
  { word: "가방", categories: ["daily"], frequency: 1, meaning: "물건을 담아 메는 것" },
  { word: "거울", categories: ["daily"], frequency: 1, meaning: "비추어 보는 도구" },
  { word: "창문", categories: ["daily"], frequency: 1, meaning: "벽에 낸 빛이 드는 구멍" },
  { word: "책상", categories: ["daily"], frequency: 1, meaning: "책을 놓고 쓰는 상" },
  { word: "연필", categories: ["daily"], frequency: 1, meaning: "글씨를 쓰는 필기구" },
  { word: "지우개", categories: ["daily"], frequency: 2, meaning: "글씨를 지우는 도구" },
  { word: "우산", categories: ["daily"], frequency: 1, meaning: "비를 가리는 도구" },
  { word: "장갑", categories: ["daily"], frequency: 2, meaning: "손에 끼는 옷" },
  { word: "책가방", categories: ["daily"], frequency: 2, meaning: "책을 담는 가방" },
];

export const dictionary: WordEntry[] = raw.map((w) => ({
  ...w,
  syllables: split(w.word),
}));

export const wordIndex: Map<string, WordEntry> = new Map(
  dictionary.map((w) => [w.word, w]),
);

export const wordSet: Set<string> = new Set(dictionary.map((w) => w.word));

export const maxWordSyllables: number = dictionary.reduce(
  (m, w) => Math.max(m, w.syllables.length),
  0,
);
