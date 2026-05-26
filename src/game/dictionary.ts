import type { WordEntry } from "./types";

const split = (w: string): string[] => Array.from(w);

const raw: Omit<WordEntry, "syllables">[] = [
  // 음식 (13)
  { word: "사과", categories: ["food"], frequency: 1, meaning: "빨갛고 동그란 가을 과일", meaningEn: "Apple" },
  { word: "포도", categories: ["food"], frequency: 1, meaning: "송이로 자라는 보라색 과일", meaningEn: "Grapes" },
  { word: "수박", categories: ["food"], frequency: 2, meaning: "여름의 큰 초록 과일", meaningEn: "Watermelon" },
  { word: "김치", categories: ["food"], frequency: 1, meaning: "한국의 발효된 채소 반찬", meaningEn: "Kimchi — fermented vegetables" },
  { word: "두부", categories: ["food"], frequency: 2, meaning: "콩을 으깨 응고시킨 음식", meaningEn: "Tofu — soybean curd" },
  { word: "고기", categories: ["food"], frequency: 1, meaning: "동물의 살", meaningEn: "Meat" },
  { word: "라면", categories: ["food"], frequency: 1, meaning: "끓여 먹는 면", meaningEn: "Ramen noodles" },
  { word: "우유", categories: ["food"], frequency: 1, meaning: "젖", meaningEn: "Milk" },
  { word: "김밥", categories: ["food"], frequency: 1, meaning: "김에 밥을 말아 만든 음식", meaningEn: "Gimbap — rice rolled in seaweed" },
  { word: "만두", categories: ["food"], frequency: 2, meaning: "속을 채워 빚은 음식", meaningEn: "Dumpling" },
  { word: "떡국", categories: ["food"], frequency: 2, meaning: "떡을 넣고 끓인 국", meaningEn: "Rice cake soup" },
  { word: "사과나무", categories: ["food", "nature"], frequency: 3, meaning: "사과가 열리는 나무", meaningEn: "Apple tree" },
  { word: "김치찌개", categories: ["food"], frequency: 2, meaning: "김치로 끓인 찌개", meaningEn: "Kimchi stew" },

  // 동물 (12)
  { word: "토끼", categories: ["animal"], frequency: 1, meaning: "긴 귀를 가진 작은 동물", meaningEn: "Rabbit" },
  { word: "사슴", categories: ["animal"], frequency: 3, meaning: "뿔이 자라는 초식동물", meaningEn: "Deer" },
  { word: "나비", categories: ["animal"], frequency: 1, meaning: "날개가 큰 곤충", meaningEn: "Butterfly" },
  { word: "개미", categories: ["animal"], frequency: 1, meaning: "줄지어 다니는 작은 곤충", meaningEn: "Ant" },
  { word: "호랑이", categories: ["animal"], frequency: 2, meaning: "줄무늬가 있는 큰 고양잇과 동물", meaningEn: "Tiger" },
  { word: "고양이", categories: ["animal"], frequency: 1, meaning: "집에서 기르는 고양잇과 동물", meaningEn: "Cat" },
  { word: "강아지", categories: ["animal"], frequency: 1, meaning: "어린 개", meaningEn: "Puppy" },
  { word: "거북이", categories: ["animal"], frequency: 2, meaning: "단단한 등껍질이 있는 동물", meaningEn: "Turtle" },
  { word: "물고기", categories: ["animal", "nature"], frequency: 1, meaning: "물에서 사는 척추동물", meaningEn: "Fish" },
  { word: "강물", categories: ["nature"], frequency: 2, meaning: "강에 흐르는 물", meaningEn: "River water" },
  { word: "병아리", categories: ["animal"], frequency: 2, meaning: "어린 닭", meaningEn: "Chick — baby chicken" },
  { word: "송아지", categories: ["animal"], frequency: 2, meaning: "어린 소", meaningEn: "Calf — baby cow" },

  // 자연 (13)
  { word: "나무", categories: ["nature"], frequency: 1, meaning: "줄기와 잎이 있는 식물", meaningEn: "Tree" },
  { word: "바다", categories: ["nature"], frequency: 1, meaning: "넓고 짠 물의 영역", meaningEn: "Sea" },
  { word: "하늘", categories: ["nature"], frequency: 1, meaning: "위에 펼쳐진 공간", meaningEn: "Sky" },
  { word: "구름", categories: ["nature"], frequency: 1, meaning: "하늘에 떠 있는 물방울 덩어리", meaningEn: "Cloud" },
  { word: "단풍", categories: ["nature"], frequency: 2, meaning: "가을에 잎이 붉어지는 것", meaningEn: "Autumn foliage" },
  { word: "바람", categories: ["nature"], frequency: 1, meaning: "흐르는 공기", meaningEn: "Wind" },
  { word: "햇빛", categories: ["nature"], frequency: 2, meaning: "해에서 오는 빛", meaningEn: "Sunlight" },
  { word: "별빛", categories: ["nature"], frequency: 3, meaning: "별에서 오는 빛", meaningEn: "Starlight" },
  { word: "달빛", categories: ["nature"], frequency: 3, meaning: "달에서 오는 빛", meaningEn: "Moonlight" },
  { word: "바닷가", categories: ["nature"], frequency: 2, meaning: "바다와 닿은 땅", meaningEn: "Seashore" },
  { word: "단풍나무", categories: ["nature"], frequency: 3, meaning: "단풍이 드는 나무", meaningEn: "Maple tree" },
  { word: "나뭇잎", categories: ["nature"], frequency: 2, meaning: "나무에 달린 잎", meaningEn: "Leaf" },
  { word: "하늘색", categories: ["nature", "daily"], frequency: 3, meaning: "맑은 하늘의 색", meaningEn: "Sky blue" },

  // 일상 (12)
  { word: "시계", categories: ["daily"], frequency: 1, meaning: "시간을 표시하는 기계", meaningEn: "Clock" },
  { word: "의자", categories: ["daily"], frequency: 1, meaning: "앉기 위한 가구", meaningEn: "Chair" },
  { word: "신발", categories: ["daily"], frequency: 1, meaning: "발에 신는 물건", meaningEn: "Shoes" },
  { word: "가방", categories: ["daily"], frequency: 1, meaning: "물건을 담아 메는 것", meaningEn: "Bag" },
  { word: "거울", categories: ["daily"], frequency: 1, meaning: "비추어 보는 도구", meaningEn: "Mirror" },
  { word: "창문", categories: ["daily"], frequency: 1, meaning: "벽에 낸 빛이 드는 구멍", meaningEn: "Window" },
  { word: "책상", categories: ["daily"], frequency: 1, meaning: "책을 놓고 쓰는 상", meaningEn: "Desk" },
  { word: "연필", categories: ["daily"], frequency: 1, meaning: "글씨를 쓰는 필기구", meaningEn: "Pencil" },
  { word: "지우개", categories: ["daily"], frequency: 2, meaning: "글씨를 지우는 도구", meaningEn: "Eraser" },
  { word: "우산", categories: ["daily"], frequency: 1, meaning: "비를 가리는 도구", meaningEn: "Umbrella" },
  { word: "장갑", categories: ["daily"], frequency: 2, meaning: "손에 끼는 옷", meaningEn: "Gloves" },
  { word: "책가방", categories: ["daily"], frequency: 2, meaning: "책을 담는 가방", meaningEn: "School bag" },
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
