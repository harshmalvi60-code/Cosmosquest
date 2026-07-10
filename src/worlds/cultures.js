import { attachMarker, updateMarkers, ringPosition } from './helpers.js';
import { idle, collectIdle, runIdle } from './anim.js';

/**
 * World 12 — World Cultures. A slowly turning low-poly globe sits at the centre
 * with eight culture subjects arranged around it, present-day and celebratory.
 * Several subjects are ideas rather than objects, so each gets a clear symbol:
 * Languages → speech bubbles, Greetings → two figures, Festivals → a confetti
 * burst, Music → notes + a drum, Currencies → coins. Chosen so a young player
 * instantly "reads" the concept.
 */

const M = (THREE, c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0.06, flatShading: true, ...o });

const SUBJECTS = {
  flags: {
    name: 'Flags', type: 'Culture · Country Symbols', emoji: '🚩', badge: 'Flag Spotter', build: 'flags',
    mission: '🚩 Every country has its own flag, full of colours and meaning. Ready to explore the world\'s flags?',
    stats: [['~195', 'Countries'], ['Colours', 'Have meanings'], ['Symbols', 'Tell a story'], ['Pride', 'Flags show it']],
    facts: ['🚩 Nearly every country has its own flag as a special symbol.', '🎨 The colours and patterns often have meanings, like peace, land, or bravery.', '🌍 There are about 195 countries — and so about 195 national flags.', '🏅 People wave flags at events like the Olympics to cheer for their country.'],
    fun: 'Only two countries have flags that aren\'t rectangles — Nepal\'s flag is two stacked triangles!',
    quiz: [
      ['What is a flag a symbol of?', ['A country', 'A food', 'A song', 'A game'], 0],
      { t: 'tf', q: 'Flag colours often have special meanings.', answer: true },
      { t: 'pic', q: 'What shape is most national flags?', options: [
        { shape: 'square', color: '#4BA6E8', label: 'Rectangle' }, { shape: 'circle', color: '#4BA6E8', label: 'Circle' }, { shape: 'star', color: '#4BA6E8', label: 'Star' }], answer: 0 },
    ],
    quizHard: [
      ['Flag colours can stand for ideas like peace or bravery. What does that make a flag?', ['A picture full of meaning', 'Just decoration', 'A random pattern', 'A type of food'], 0],
      { t: 'tf', q: 'Because there are about 195 countries, there are about 195 national flags.', answer: true },
      ['People wave their flag at the Olympics. What feeling are they showing?', ['Pride in their country', 'Hunger', 'Sleepiness', 'Fear'], 0],
    ],
  },
  languages: {
    name: 'Languages', type: 'Culture · Ways to Talk', emoji: '🗣️', badge: 'World Talker', build: 'languages',
    mission: '🗣️ There are about 7,000 languages spoken on Earth! Ready to say hello around the world?',
    stats: [['~7,000', 'Languages'], ['Speak & write', 'Two forms'], ['Mandarin', 'Most speakers'], ['Share roots', 'Some are related']],
    facts: ['🗣️ People around the world speak about 7,000 different languages.', '✍️ A language is a shared set of sounds and words, plus symbols for writing.', '🇨🇳 The language with the most speakers is Mandarin Chinese.', '👨‍👩‍👧 Many languages are cousins that share old roots, like Spanish and Italian.'],
    fun: 'Some languages are whistled! In a few places, people "talk" across valleys using whistling languages.',
    quiz: [
      ['About how many languages are spoken on Earth?', ['About 7,000', 'About 7', 'About 70', 'Just one'], 0],
      { t: 'tf', q: 'Some languages are related, like cousins that share old roots.', answer: true },
      { t: 'pic', q: 'Which shape shows someone speaking?', options: [
        { shape: 'oval', color: '#5BC0DE', label: 'Speech bubble' }, { shape: 'square', color: '#5BC0DE', label: 'Box' }, { shape: 'triangle', color: '#5BC0DE', label: 'Cone' }], answer: 0 },
    ],
    quizHard: [
      ['Spanish and Italian share old roots. What does that make them?', ['Related, cousin languages', 'Exactly the same', 'Not languages', 'Made-up'], 0],
      { t: 'tf', q: 'A language has both a spoken form and a written form.', answer: true },
      ['Mandarin has the most speakers of any language. What does that likely tell you?', ['Many people live where it\'s spoken', 'It is the loudest', 'It is the oldest', 'It has no writing'], 0],
    ],
  },
  festivals: {
    name: 'Festivals', type: 'Culture · Celebrations', emoji: '🎉', badge: 'Party Pro', build: 'festivals',
    mission: '🎉 From lantern festivals to carnivals, the world loves to celebrate! Ready to join the party?',
    stats: [['Celebrations', 'All year'], ['Food & music', 'Always there'], ['Lights', 'Many festivals'], ['Together', 'People gather']],
    facts: ['🎉 Festivals are special celebrations shared by a whole community.', '📅 Many mark the seasons, harvests, new years, or important stories.', '🎶 They often have music, dancing, tasty food and colourful decorations.', '🪔 Festivals like Diwali fill the night with lights; carnivals fill streets with costumes.'],
    fun: 'At Spain\'s La Tomatina festival, thousands of people have a giant, friendly TOMATO fight in the streets!',
    quiz: [
      ['What do festivals often include?', ['Music, food and celebrating', 'Homework', 'Sleeping all day', 'Nothing at all'], 0],
      { t: 'tf', q: 'Festivals bring communities together.', answer: true },
      { t: 'pic', q: 'Which colours feel like a bright festival?', options: [
        { shape: 'star', color: '#F2C21E', label: 'Bright' }, { shape: 'star', color: '#6E6E7A', label: 'Grey' }, { shape: 'star', color: '#33313F', label: 'Dark' }], answer: 0 },
    ],
    quizHard: [
      ['Many festivals happen at harvest or new year. What are those festivals really celebrating?', ['Important times of the year', 'Nothing special', 'A single person', 'Bad weather'], 0],
      { t: 'tf', q: 'Because festivals gather people to share food and music, they help communities feel close.', answer: true },
      ['Diwali uses lights and carnival uses costumes. What do both add to a festival?', ['Colour and joy', 'Silence', 'Homework', 'Rain'], 0],
    ],
  },
  clothes: {
    name: 'Traditional Clothes', type: 'Culture · Special Outfits', emoji: '👘', badge: 'Style Scholar', build: 'clothes',
    mission: '👘 Kimono, sari, kilt — traditional clothes tell a story. Ready to dress up around the world?',
    stats: [['Culture', 'Clothes show it'], ['Climate', 'Shapes the style'], ['Special days', 'When worn'], ['Handmade', 'Often by hand']],
    facts: ['👘 Traditional clothes are special outfits that come from a culture\'s history.', '🌡️ Their style often suits the local climate — light and flowing where it\'s hot, thick where it\'s cold.', '🎎 Many are worn for festivals, weddings and important days.', '🧵 Examples include the Japanese kimono, Indian sari and Scottish kilt.'],
    fun: 'A traditional Indian sari can be over 5 metres of cloth — all wrapped without a single button or zip!',
    quiz: [
      ['What do traditional clothes often show?', ['A culture\'s history', 'The weather tomorrow', 'A phone number', 'Nothing'], 0],
      { t: 'tf', q: 'The local climate can shape how traditional clothes are made.', answer: true },
      { t: 'pic', q: 'Which shape looks like a flowing dress?', options: [
        { shape: 'triangle', color: '#E85C9A', label: 'Dress' }, { shape: 'square', color: '#E85C9A', label: 'Box' }, { shape: 'circle', color: '#E85C9A', label: 'Ball' }], answer: 0 },
    ],
    quizHard: [
      ['In hot places traditional clothes are often light and flowing. Why?', ['Light clothes help keep you cool', 'To look fancy only', 'To stay warm', 'To float away'], 0],
      { t: 'tf', q: 'A sari is one long piece of cloth, wrapped without buttons or zips.', answer: true },
      ['People wear traditional clothes at weddings and festivals. What are they honouring?', ['Their culture and history', 'The bus timetable', 'The weather', 'A video game'], 0],
    ],
  },
  greetings: {
    name: 'Greetings', type: 'Culture · Saying Hello', emoji: '🙋', badge: 'Hello Hero', build: 'greetings',
    mission: '🙋 A wave, a bow, a handshake — hello looks different everywhere. Ready to greet the world?',
    stats: [['Hello', 'Many ways'], ['Bow', 'In Japan'], ['Handshake', 'A common one'], ['Respect', 'Greetings show it']],
    facts: ['🙋 A greeting is a friendly way to say hello when you meet someone.', '🌏 Around the world people greet differently — a handshake, a bow, a wave, or hands pressed together.', '👃 In some places people gently touch cheeks or press noses!', '🤝 Greetings are a way of showing respect and friendliness.'],
    fun: 'In New Zealand, a traditional Māori greeting called the hongi is done by gently pressing noses together!',
    quiz: [
      ['What is a greeting for?', ['Saying hello in a friendly way', 'Saying goodbye only', 'Telling the time', 'Counting money'], 0],
      { t: 'tf', q: 'People greet each other in different ways around the world.', answer: true },
      { t: 'pic', q: 'Which shows a friendly hello?', options: [
        { shape: 'circle', color: '#6BCB77', label: 'Wave' }, { shape: 'circle', color: '#E23B2E', label: 'Turn away' }, { shape: 'circle', color: '#33313F', label: 'Frown' }], answer: 0 },
    ],
    quizHard: [
      ['A bow, a handshake and a wave are all different, but do the same job. What job?', ['Greeting someone kindly', 'Saying no', 'Falling asleep', 'Running away'], 0],
      { t: 'tf', q: 'Learning how people greet in other places is a way of showing respect.', answer: true },
      ['Different cultures greet in different ways. What does that tell you about the world?', ['It is wonderfully varied', 'Everyone is the same', 'No one says hello', 'Greetings are rude'], 0],
    ],
  },
  music: {
    name: 'Music Styles', type: 'Culture · World Rhythms', emoji: '🎵', badge: 'Rhythm Rider', build: 'music',
    mission: '🎵 Every culture makes its own music, from drums to guitars. Ready to feel the rhythm of the world?',
    stats: [['Every culture', 'Makes music'], ['Instruments', 'Drums to strings'], ['Rhythm', 'The heartbeat'], ['Together', 'Music unites']],
    facts: ['🎵 Every culture in the world makes music in its own special style.', '🥁 Music is made with instruments — drums, strings, flutes — and with our voices.', '🌍 Different places have different rhythms and styles, like reggae, samba, or classical.', '💃 Music brings people together to dance, celebrate and share feelings.'],
    fun: 'The oldest known instrument is a flute carved from bone over 40,000 years ago — older than farming itself!',
    quiz: [
      ['What does every culture in the world make?', ['Music', 'Snow', 'The same language', 'Nothing'], 0],
      { t: 'tf', q: 'Different places have different music styles.', answer: true },
      { t: 'pic', q: 'Which shape is a drum?', options: [
        { shape: 'circle', color: '#C0743C', label: 'Drum' }, { shape: 'square', color: '#C0743C', label: 'Box' }, { shape: 'triangle', color: '#C0743C', label: 'Cone' }], answer: 0 },
    ],
    quizHard: [
      ['Music can be made with instruments AND voices. What does that tell you about making music?', ['Almost anyone can make it', 'You need machines', 'It is impossible', 'Only drums work'], 0],
      { t: 'tf', q: 'Because music gets people dancing and celebrating together, it helps bring them closer.', answer: true },
      ['Reggae, samba and classical are all music, but sound different. What are they?', ['Different styles of music', 'Different countries', 'Different foods', 'Different flags'], 0],
    ],
  },
  food: {
    name: 'Food Around the World', type: 'Culture · Global Flavours', emoji: '🍜', badge: 'Global Foodie', build: 'food',
    mission: '🍜 Pizza, sushi, tacos, curry — the world is delicious! Ready to taste different cultures?',
    stats: [['Staples', 'Differ by place'], ['Spices', 'Add flavour'], ['Sharing', 'Meals bring joy'], ['Culture', 'On a plate']],
    facts: ['🍜 Every culture has its own favourite foods, often based on what grows nearby.', '🌾 Staples (main foods) differ — rice in much of Asia, bread in Europe, maize in the Americas.', '🌶️ Spices and herbs give each cuisine its own special flavour.', '🍽️ Sharing a meal is a way people show friendship and celebrate together.'],
    fun: 'Pizza travelled from Italy to become one of the world\'s favourite foods — over 5 billion are eaten every year!',
    quiz: [
      ['Why do foods differ around the world?', ['People use what grows nearby', 'Food falls from the sky', 'Everyone eats the same', 'Food has no reason'], 0],
      { t: 'tf', q: 'Sharing a meal is a way to show friendship.', answer: true },
      { t: 'pic', q: 'Which colour is a ripe tomato used in many dishes?', options: [
        { shape: 'circle', color: '#E23B2E', label: 'Red' }, { shape: 'circle', color: '#4BA6E8', label: 'Blue' }, { shape: 'circle', color: '#6E6E7A', label: 'Grey' }], answer: 0 },
    ],
    quizHard: [
      ['Rice is a staple in Asia and bread in Europe. Why do staples differ from place to place?', ['They use crops that grow well locally', 'People flip a coin', 'The Sun decides', 'They copy each other'], 0],
      { t: 'tf', q: 'Spices are a big reason foods from different cultures taste so different.', answer: true },
      ['Families and friends often gather to share a meal. What does food bring people, besides energy?', ['Togetherness and joy', 'Homework', 'Cold weather', 'Sleep'], 0],
    ],
  },
  currencies: {
    name: 'Currencies', type: 'Culture · World Money', emoji: '💰', badge: 'Coin Collector', build: 'currencies',
    mission: '💰 Dollars, yen, rupees — money looks different everywhere. Ready to explore world currencies?',
    stats: [['Money', 'Buys things'], ['Coins & notes', 'Two forms'], ['Each country', 'Its own'], ['Exchange', 'Swap one for another']],
    facts: ['💰 A currency is the type of money a country uses.', '🪙 Most currencies come as metal coins and paper (or plastic) notes.', '🌍 Different countries use different money — dollars, euros, yen, rupees and more.', '🔁 When you travel, you can exchange (swap) your money for the local kind.'],
    fun: 'The island of Yap once used giant stone "coins" as money — some bigger than a person and far too heavy to move!',
    quiz: [
      ['What is a currency?', ['The money a country uses', 'A kind of food', 'A country\'s flag', 'A language'], 0],
      { t: 'tf', q: 'Different countries can use different money.', answer: true },
      { t: 'pic', q: 'Which shape is a coin?', options: [
        { shape: 'circle', color: '#E3B23C', label: 'Coin' }, { shape: 'square', color: '#E3B23C', label: 'Box' }, { shape: 'triangle', color: '#E3B23C', label: 'Cone' }], answer: 0 },
    ],
    quizHard: [
      ['When you travel to another country, you often exchange your money. Why?', ['Shops there use their own currency', 'Money gets bored', 'It weighs less', 'It is the law of gravity'], 0],
      { t: 'tf', q: 'Most currencies come in two forms: coins and notes.', answer: true },
      ['Yap once used stone money too heavy to move. What does that show about money?', ['Money can be almost anything people agree on', 'Money must be gold', 'Money must be paper', 'Money is always tiny'], 0],
    ],
  },
};

