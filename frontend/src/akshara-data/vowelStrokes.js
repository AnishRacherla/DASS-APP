// vowelStrokes.js — SVG stroke definitions for Hindi vowels (swaras)
// Each vowel has ordered strokes with SVG path data, start points, and direction hints.
// ViewBox: 250 x 300 for all vowels. Shirorekha (headline) sits at y≈70.

const vowelStrokes = [
  // ─── अ (a) ───────────────────────────────────────────
  {
    id: 'a',
    letter: 'अ',
    viewBox: '0 0 250 300',
    strokes: [
      {
        id: 1,
        label: 'Vertical line',
        path: 'M 145,70 L 145,260',
        direction: '↓',
        startPoint: { x: 145, y: 70 },
      },
      {
        id: 2,
        label: 'Belly curve',
        path: 'M 145,130 C 105,130 75,160 75,195 C 75,230 105,255 145,255',
        direction: '↙',
        startPoint: { x: 145, y: 130 },
      },
      {
        id: 3,
        label: 'Shirorekha',
        path: 'M 60,70 L 200,70',
        direction: '→',
        startPoint: { x: 60, y: 70 },
      },
    ],
  },

  // ─── आ (aa) ──────────────────────────────────────────
  {
    id: 'aa',
    letter: 'आ',
    viewBox: '0 0 250 300',
    strokes: [
      {
        id: 1,
        label: 'Left vertical',
        path: 'M 110,70 L 110,260',
        direction: '↓',
        startPoint: { x: 110, y: 70 },
      },
      {
        id: 2,
        label: 'Belly curve',
        path: 'M 110,130 C 70,130 45,165 45,195 C 45,230 75,255 110,255',
        direction: '↙',
        startPoint: { x: 110, y: 130 },
      },
      {
        id: 3,
        label: 'Right vertical with hook',
        path: 'M 175,70 L 175,230 C 175,255 195,260 205,245',
        direction: '↓',
        startPoint: { x: 175, y: 70 },
      },
      {
        id: 4,
        label: 'Shirorekha',
        path: 'M 40,70 L 210,70',
        direction: '→',
        startPoint: { x: 40, y: 70 },
      },
    ],
  },

  // ─── इ (i) ───────────────────────────────────────────
  {
    id: 'i',
    letter: 'इ',
    viewBox: '0 0 250 300',
    strokes: [
      {
        id: 1,
        label: 'Upper curve',
        path: 'M 135,70 L 135,140 C 135,175 100,190 75,175',
        direction: '↓',
        startPoint: { x: 135, y: 70 },
      },
      {
        id: 2,
        label: 'Lower curve',
        path: 'M 135,175 C 135,210 170,240 190,225 C 210,210 195,175 170,175',
        direction: '↘',
        startPoint: { x: 135, y: 175 },
      },
      {
        id: 3,
        label: 'Shirorekha',
        path: 'M 70,70 L 200,70',
        direction: '→',
        startPoint: { x: 70, y: 70 },
      },
    ],
  },

  // ─── ई (ii) ──────────────────────────────────────────
  {
    id: 'ii',
    letter: 'ई',
    viewBox: '0 0 250 300',
    strokes: [
      {
        id: 1,
        label: 'Vertical spine',
        path: 'M 130,70 L 130,200',
        direction: '↓',
        startPoint: { x: 130, y: 70 },
      },
      {
        id: 2,
        label: 'Upper hook',
        path: 'M 130,130 C 95,130 75,155 90,175 C 105,195 130,185 130,170',
        direction: '←',
        startPoint: { x: 130, y: 130 },
      },
      {
        id: 3,
        label: 'Lower tail',
        path: 'M 130,200 C 130,240 160,265 180,250 C 200,235 185,205 160,210',
        direction: '↘',
        startPoint: { x: 130, y: 200 },
      },
      {
        id: 4,
        label: 'Shirorekha',
        path: 'M 65,70 L 195,70',
        direction: '→',
        startPoint: { x: 65, y: 70 },
      },
    ],
  },

  // ─── उ (u) ───────────────────────────────────────────
  {
    id: 'u',
    letter: 'उ',
    viewBox: '0 0 250 300',
    strokes: [
      {
        id: 1,
        label: 'Main body',
        path: 'M 90,90 C 90,90 70,150 90,190 C 110,230 160,230 170,190',
        direction: '↓',
        startPoint: { x: 90, y: 90 },
      },
      {
        id: 2,
        label: 'Tail curve',
        path: 'M 170,190 C 170,160 140,140 125,155 C 110,170 125,195 150,190',
        direction: '↗',
        startPoint: { x: 170, y: 190 },
      },
    ],
  },

  // ─── ऊ (uu) ──────────────────────────────────────────
  {
    id: 'uu',
    letter: 'ऊ',
    viewBox: '0 0 250 300',
    strokes: [
      {
        id: 1,
        label: 'Main body',
        path: 'M 80,90 C 80,90 60,150 80,190 C 100,230 150,230 160,190',
        direction: '↓',
        startPoint: { x: 80, y: 90 },
      },
      {
        id: 2,
        label: 'Inner loop',
        path: 'M 160,190 C 160,160 130,140 115,155 C 100,170 115,195 140,190',
        direction: '↗',
        startPoint: { x: 160, y: 190 },
      },
      {
        id: 3,
        label: 'Extended tail',
        path: 'M 140,190 C 165,195 185,225 175,250 C 165,270 140,265 140,245',
        direction: '↘',
        startPoint: { x: 140, y: 190 },
      },
    ],
  },

  // ─── ऋ (ri) ──────────────────────────────────────────
  {
    id: 'ri',
    letter: 'ऋ',
    viewBox: '0 0 250 300',
    strokes: [
      {
        id: 1,
        label: 'Left curve',
        path: 'M 70,100 C 50,140 50,200 80,230 C 100,250 130,240 130,210',
        direction: '↓',
        startPoint: { x: 70, y: 100 },
      },
      {
        id: 2,
        label: 'Right curve',
        path: 'M 160,100 C 180,140 180,200 160,230 C 140,250 130,230 130,210',
        direction: '↓',
        startPoint: { x: 160, y: 100 },
      },
      {
        id: 3,
        label: 'Bottom tail',
        path: 'M 130,210 C 130,240 150,265 170,255 C 190,245 180,220 160,220',
        direction: '↘',
        startPoint: { x: 130, y: 210 },
      },
    ],
  },

  // ─── ए (e) ───────────────────────────────────────────
  {
    id: 'e',
    letter: 'ए',
    viewBox: '0 0 250 300',
    strokes: [
      {
        id: 1,
        label: 'Main curve',
        path: 'M 160,80 C 100,80 55,130 55,180 C 55,235 100,270 155,270 C 190,270 200,245 185,225',
        direction: '↙',
        startPoint: { x: 160, y: 80 },
      },
      {
        id: 2,
        label: 'Inner hook',
        path: 'M 155,80 C 155,120 130,155 105,160 C 80,165 70,145 85,130',
        direction: '↓',
        startPoint: { x: 155, y: 80 },
      },
    ],
  },

  // ─── ऐ (ai) ──────────────────────────────────────────
  {
    id: 'ai',
    letter: 'ऐ',
    viewBox: '0 0 250 300',
    strokes: [
      {
        id: 1,
        label: 'Main curve',
        path: 'M 155,90 C 95,90 55,140 55,190 C 55,245 100,275 150,275 C 185,275 195,255 180,235',
        direction: '↙',
        startPoint: { x: 155, y: 90 },
      },
      {
        id: 2,
        label: 'Inner hook',
        path: 'M 150,90 C 150,130 125,160 100,165 C 75,170 65,150 80,135',
        direction: '↓',
        startPoint: { x: 150, y: 90 },
      },
      {
        id: 3,
        label: 'Top triangle',
        path: 'M 130,90 C 130,60 155,40 170,55 C 185,70 170,90 150,90',
        direction: '↑',
        startPoint: { x: 130, y: 90 },
      },
    ],
  },

  // ─── ओ (o) ───────────────────────────────────────────
  {
    id: 'o',
    letter: 'ओ',
    viewBox: '0 0 250 300',
    strokes: [
      {
        id: 1,
        label: 'Main curve',
        path: 'M 130,80 C 70,80 30,130 30,180 C 30,235 70,270 125,270 C 160,270 170,250 155,230',
        direction: '↙',
        startPoint: { x: 130, y: 80 },
      },
      {
        id: 2,
        label: 'Inner hook',
        path: 'M 125,80 C 125,120 100,150 80,155 C 60,160 50,140 65,125',
        direction: '↓',
        startPoint: { x: 125, y: 80 },
      },
      {
        id: 3,
        label: 'Right vertical with hook',
        path: 'M 195,50 L 195,230 C 195,255 215,260 225,245',
        direction: '↓',
        startPoint: { x: 195, y: 50 },
      },
    ],
  },

  // ─── औ (au) ──────────────────────────────────────────
  {
    id: 'au',
    letter: 'औ',
    viewBox: '0 0 250 300',
    strokes: [
      {
        id: 1,
        label: 'Main curve',
        path: 'M 120,90 C 65,90 30,135 30,185 C 30,240 65,270 115,270 C 145,270 155,250 140,235',
        direction: '↙',
        startPoint: { x: 120, y: 90 },
      },
      {
        id: 2,
        label: 'Inner hook',
        path: 'M 115,90 C 115,125 95,150 75,155 C 55,160 45,140 60,125',
        direction: '↓',
        startPoint: { x: 115, y: 90 },
      },
      {
        id: 3,
        label: 'Top triangle',
        path: 'M 100,90 C 100,60 125,40 140,55 C 155,70 140,90 120,90',
        direction: '↑',
        startPoint: { x: 100, y: 90 },
      },
      {
        id: 4,
        label: 'Right vertical with hook',
        path: 'M 190,50 L 190,230 C 190,255 210,260 220,245',
        direction: '↓',
        startPoint: { x: 190, y: 50 },
      },
    ],
  },

  // ─── अं (am) ─────────────────────────────────────────
  {
    id: 'am',
    letter: 'अं',
    viewBox: '0 0 250 300',
    strokes: [
      {
        id: 1,
        label: 'Vertical line',
        path: 'M 145,70 L 145,260',
        direction: '↓',
        startPoint: { x: 145, y: 70 },
      },
      {
        id: 2,
        label: 'Belly curve',
        path: 'M 145,130 C 105,130 75,160 75,195 C 75,230 105,255 145,255',
        direction: '↙',
        startPoint: { x: 145, y: 130 },
      },
      {
        id: 3,
        label: 'Shirorekha',
        path: 'M 60,70 L 200,70',
        direction: '→',
        startPoint: { x: 60, y: 70 },
      },
      {
        id: 4,
        label: 'Bindu (dot)',
        path: 'M 125,45 C 130,40 140,40 145,45 C 150,50 145,58 140,58 C 135,58 125,52 125,45',
        direction: '●',
        startPoint: { x: 125, y: 45 },
      },
    ],
  },

  // ─── अः (ah) ─────────────────────────────────────────
  {
    id: 'ah',
    letter: 'अः',
    viewBox: '0 0 250 300',
    strokes: [
      {
        id: 1,
        label: 'Vertical line',
        path: 'M 125,70 L 125,260',
        direction: '↓',
        startPoint: { x: 125, y: 70 },
      },
      {
        id: 2,
        label: 'Belly curve',
        path: 'M 125,130 C 85,130 55,160 55,195 C 55,230 85,255 125,255',
        direction: '↙',
        startPoint: { x: 125, y: 130 },
      },
      {
        id: 3,
        label: 'Shirorekha',
        path: 'M 40,70 L 185,70',
        direction: '→',
        startPoint: { x: 40, y: 70 },
      },
      {
        id: 4,
        label: 'Upper visarga dot',
        path: 'M 210,130 C 215,125 225,125 230,130 C 235,135 230,143 225,143 C 220,143 210,137 210,130',
        direction: '●',
        startPoint: { x: 210, y: 130 },
      },
      {
        id: 5,
        label: 'Lower visarga dot',
        path: 'M 210,180 C 215,175 225,175 230,180 C 235,185 230,193 225,193 C 220,193 210,187 210,180',
        direction: '●',
        startPoint: { x: 210, y: 180 },
      },
    ],
  },
];

export default vowelStrokes;
