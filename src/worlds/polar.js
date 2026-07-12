import { attachMarker, updateMarkers, ringPosition } from './helpers.js';
import { idle, collectIdle, runIdle } from './anim.js';

/**
 * World 10 — Polar World. A frozen tundra under a shifting aurora: an overhead
 * aurora ribbon and a coloured sky light slowly cycle through green/cyan/purple,
 * with an ice-blue palette kept distinct from Ocean Life's underwater blue.
 * The North/South Pole subjects are shown as candy-striped marker poles (a
 * clear "you are standing on the pole" metaphor) on sea-ice vs. land-ice.
 */

const M = (THREE, c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0.05, flatShading: true, ...o });

const SUBJECTS = {
  polarbear: {
    name: 'Polar Bear', type: 'Arctic · Ice King', emoji: '🐻‍❄️', badge: 'Ice King', build: 'bear',
    mission: '🐻‍❄️ The polar bear rules the frozen Arctic — and it\'s a surprisingly great swimmer. Ready to meet the ice king?',
    stats: [['Biggest', 'Land predator'], ['Black skin', 'Under white fur'], ['Swims', 'For hours'], ['Blubber', 'Keeps it warm']],
    facts: ['🐻‍❄️ The polar bear is the biggest land meat-eater on Earth.', '⚫ Under its white fur, its skin is actually BLACK — to soak up the Sun\'s warmth.', '🏊 It\'s a powerful swimmer that can paddle for hours between sheets of ice.', '🧈 A thick layer of fat, called blubber, keeps it cosy in freezing water.'],
    fun: 'A polar bear\'s fur isn\'t really white — each hair is see-through and hollow, which just makes it LOOK white!',
    quiz: [
      ['What colour is a polar bear\'s SKIN under its fur?', ['Black', 'White', 'Pink', 'Blue'], 0],
      { t: 'tf', q: 'Polar bears are strong swimmers.', answer: true },
      { t: 'pic', q: 'Which colour does a polar bear\'s fur look?', options: [
        { shape: 'circle', color: '#F2F7FF', label: 'White' }, { shape: 'circle', color: '#33313F', label: 'Black' }, { shape: 'circle', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['A polar bear has black skin under white fur. Why is black skin helpful in the Arctic?', ['It soaks up the Sun\'s warmth', 'It looks scary', 'It helps it swim', 'It hides in snow'], 0],
      { t: 'tf', q: 'A thick layer of blubber lets a polar bear swim in icy water without freezing.', answer: true },
      ['Polar bears swim for hours between ice sheets. Why would they need to swim so far?', ['To reach food and hunting spots', 'To cool down', 'To wash', 'To race fish'], 0],
    ],
  },
  arcticfox: {
    name: 'Arctic Fox', type: 'Arctic · Quick-Change Artist', emoji: '🦊', badge: 'Snow Sneak', build: 'fox',
    mission: '🦊 The Arctic fox swaps its coat with the seasons to stay hidden. Ready to meet a master of disguise?',
    stats: [['Coat changes', 'White ↔ brown'], ['Small ears', 'Save body heat'], ['-50°C', 'Survives it'], ['Furry feet', 'Built-in boots']],
    facts: ['🦊 The Arctic fox turns white in winter and brown in summer to blend in all year round.', '👂 It has small, round ears — less surface means less body heat lost to the cold.', '🥶 It can survive temperatures as low as -50°C!', '🥾 Furry feet act like built-in snow boots on the ice.'],
    fun: 'An Arctic fox\'s winter coat is so warm it doesn\'t even start shivering until the air hits about -70°C!',
    quiz: [
      ['Why does the Arctic fox change colour?', ['To stay hidden in each season', 'To look pretty', 'To scare bears', 'To glow'], 0],
      { t: 'tf', q: 'Small ears help the fox keep more of its body heat.', answer: true },
      { t: 'pic', q: 'Which colour is an Arctic fox in winter?', options: [
        { shape: 'circle', color: '#F2F7FF', label: 'White' }, { shape: 'circle', color: '#E23B2E', label: 'Red' }, { shape: 'circle', color: '#33313F', label: 'Black' }], answer: 0 },
    ],
    quizHard: [
      ['Big ears lose more heat than small ears. Why does the Arctic fox have SMALL ears?', ['To keep precious body heat in the cold', 'To hear better', 'To look cute', 'To swim'], 0],
      { t: 'tf', q: 'Turning white in winter and brown in summer keeps the fox hidden all year.', answer: true },
      ['The Arctic fox has fur on the soles of its feet. How does that help on the ice?', ['It keeps feet warm and stops slipping', 'It helps it fly', 'It stores food', 'It makes noise'], 0],
    ],
  },
  aurora: {
    name: 'Aurora', type: 'Arctic · Sky Lights', emoji: '🌌', badge: 'Light Dancer', build: 'aurora',
    mission: '🌌 Ribbons of coloured light dance across the polar sky. Ready to discover what makes the aurora glow?',
    stats: [['Sun particles', 'Cause it'], ['High up', 'Where it glows'], ['Green', 'Common colour'], ['Poles', 'Best seen near']],
    facts: ['🌌 The aurora is a glowing curtain of light that dances across the polar sky.', '☀️ It happens when tiny particles from the Sun crash into gases high in our air.', '🌈 Those gases light up in colours — often green, and sometimes pink or purple.', '🧭 It\'s seen best near the North and South Poles.'],
    fun: 'The aurora glows about 100 km up — far higher than any plane flies, right at the edge of space!',
    quiz: [
      ['What causes the aurora?', ['Particles from the Sun hitting our air', 'Street lights', 'Fireworks', 'The Moon melting'], 0],
      { t: 'tf', q: 'The aurora is seen best near the North and South Poles.', answer: true },
      { t: 'pic', q: 'Which colour does the aurora glow most often?', options: [
        { shape: 'circle', color: '#5BF0A5', label: 'Green' }, { shape: 'circle', color: '#8A5A34', label: 'Brown' }, { shape: 'circle', color: '#6E6E7A', label: 'Grey' }], answer: 0 },
    ],
    quizHard: [
      ['The aurora appears when Sun particles hit gases in our air. What does that make the aurora?', ['A glow made by the Sun and our air together', 'A kind of cloud', 'A star', 'A rainbow from rain'], 0],
      { t: 'tf', q: 'Because the aurora forms about 100 km up, it is far higher than any aeroplane flies.', answer: true },
      ['The aurora is best seen near the poles. That\'s where Earth\'s magnetism pulls the Sun\'s particles. So the aurora is linked to what?', ['Earth acting like a giant magnet', 'Ocean waves', 'Volcanoes', 'Rain clouds'], 0],
    ],
  },
  iceberg: {
    name: 'Iceberg', type: 'Arctic · Floating Giant', emoji: '🧊', badge: 'Berg Spotter', build: 'iceberg',
    mission: '🧊 An iceberg hides most of itself underwater — only the tip shows. Ready to see below the surface?',
    stats: [['90%', 'Hidden underwater'], ['Glaciers', 'Where they break off'], ['Fresh water', 'Not salty'], ['Floats', 'Ice is lighter']],
    facts: ['🧊 An iceberg is a huge chunk of ice floating in the sea.', '🌊 Only about a tenth of it shows above water — the rest hides below!', '🏔️ Icebergs break off from glaciers and giant ice sheets.', '💧 They\'re made of frozen fresh water, not salty sea water.'],
    fun: 'About 90% of an iceberg hides underwater — that\'s where the saying "just the tip of the iceberg" comes from!',
    quiz: [
      ['How much of an iceberg is hidden underwater?', ['About 90%', 'About 10%', 'Half', 'None'], 0],
      { t: 'tf', q: 'Icebergs are made of frozen fresh water.', answer: true },
      { t: 'pic', q: 'Which colours is an iceberg?', options: [
        { shape: 'diamond', color: '#BFE9FF', label: 'Icy blue-white' }, { shape: 'diamond', color: '#E23B2E', label: 'Red' }, { shape: 'diamond', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['Most of an iceberg hides underwater. Why does that make icebergs dangerous to ships?', ['A ship can hit the hidden ice below', 'They are too bright', 'They melt too fast', 'They are too small'], 0],
      { t: 'tf', q: 'Because ice is lighter than water, an iceberg floats instead of sinking.', answer: true },
      ['Icebergs break off from glaciers made of fresh water. So an iceberg is really a piece of what?', ['A frozen river of fresh-water ice', 'The salty sea', 'A cloud', 'A snowball from the sky'], 0],
    ],
  },
  northpole: {
    name: 'North Pole', type: 'Arctic · Top of the World', emoji: '🧭', badge: 'Top Explorer', build: 'northpole',
    mission: '🧭 The North Pole sits at the very top of the world — on floating ice, not land! Ready to stand on top of Earth?',
    stats: [['Top of Earth', 'The very top'], ['Sea ice', 'No land under it'], ['Polar bears', 'Live nearby'], ['Compass', 'Points here']],
    facts: ['🧭 The North Pole is the point at the very top of the Earth.', '🌊 Surprisingly, there\'s no land there — just floating sea ice over a deep ocean!', '🐻‍❄️ Polar bears roam the Arctic ice around it.', '➡️ A compass needle always points toward the north.'],
    fun: 'At the North Pole, every direction you look is SOUTH — you simply can\'t go any further north!',
    quiz: [
      ['What is under the North Pole?', ['Floating sea ice, no land', 'A big mountain', 'A city', 'A desert'], 0],
      { t: 'tf', q: 'A compass needle points toward the north.', answer: true },
      { t: 'pic', q: 'Which colour is the icy North Pole?', options: [
        { shape: 'circle', color: '#EAF6FF', label: 'Icy white' }, { shape: 'circle', color: '#E3B23C', label: 'Sandy' }, { shape: 'circle', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['There is no land at the North Pole, just floating ice. What is directly beneath that ice?', ['A deep ocean', 'A mountain', 'A forest', 'A desert'], 0],
      { t: 'tf', q: 'Standing exactly on the North Pole, every way you face is south.', answer: true },
      ['A compass always points north. What is a compass really useful for?', ['Finding which way to travel', 'Telling the time', 'Measuring rain', 'Counting stars'], 0],
    ],
  },
  southpole: {
    name: 'South Pole', type: 'Antarctic · Bottom of the World', emoji: '🧊', badge: 'Antarctic Ace', build: 'southpole',
    mission: '🧊 The South Pole sits on a frozen continent — the coldest place on all of Earth. Ready to brave Antarctica?',
    stats: [['Bottom of Earth', 'The very bottom'], ['Land', 'Under thick ice'], ['Coldest', 'Place on Earth'], ['Scientists', 'Live & study there']],
    facts: ['🧊 The South Pole is at the very bottom of the Earth, on the frozen continent of Antarctica.', '🏔️ Unlike the North Pole, there IS land here — buried under ice up to 4 km thick!', '🥶 It\'s the coldest place on Earth, dropping below -80°C.', '🔬 Scientists live in research stations to study the ice and weather.'],
    fun: 'The coldest temperature ever recorded on Earth was near the South Pole: a mind-numbing -89°C!',
    quiz: [
      ['What is different about the South Pole compared to the North Pole?', ['The South Pole has land under its ice', 'It is hot', 'It has no ice', 'It is in the sea only'], 0],
      { t: 'tf', q: 'The South Pole is one of the coldest places on Earth.', answer: true },
      { t: 'pic', q: 'Which colours match icy Antarctica?', options: [
        { shape: 'circle', color: '#DCEEFF', label: 'White & blue' }, { shape: 'circle', color: '#E23B2E', label: 'Red' }, { shape: 'circle', color: '#E3B23C', label: 'Gold' }], answer: 0 },
    ],
    quizHard: [
      ['The North Pole is sea ice, but the South Pole has land under the ice. What is that land called?', ['The continent of Antarctica', 'An island', 'A beach', 'A jungle'], 0],
      { t: 'tf', q: 'Scientists live at the South Pole to learn about ice and weather, not because it\'s scary.', answer: true },
      ['The South Pole sits on a high, icy continent. Why does that help make it so cold?', ['High, icy places are much colder', 'It is near the Sun', 'It has volcanoes', 'It is underwater'], 0],
    ],
  },
  narwhal: {
    name: 'Narwhal', type: 'Arctic · Sea Unicorn', emoji: '🦄', badge: 'Sea Unicorn', build: 'narwhal',
    mission: '🦄 Meet the narwhal — a real Arctic whale with a magical-looking tusk. Ready to find the unicorn of the sea?',
    stats: [['Tusk', 'A giant tooth!'], ['Arctic', 'Where it lives'], ['A whale', 'Not a fish'], ['Senses', 'Its tusk feels water']],
    facts: ['🦄 The narwhal is an Arctic whale with a long spiral tusk — the "unicorn of the sea".', '🦷 That tusk is really a giant tooth that can grow up to 3 metres long!', '❄️ It lives in the freezing waters near the North Pole.', '📡 Scientists think the tusk helps it sense changes in the water.'],
    fun: 'A narwhal\'s "horn" is really a tooth that grows right through its lip — poking out up to 3 metres long!',
    quiz: [
      ['What is a narwhal\'s tusk really?', ['A giant tooth', 'A horn of bone', 'A piece of ice', 'A fin'], 0],
      { t: 'tf', q: 'A narwhal is a whale, not a fish.', answer: true },
      { t: 'pic', q: 'Which shape matches a narwhal\'s long tusk?', options: [
        { shape: 'triangle', color: '#E9E2C8', label: 'Long point' }, { shape: 'circle', color: '#E9E2C8', label: 'Round' }, { shape: 'square', color: '#E9E2C8', label: 'Block' }], answer: 0 },
    ],
    quizHard: [
      ['A narwhal is a whale, not a fish. What must it do that a fish does not?', ['Come up to breathe air', 'Grow scales', 'Lay eggs on land', 'Drink milk from plants'], 0],
      { t: 'tf', q: 'Because the tusk can sense the water, it may be more than just for show.', answer: true },
      ['A narwhal\'s tusk is a tooth, not a horn. What does that tell you about calling it a "unicorn"?', ['It just looks like one — it\'s really a tooth', 'It is a real unicorn', 'It has magic', 'It has two tusks'], 0],
    ],
  },
  icefishing: {
    name: 'Ice Fishing', type: 'Arctic · Winter Skill', emoji: '🎣', badge: 'Frost Angler', build: 'icefishing',
    mission: '🎣 When lakes freeze solid, fishing means drilling right through the ice! Ready to try ice fishing?',
    stats: [['Frozen lake', 'Fish through it'], ['A hole', 'Cut in the ice'], ['Winter', 'When it\'s done'], ['Thick ice', 'Needed to be safe']],
    facts: ['🎣 Ice fishing means cutting a hole through the ice on a frozen lake and dropping a line down.', '🕰️ People have fished this way in cold places for thousands of years.', '🐟 The fish are still swimming in the water below the ice.', '⚠️ You need thick, solid ice to stand on safely — always with a grown-up!'],
    fun: 'Fish don\'t freeze in a frozen lake — the water under the ice stays liquid, and fish swim slowly all winter!',
    quiz: [
      ['How do people ice fish?', ['Cut a hole in the ice and drop a line', 'Melt the whole lake', 'Dig under the ground', 'Wait for summer'], 0],
      { t: 'tf', q: 'You need thick, solid ice to ice fish safely.', answer: true },
      { t: 'pic', q: 'Which ice is safe to stand on? Tap the thick, solid one!', options: [
        { shape: 'circle', color: '#DCEEFF', label: '', size: 1 }, { shape: 'circle', color: '#DCEEFF', label: '', size: 0.5 }, { shape: 'circle', color: '#DCEEFF', label: '', size: 0.3 }], answer: 0 },
    ],
    quizHard: [
      ['The water under a frozen lake stays liquid. Why is that lucky for the fish?', ['They can keep swimming all winter', 'They can fly away', 'They turn to ice safely', 'They breathe the ice'], 0],
      { t: 'tf', q: 'Ice fishing only works because fish are still alive and swimming below the ice.', answer: true },
      ['Ice fishers check the ice is thick before stepping on it. Why is that the smart, safe thing to do?', ['Thin ice could break under them', 'Thick ice is warmer', 'Thin ice has no fish', 'Thick ice is shinier'], 0],
    ],
  },
};

/* ---------------- procedural polar subjects ---------------- */
function quad(THREE, color, size = 1) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.5 * size, 12, 10), M(THREE, color));
  body.scale.set(1.7, 1, 0.95); body.position.y = 1.6 * size; idle(body, 'breathe', 0.03, 2); g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.9 * size, 12, 10), M(THREE, color));
  head.position.set(2.3 * size, 2.1 * size, 0); g.add(head);
  for (const [dx, dz] of [[1.4, 0.7], [1.4, -0.7], [-1.2, 0.7], [-1.2, -0.7]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * size, 0.3 * size, 1.4 * size, 7), M(THREE, color));
    leg.position.set(dx * size, 0.7 * size, dz * size); g.add(leg);
  }
  g.userData.head = head;
  return g;
}

function buildPolar(THREE, kind) {
  let g = new THREE.Group();
  if (kind === 'bear') {
    g = quad(THREE, 0xF2F7FF, 1.1);
    for (const dz of [0.4, -0.4]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), M(THREE, 0xF2F7FF));
      ear.position.set(2.5, 3.1, dz); g.add(ear);
    }
  } else if (kind === 'fox') {
    g = quad(THREE, 0xF2F7FF, 0.7);
    for (const dz of [0.3, -0.3]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 6), M(THREE, 0xEAF2FF));
      ear.position.set(1.7, 2.1, dz); g.add(ear);
    }
    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), M(THREE, 0xFFFFFF));
    tail.scale.set(1.8, 0.8, 0.8); tail.position.set(-2, 1.4, 0); idle(tail, 'sway', 0.3, 2.5, 'y'); g.add(tail);
  } else if (kind === 'aurora') {
    const geo = new THREE.PlaneGeometry(9, 6, 20, 8);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 0.8) * 0.8);
    const ribbon = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x5BF0A5, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
    ribbon.position.y = 3; ribbon.name = 'ribbon'; g.add(ribbon); g.userData.ribbon = ribbon;
    const ribbon2 = ribbon.clone(); ribbon2.material = ribbon.material.clone();
    ribbon2.position.set(1, 4.5, -1); ribbon2.material.color.set(0xB26CFF); ribbon2.material.opacity = 0.4; g.add(ribbon2);
    g.userData.ribbon2 = ribbon2;
  } else if (kind === 'iceberg') {
    const top = new THREE.Mesh(new THREE.IcosahedronGeometry(2.4, 0), M(THREE, 0xEAF6FF, { flatShading: true, transparent: true, opacity: 0.95, emissive: 0x2a5a7a, emissiveIntensity: 0.2 }));
    top.position.y = 2.4; g.add(top);
    const below = new THREE.Mesh(new THREE.IcosahedronGeometry(3.4, 0), M(THREE, 0xAED6EE, { flatShading: true, transparent: true, opacity: 0.4 }));
    below.position.y = -1.6; g.add(below);
    const water = new THREE.Mesh(new THREE.CircleGeometry(6, 24),
      new THREE.MeshBasicMaterial({ color: 0x3E7EA8, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
    water.rotation.x = -Math.PI / 2; water.position.y = 0.2; g.add(water);
  } else if (kind === 'northpole' || kind === 'southpole') {
    // Ice base: flat sea-ice sheet (north) vs domed land-ice (south).
    const base = kind === 'northpole'
      ? new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.6, 20), M(THREE, 0xEAF6FF))
      : new THREE.Mesh(new THREE.SphereGeometry(4, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), M(THREE, 0xDCEEFF));
    base.position.y = 0.3; if (kind === 'southpole') base.scale.set(1, 0.6, 1); g.add(base);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 5, 8), M(THREE, 0xF4F4F4));
    pole.position.y = 3; g.add(pole);
    for (let i = 0; i < 5; i++) {
      const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.5, 8), M(THREE, i % 2 ? 0xE23B2E : 0xF4F4F4));
      stripe.position.y = 1 + i; g.add(stripe);
    }
    const flag = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1, 0.05), M(THREE, kind === 'northpole' ? 0x4BA6E8 : 0xB26CFF));
    flag.position.set(0.9, 5, 0); g.add(flag);
  } else if (kind === 'narwhal') {
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.5, 14, 10), M(THREE, 0x8AA0B0));
    body.scale.set(2.2, 1, 1); body.position.y = 1.8; idle(body, 'breathe', 0.03, 1.5); g.add(body);
    const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.16, 4, 8), M(THREE, 0xEDE6CE));
    tusk.position.set(4.4, 2, 0); tusk.rotation.z = -Math.PI / 2; g.add(tusk);
    const fluke = new THREE.Mesh(new THREE.ConeGeometry(1, 0.4, 4), M(THREE, 0x7A90A0));
    fluke.position.set(-3.4, 1.8, 0); fluke.rotation.z = Math.PI / 2; fluke.scale.set(1, 1, 2); idle(fluke, 'sway', 0.3, 2, 'x'); g.add(fluke);
  } else if (kind === 'icefishing') {
    const ice = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.8, 22), M(THREE, 0xEAF6FF, { transparent: true, opacity: 0.95 }));
    ice.position.y = 0.4; g.add(ice);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ color: 0x1E4A66 }));
    hole.rotation.x = -Math.PI / 2; hole.position.y = 0.81; g.add(hole);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4, 6), M(THREE, 0x8A5A34));
    rod.position.set(2.4, 2.4, 0); rod.rotation.z = -0.7; g.add(rod);
    const line = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 2.4, 4), M(THREE, 0xDDDDDD));
    line.position.set(0.4, 1.4, 0); g.add(line);
    const hut = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2, 4), M(THREE, 0xC0392B));
    hut.position.set(-2.2, 1.2, 0); g.add(hut);
  }
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  const keys = Object.keys(SUBJECTS);
  const R = 46;

  // Snowy ground.
  const floor = new THREE.Mesh(new THREE.CircleGeometry(R + 30, 48),
    new THREE.MeshStandardMaterial({ color: 0xDDEBF6, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1; group.add(floor);

  // Snowy hills.
  for (let i = 0; i < 8; i++) {
    const a = Math.random() * Math.PI * 2, d = R + 20 + Math.random() * 26;
    const hill = new THREE.Mesh(new THREE.SphereGeometry(7 + Math.random() * 6, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xE7F2FB, roughness: 1, flatShading: true }));
    hill.position.set(Math.cos(a) * d, -1, Math.sin(a) * d); hill.scale.set(1.4, 0.5, 1.4); group.add(hill);
  }

  // Overhead aurora ribbon (ambiance) + colour-shifting sky light.
  const skyGeo = new THREE.PlaneGeometry(140, 30, 40, 6);
  const sp = skyGeo.attributes.position;
  for (let i = 0; i < sp.count; i++) sp.setZ(i, Math.sin(sp.getX(i) * 0.06) * 6);
  const skyAurora = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ color: 0x5BF0A5, transparent: true, opacity: 0.16, side: THREE.DoubleSide }));
  skyAurora.position.set(0, 46, -30); skyAurora.rotation.x = -0.5; group.add(skyAurora);
  const auroraLight = new THREE.PointLight(0x5BF0A5, 0.9, 500);
  auroraLight.position.set(0, 60, 0); group.add(auroraLight);

  keys.forEach((key, i) => {
    const def = SUBJECTS[key];
    const holder = new THREE.Group();
    const item = buildPolar(THREE, def.build);
    holder.add(item);
    const p = ringPosition(i, keys.length, R, 3);
    holder.position.set(p.x, p.y, p.z);
    holder.userData = { key, def, focusRadius: 8, bobPhase: Math.random() * 6, baseY: p.y,
      anims: collectIdle(item), ribbon: item.userData.ribbon || null, ribbon2: item.userData.ribbon2 || null };
    attachMarker(THREE, holder, isDone(key), 6);
    clickables.push(holder);
    group.add(holder);
  });

  function update(dt, t, camera) {
    // Cycle the aurora colours through green → cyan → purple.
    const hue = (Math.sin(t * 0.25) * 0.5 + 0.5) * 0.35 + 0.3; // ~0.3–0.65
    skyAurora.material.color.setHSL(hue, 0.8, 0.6);
    auroraLight.color.setHSL(hue, 0.7, 0.6);
    skyAurora.position.x = Math.sin(t * 0.2) * 10;

    clickables.forEach((m) => {
      m.rotation.y += dt * 0.18;
      m.position.y = m.userData.baseY + Math.sin(t * 0.6 + m.userData.bobPhase) * 0.4;
      runIdle(m.userData.anims, t);
      if (m.userData.ribbon) {
        m.userData.ribbon.material.color.setHSL(hue, 0.8, 0.6);
        m.userData.ribbon.rotation.z = Math.sin(t) * 0.15;
        if (m.userData.ribbon2) m.userData.ribbon2.rotation.z = Math.cos(t * 1.1) * 0.15;
      }
    });
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, home: { radius: 118 } };
}

export default {
  key: 'polar',
  name: 'Polar World',
  icon: '🧊',
  blurb: 'Brave the ice with polar bears, auroras, and frozen wonders.',
  unlockCost: 220,
  category: 'Nature & Life',
  theme: { primary: 0x7FD4F0, secondary: 0x5BF0A5, bg: 0x081420, light: 0xDCF2FF, ambient: 0x2a4a66 },
  masterTitle: 'Polar Master 🧊',
  subjects: SUBJECTS,
  build,
};