/* ---------------- procedural culture symbols ---------------- */
function figure(THREE, color) {
  const f = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 1.6, 8), M(THREE, color));
  body.position.y = 1.2; f.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), M(THREE, 0xE9B98A));
  head.position.y = 2.3; f.add(head);
  return f;
}

function buildCulture(THREE, kind) {
  const g = new THREE.Group();
  if (kind === 'flags') {
    const cols = [0xE23B2E, 0x4BA6E8, 0x6BCB77];
    cols.forEach((c, i) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4, 6), M(THREE, 0xC9C9C9));
      pole.position.set((i - 1) * 1.6, 2, 0); g.add(pole);
      const flag = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.06), M(THREE, c));
      flag.position.set((i - 1) * 1.6 + 0.7, 3.4, 0); idle(flag, 'sway', 0.15, 3 + i, 'y'); g.add(flag);
    });
  } else if (kind === 'languages') {
    const cols = [0x5BC0DE, 0xF2C21E, 0xE85C9A];
    cols.forEach((c, i) => {
      const a = (i / 3) * Math.PI * 2;
      const bub = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), M(THREE, c, { flatShading: false }));
      bub.scale.set(1.3, 1, 0.5); bub.position.set(Math.cos(a) * 1.6, 2.6 + Math.sin(a), Math.sin(a) * 0.5);
      idle(bub, 'bobY', 0.2, 2 + i); g.add(bub);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 4), M(THREE, c));
      tail.position.copy(bub.position); tail.position.y -= 1; tail.rotation.x = Math.PI; g.add(tail);
    });
  } else if (kind === 'festivals') {
    const stage = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.2, 0.6, 16), M(THREE, 0x7A3FA0));
    stage.position.y = 0.3; g.add(stage);
    for (let i = 0; i < 16; i++) {
      const c = [0xE23B2E, 0xF2C21E, 0x6BCB77, 0x4BA6E8, 0xE85C9A][i % 5];
      const bit = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshBasicMaterial({ color: c }));
      const a = Math.random() * Math.PI * 2;
      bit.position.set(Math.cos(a) * (1 + Math.random() * 2), 1 + Math.random() * 4, Math.sin(a) * (1 + Math.random() * 2));
      idle(bit, 'bobY', 0.4, 2 + Math.random() * 3); g.add(bit);
    }
  } else if (kind === 'clothes') {
    const dress = new THREE.Mesh(new THREE.ConeGeometry(1.4, 3, 12), M(THREE, 0xE85C9A));
    dress.position.y = 1.7; idle(dress, 'sway', 0.06, 1.5, 'z'); g.add(dress);
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 10), M(THREE, 0xF2C21E));
    top.position.y = 3.2; g.add(top);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), M(THREE, 0xE9B98A));
    head.position.y = 4; g.add(head);
  } else if (kind === 'greetings') {
    const a = figure(THREE, 0x4BA6E8); a.position.set(-1.3, 0, 0); g.add(a);
    const b = figure(THREE, 0xE23B2E); b.position.set(1.3, 0, 0); b.rotation.y = Math.PI; g.add(b);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.2, 6), M(THREE, 0xE9B98A));
    arm.position.set(-0.7, 2, 0); arm.rotation.z = -0.8; idle(arm, 'sway', 0.4, 3, 'z'); g.add(arm);
  } else if (kind === 'music') {
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1, 1.4, 16), M(THREE, 0xC0743C));
    drum.position.y = 1; g.add(drum);
    const skin = new THREE.Mesh(new THREE.CircleGeometry(1.2, 16), M(THREE, 0xF0E0C0));
    skin.rotation.x = -Math.PI / 2; skin.position.y = 1.71; g.add(skin);
    for (let i = 0; i < 3; i++) {
      const note = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), M(THREE, [0xF2C21E, 0x6BCB77, 0x4BA6E8][i]));
      note.position.set((i - 1) * 1.2, 3.5 + Math.sin(i), 0); idle(note, 'bobY', 0.3, 2 + i); g.add(note);
      const stem = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.08), M(THREE, 0x333));
      stem.position.set((i - 1) * 1.2 + 0.3, 3.9 + Math.sin(i), 0); note.add(stem);
    }
  } else if (kind === 'food') {
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(THREE, 0xEDEDED));
    bowl.position.y = 1.4; g.add(bowl);
    const foods = [0xE23B2E, 0xF2C21E, 0x6BCB77, 0xF0E0C0];
    foods.forEach((c, i) => {
      const a = (i / foods.length) * Math.PI * 2;
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), M(THREE, c));
      f.position.set(Math.cos(a) * 0.7, 1.8, Math.sin(a) * 0.7); idle(f, 'bobY', 0.08, 2 + i); g.add(f);
    });
  } else if (kind === 'currencies') {
    for (let i = 0; i < 5; i++) {
      const coin = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.25, 20), M(THREE, i % 2 ? 0xE3B23C : 0xF0D070, { metalness: 0.4, roughness: 0.3 }));
      coin.position.y = 0.6 + i * 0.28; coin.rotation.x = 0.1; g.add(coin);
    }
    const note = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.05), M(THREE, 0x6BCB77));
    note.position.set(1.6, 2.4, 0); note.rotation.z = 0.3; idle(note, 'sway', 0.1, 2, 'z'); g.add(note);
  }
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  const keys = Object.keys(SUBJECTS);
  const R = 42;

  // Central low-poly globe (blue seas + green land patches), slowly turning.
  const globe = new THREE.Group();
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(10, 24, 18), M(THREE, 0x2E6FB0, { flatShading: false }));
  globe.add(sphere);
  for (let i = 0; i < 14; i++) {
    const patch = new THREE.Mesh(new THREE.SphereGeometry(2 + Math.random() * 2.5, 10, 8), M(THREE, 0x4E9E4A));
    const u = Math.random() * Math.PI * 2, v = Math.acos(2 * Math.random() - 1);
    patch.position.setFromSphericalCoords(10, v, u); patch.scale.set(1, 0.5, 1);
    patch.lookAt(0, 0, 0); globe.add(patch);
  }
  globe.position.y = 2; group.add(globe);

  keys.forEach((key, i) => {
    const def = SUBJECTS[key];
    const holder = new THREE.Group();
    const item = buildCulture(THREE, def.build);
    holder.add(item);
    const p = ringPosition(i, keys.length, R, 4);
    holder.position.set(p.x, p.y + 1, p.z);
    holder.userData = { key, def, focusRadius: 7, bobPhase: Math.random() * 6, baseY: p.y + 1, anims: collectIdle(item) };
    attachMarker(THREE, holder, isDone(key), 6);
    clickables.push(holder);
    group.add(holder);
  });

  function update(dt, t, camera) {
    globe.rotation.y += dt * 0.1;
    clickables.forEach((m) => {
      m.rotation.y += dt * 0.15;
      m.position.y = m.userData.baseY + Math.sin(t * 0.6 + m.userData.bobPhase) * 0.4;
      runIdle(m.userData.anims, t);
    });
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, home: { radius: 116 } };
}

export default {
  key: 'cultures',
  name: 'World Cultures',
  icon: '🌍',
  blurb: 'Explore flags, festivals, and traditions from every corner of Earth.',
  unlockCost: 312,
  category: 'People & Places',
  theme: { primary: 0xF2A93B, secondary: 0xE85C9A, bg: 0x14132a, light: 0xFFE8C8, ambient: 0x40406a },
  masterTitle: 'Culture Master 🌍',
  subjects: SUBJECTS,
  build,
};
