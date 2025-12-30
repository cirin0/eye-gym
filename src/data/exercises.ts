export type ExerciseKind = 'dynamic' | 'static'

export interface EyeExercise {
  id: string
  kind: ExerciseKind
  name: string
  ttsCommand: string
  reps?: number
  seconds?: number
}

export const EXERCISES: EyeExercise[] = [
  {
    id: 'up-down-left-right-1',
    kind: 'dynamic',
    name: 'Вгору-вниз, вліво-вправо',
    ttsCommand:
      'Рухайте очима вгору вниз, а потім вліво вправо. По десять разів у кожному напрямку.',
    reps: 20,
  },
  {
    id: 'circle-both-directions-1',
    kind: 'dynamic',
    name: 'Коло в обидва боки',
    ttsCommand:
      'Рухайте очима по колу проти годинникової стрілки, а потім за годинниковою стрілкою. По десять разів у кожен бік.',
    reps: 20,
  },
  {
    id: 'repeat-with-closed-eyes',
    kind: 'static',
    name: 'Повтор з заплющеними очима',
    ttsCommand:
      'Закрийте очі й повторіть попередні вправи руху очима стільки ж разів. Робіть повільно й акуратно.',
    seconds: 60,
  },
  {
    id: 'palming-1',
    kind: 'static',
    name: 'Долоні на очі',
    ttsCommand:
      'Розітріть долоні до тепла й покладіть їх на закриті очі, не тиснучи. Розслабтеся на тридцять секунд. Наступні вправи робитимемо з закритими очима.',
    seconds: 35,
  },
  {
    id: 'up-down-3',
    kind: 'dynamic',
    name: 'Вгору-вниз, 3 рази',
    ttsCommand: 'Рухайте очима вгору-вниз три рази. Почали.',
    reps: 6,
  },
  {
    id: 'blink',
    kind: 'static',
    name: 'Моргання',
    ttsCommand: 'Поморгайте вільно протягом десяти секунд.',
    seconds: 5,
  },
  {
    id: 'left-right-3',
    kind: 'dynamic',
    name: 'Вліво-вправо, 3 рази',
    ttsCommand: 'Рухайте очима вліво-вправо три рази. Почали.',
    reps: 6,
  },
  {
    id: 'blink',
    kind: 'static',
    name: 'Моргання',
    ttsCommand: 'Поморгайте вільно протягом десяти секунд.',
    seconds: 5,
  },
  {
    id: 'diagonal-1-3',
    kind: 'dynamic',
    name: 'Діагональ, 3 рази',
    ttsCommand: 'Рухайте очима по діагоналі зліва вгору — вправо вниз і назад. Три рази.',
    reps: 6,
  },
  {
    id: 'blink',
    kind: 'static',
    name: 'Моргання',
    ttsCommand: 'Поморгайте вільно протягом десяти секунд.',
    seconds: 5,
  },
  {
    id: 'diagonal-2-3',
    kind: 'dynamic',
    name: 'Зворотна діагональ, 3 рази',
    ttsCommand: 'Рухайте очима по іншій діагоналі: справа вгору — вліво вниз і назад. Три рази.',
    reps: 6,
  },
  {
    id: 'blink',
    kind: 'static',
    name: 'Моргання',
    ttsCommand: 'Поморгайте вільно протягом десяти секунд.',
    seconds: 5,
  },
  {
    id: 'triangle-clockwise-3',
    kind: 'dynamic',
    name: 'Трикутник за годинниковою, 3 рази',
    ttsCommand:
      'Уявіть трикутник і переводьте погляд по його вершинах за годинниковою стрілкою. Три повних кола.',
    reps: 6,
  },
  {
    id: 'blink',
    kind: 'static',
    name: 'Моргання',
    ttsCommand: 'Поморгайте вільно протягом десяти секунд.',
    seconds: 5,
  },
  {
    id: 'triangle-counter-3',
    kind: 'dynamic',
    name: 'Трикутник проти годинникової, 3 рази',
    ttsCommand: 'Тепер той самий трикутник, але проти годинникової стрілки. Три повних кола.',
    reps: 6,
  },
  {
    id: 'blink',
    kind: 'static',
    name: 'Моргання',
    ttsCommand: 'Поморгайте вільно протягом десяти секунд.',
    seconds: 5,
  },
  {
    id: 'circle-clockwise-3',
    kind: 'dynamic',
    name: 'Коло за годинниковою, 3 рази',
    ttsCommand: 'Рухайте очима по колу за годинниковою стрілкою. Три повних кола.',
    reps: 6,
  },
  {
    id: 'blink',
    kind: 'static',
    name: 'Моргання',
    ttsCommand: 'Поморгайте вільно протягом десяти секунд.',
    seconds: 5,
  },
  {
    id: 'blink-open-3',
    kind: 'dynamic',
    name: 'Заплющити-відкрити, 3 рази',
    ttsCommand: 'Три рази: щільно заплющіть очі, потім широко відкрийте. Робіть повільно.',
    reps: 6,
  },
  {
    id: 'open-palms-2',
    kind: 'static',
    name: 'Розкрити долоні',
    ttsCommand: 'Розслабте руки, опустіть долоні й кілька секунд спокійно поморгайте.',
    seconds: 5,
  },
  {
    id: 'blink-30s',
    kind: 'static',
    name: 'Моргання 30 секунд',
    ttsCommand: 'Вільно, без напруження моргайте протягом тридцяти секунд.',
    seconds: 35,
  },
  {
    id: 'blink-30-reps',
    kind: 'dynamic',
    name: 'Зажмурити-відкрити, 30 разів',
    ttsCommand: 'Тридцять разів: щільно закрийте очі і відкрийте.',
    reps: 60,
  },
  {
    id: 'up-down-20',
    kind: 'dynamic',
    name: 'Вгору-вниз, 20 разів',
    ttsCommand: 'Рухайте очима вгору-вниз двадцять разів.',
    reps: 40,
  },
  {
    id: 'left-right-20',
    kind: 'dynamic',
    name: 'Вліво-вправо, 20 разів',
    ttsCommand: 'Рухайте очима вліво-вправо двадцять разів.',
    reps: 20,
  },
  {
    id: 'circle-both-directions-20',
    kind: 'dynamic',
    name: 'Коло в обидва боки, по 20',
    ttsCommand:
      'Рухайте очима по колу за годинниковою стрілкою та проти годинникової стрілки по двадцять разів у кожен бік.',
    reps: 40,
  },
  {
    id: 'pencil-focus',
    kind: 'static',
    name: 'Фокус на олівці',
    ttsCommand:
      'Візьміть олівець або палець, тримайте перед очима. Переводьте фокус з олівця на віддалену точку і назад протягом однієї хвилини.',
    seconds: 60,
  },
]
