import { attachMarker, updateMarkers, ringPosition } from './helpers.js';
import { idle, collectIdle, runIdle } from './anim.js';

/**
 * World 11 — Weather & Sky. A sky diorama the kid rotates through: each subject
 * is a little weather "station" (mostly procedural clouds) with real particle
 * systems — falling rain and snow, a flashing procedural lightning bolt, a
 * spinning tornado funnel, and the Water Cycle shown as a sun→cloud→sea loop
 * that ties the others together (the connecting "boss" subject).
 */

const M = (THREE, c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, metalness: 0.02, flatShading: true, ...o });

function cloud(THREE, color = 0xF4F7FF, s = 1) {
  const g = new THREE.Group();
  const puffs = [[0, 0, 0, 1.6], [1.4, -0.2, 0, 1.2], [-1.4, -0.2, 0, 1.2], [0.7, 0.5, 0.4, 1], [-0.6, 0.4, -0.4, 1]];
  for (const [x, y, z, r] of puffs) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(r * s, 12, 10), M(THREE, color, { flatShading: false }));
    p.position.set(x * s, y * s, z * s); g.add(p);
  }
  return g;
}

const SUBJECTS = {
  rain: {
    name: 'Rain', type: 'Weather · Falling Water', emoji: '🌧️', badge: 'Rain Maker', build: 'rain',
    mission: '🌧️ Every raindrop began as water that floated up into the sky. Ready to follow the drops?',
    stats: [['Clouds', 'Where it forms'], ['Droplets', 'Join to fall'], ['Rain gauge', 'Measures it'], ['Fresh water', 'It gives us']],
    facts: ['🌧️ Rain forms when tiny water droplets in clouds join together and grow heavy enough to fall.', '💧 Raindrops aren\'t teardrop-shaped — small ones are round like tiny buns!', '🌱 Rain gives plants, animals and us the fresh water we all need.', '📏 People measure how much rain falls using a tool called a rain gauge.'],
    fun: 'Big raindrops can fall at about 30 km/h — but they flatten out like little burgers, not teardrops!',
    quiz: [
      ['Where do raindrops form?', ['In clouds', 'Underground', 'In the Sun', 'In rivers'], 0],
      { t: 'tf', q: 'Rain gives us fresh water to drink and to grow plants.', answer: true },
      { t: 'pic', q: 'Which shape falls from a rain cloud?', options: [
        { shape: 'drop', color: '#4BA6E8', label: 'Raindrop' }, { shape: 'square', color: '#4BA6E8', label: 'Cube' }, { shape: 'star', color: '#4BA6E8', label: 'Star' }], answer: 0 },
    ],
    quizHard: [
      ['Droplets in a cloud join until they get heavy. Why do they then fall as rain?', ['Gravity pulls the heavy drops down', 'The Sun pushes them', 'Wind blows them up', 'They bounce'], 0],
      { t: 'tf', q: 'Because rain is fresh water, it helps refill rivers and lakes we drink from.', answer: true },
      ['A rain gauge collects falling rain. What does it help people find out?', ['How much rain has fallen', 'How hot it is', 'How windy it is', 'The time'], 0],
    ],
  },
  thunderstorm: {
    name: 'Thunderstorm', type: 'Weather · Lightning & Thunder', emoji: '⚡', badge: 'Storm Chaser', build: 'thunder',
    mission: '⚡ Lightning is a giant spark hotter than the Sun\'s surface! Ready to discover thunder and lightning?',
    stats: [['Giant spark', 'Lightning is'], ['Hotter than Sun', 'Its surface'], ['Thunder', 'Lightning\'s sound'], ['Go indoors', 'To stay safe']],
    facts: ['⚡ Lightning is a huge spark of electricity that jumps between clouds or down to the ground.', '🔥 A lightning bolt is hotter than the surface of the Sun!', '💥 Thunder is the sound lightning makes as it heats the air so fast the air BANGS.', '🏠 During a storm, the safe thing to do is go indoors.'],
    fun: 'Lightning is about five times hotter than the Sun\'s surface — but each bolt lasts only a tiny flash of a second!',
    quiz: [
      ['What is thunder?', ['The sound lightning makes', 'A kind of rain', 'A cloud', 'A wind'], 0],
      { t: 'tf', q: 'A lightning bolt is hotter than the surface of the Sun.', answer: true },
      { t: 'pic', q: 'Which colour is a lightning bolt?', options: [
        { shape: 'triangle', color: '#F6E15A', label: 'Yellow' }, { shape: 'triangle', color: '#4BA6E8', label: 'Blue' }, { shape: 'triangle', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['You see lightning\'s flash before you hear the thunder. Why does the flash come first?', ['Light travels faster than sound', 'Thunder is shy', 'The flash is louder', 'Sound comes first'], 0],
      { t: 'tf', q: 'Counting the seconds between the flash and the bang tells you how far the storm is.', answer: true },
      ['Why is going indoors the safe choice in a thunderstorm?', ['Lightning tends to strike tall, open things', 'Rain melts houses', 'Thunder breaks windows', 'It never helps'], 0],
    ],
  },
  rainbow: {
    name: 'Rainbow', type: 'Weather · Sky Colours', emoji: '🌈', badge: 'Colour Catcher', build: 'rainbow',
    mission: '🌈 A rainbow is sunlight taking a colourful shortcut through raindrops. Ready to chase one?',
    stats: [['Sunlight', 'Split into colours'], ['Raindrops', 'Act like prisms'], ['7 colours', 'Red to violet'], ['Opposite Sun', 'Where to look']],
    facts: ['🌈 A rainbow appears when sunlight shines through raindrops and splits into colours.', '💎 Each raindrop bends the light like a tiny prism.', '🎨 The colours are always in the same order — red on the outside, violet on the inside.', '☀️ To see one, stand with the Sun behind you and rain in front.'],
    fun: 'A rainbow is actually a full circle — we usually see only the top arc because the ground gets in the way!',
    quiz: [
      ['What splits sunlight into a rainbow?', ['Raindrops', 'Clouds', 'The Moon', 'Snow'], 0],
      { t: 'tf', q: 'A rainbow always shows its colours in the same order.', answer: true },
      { t: 'pic', q: 'Which colour is at the TOP of a rainbow?', options: [
        { shape: 'circle', color: '#E23B2E', label: 'Red' }, { shape: 'circle', color: '#7A4BE8', label: 'Violet' }, { shape: 'circle', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['Each raindrop bends sunlight like a prism. What does that turn plain white sunlight into?', ['A band of many colours', 'Just red', 'Darkness', 'Wind'], 0],
      { t: 'tf', q: 'To see a rainbow you stand with the Sun behind you and rain in front.', answer: true },
      ['A rainbow is really a full circle, but we see an arc. Why is the bottom half missing?', ['The ground gets in the way', 'It ran out of colours', 'The Sun blocks it', 'Rain stops it'], 0],
    ],
  },
  snow: {
    name: 'Snow', type: 'Weather · Frozen Sky', emoji: '❄️', badge: 'Flake Finder', build: 'snow',
    mission: '❄️ Every snowflake has six sides and no two are exactly alike. Ready to catch some snow?',
    stats: [['Ice crystals', 'What snow is'], ['6 sides', 'Every snowflake'], ['All unique', 'No two alike'], ['Blanket', 'Keeps ground warm']],
    facts: ['❄️ Snow is made of tiny ice crystals that form high up in cold clouds.', '6️⃣ Almost every snowflake has six sides or six arms.', '🔬 No two snowflakes are exactly the same!', '🛌 A blanket of snow can keep the ground beneath it warmer, protecting plants and animals.'],
    fun: 'Snow looks white, but each ice crystal is actually clear — it\'s the way they scatter light that makes snow look white!',
    quiz: [
      ['How many sides does a snowflake usually have?', ['Six', 'Three', 'Four', 'Ten'], 0],
      { t: 'tf', q: 'No two snowflakes are exactly alike.', answer: true },
      { t: 'pic', q: 'Which shape has six sides, like a snowflake?', options: [
        { shape: 'hexagon', color: '#DCF2FF', label: '6 sides' }, { shape: 'square', color: '#DCF2FF', label: '4 sides' }, { shape: 'triangle', color: '#DCF2FF', label: '3 sides' }], answer: 0 },
    ],
    quizHard: [
      ['Snow crystals are clear, yet snow looks white. Why?', ['They scatter light in all directions', 'They are painted white', 'The Sun is white', 'They are made of milk'], 0],
      { t: 'tf', q: 'A blanket of snow can actually keep the ground below it warmer.', answer: true },
      ['Every snowflake has six sides. What does that tell you about how water freezes?', ['It freezes into six-sided patterns', 'It freezes randomly', 'It never freezes', 'It freezes into squares'], 0],
    ],
  },
  clouds: {
    name: 'Clouds', type: 'Weather · Floating Water', emoji: '☁️', badge: 'Cloud Reader', build: 'cloud',
    mission: '☁️ Clouds look fluffy but they\'re made of billions of tiny water droplets. Ready to float up?',
    stats: [['Water droplets', 'Tiny ones'], ['Float', 'They\'re light'], ['Types', 'Fluffy to wispy'], ['Make rain', 'When heavy']],
    facts: ['☁️ A cloud is made of billions of tiny water droplets or ice crystals floating in the air.', '🎈 The droplets are so tiny and light that they float.', '🔀 There are different kinds — puffy cotton-wool clouds, flat sheets and high wispy ones.', '🌧️ When the droplets grow big and heavy, they fall as rain.'],
    fun: 'A fluffy cloud can weigh as much as 100 elephants — yet it floats, because the weight is spread over billions of tiny droplets!',
    quiz: [
      ['What are clouds made of?', ['Tiny water droplets', 'Cotton wool', 'Smoke', 'Feathers'], 0],
      { t: 'tf', q: 'When cloud droplets grow heavy, they can fall as rain.', answer: true },
      { t: 'pic', q: 'Which colour is a fluffy fair-weather cloud?', options: [
        { shape: 'circle', color: '#F4F7FF', label: 'White' }, { shape: 'circle', color: '#33313F', label: 'Black' }, { shape: 'circle', color: '#E23B2E', label: 'Red' }], answer: 0 },
    ],
    quizHard: [
      ['A cloud can weigh as much as 100 elephants but still floats. Why doesn\'t it fall?', ['Its weight is spread over billions of tiny droplets', 'It has wings', 'It is glued to the sky', 'It is not really heavy'], 0],
      { t: 'tf', q: 'Watching whether clouds are puffy or dark can help you guess the weather.', answer: true },
      ['Clouds are made of water droplets. So a cloud is really a floating part of what?', ['The water cycle', 'The ground', 'The Sun', 'A mountain'], 0],
    ],
  },
  wind: {
    name: 'Wind', type: 'Weather · Moving Air', emoji: '💨', badge: 'Breeze Boss', build: 'wind',
    mission: '💨 You can\'t see wind, but you can feel it and even catch it in a sail. Ready to chase the breeze?',
    stats: [['Moving air', 'That\'s wind'], ['Sun', 'Makes it blow'], ['Invisible', 'But you feel it'], ['Power', 'Turns turbines']],
    facts: ['💨 Wind is simply air on the move.', '☀️ The Sun heats some places more than others, and air flows from cooler to warmer spots — that\'s wind!', '👀 You can\'t see wind, but you can see what it does: bending trees, flying kites, filling sails.', '⚡ Wind can spin big turbines to make clean electricity.'],
    fun: 'The fastest wind gust ever measured raced at over 400 km/h — faster than a Formula 1 car!',
    quiz: [
      ['What is wind?', ['Moving air', 'Falling water', 'Warm sunshine', 'A kind of cloud'], 0],
      { t: 'tf', q: 'The Sun\'s heat helps make the wind blow.', answer: true },
      { t: 'pic', q: 'Which shape can wind fill to push a sailing boat?', options: [
        { shape: 'triangle', color: '#DCF2FF', label: 'Sail' }, { shape: 'circle', color: '#DCF2FF', label: 'Ball' }, { shape: 'square', color: '#DCF2FF', label: 'Box' }], answer: 0 },
    ],
    quizHard: [
      ['The Sun heats the ground unevenly. How does that make wind?', ['Air flows from cooler to warmer places', 'The Sun blows air', 'The ground shakes', 'Rain pushes it'], 0],
      { t: 'tf', q: 'We can\'t see wind itself, but we can see the trees and kites it moves.', answer: true },
      ['Wind turbines spin in the wind. What useful thing do they make?', ['Clean electricity', 'Rain', 'Snow', 'Sunshine'], 0],
    ],
  },
  tornado: {
    name: 'Tornado', type: 'Weather · Spinning Twister', emoji: '🌪️', badge: 'Twister Tracker', build: 'tornado',
    mission: '🌪️ A tornado is a spinning column of air that can lift a car! Ready to learn about nature\'s twister — safely?',
    stats: [['Spinning air', 'A column of it'], ['Funnel', 'Its shape'], ['Fast winds', 'Up to 480 km/h'], ['Go low', 'To stay safe']],
    facts: ['🌪️ A tornado is a fast-spinning column of air reaching from a storm cloud down to the ground.', '🏎️ Its winds can spin at up to 480 km/h — the fastest winds on Earth.', '📐 It\'s shaped like a funnel, wide at the top and narrow at the bottom.', '🏠 If one is near, people stay safe in a low, strong room away from windows.'],
    fun: 'Tornadoes spin so fast they can drive a piece of straw right into a tree trunk, like a tiny nail!',
    quiz: [
      ['What shape is a tornado?', ['A funnel', 'A ball', 'A cube', 'A flat sheet'], 0],
      { t: 'tf', q: 'Tornadoes have some of the fastest winds on Earth.', answer: true },
      { t: 'pic', q: 'Which shape looks most like a tornado\'s funnel?', options: [
        { shape: 'triangle', color: '#8FA0B0', label: 'Funnel' }, { shape: 'circle', color: '#8FA0B0', label: 'Ball' }, { shape: 'square', color: '#8FA0B0', label: 'Box' }], answer: 0 },
    ],
    quizHard: [
      ['A tornado\'s winds spin extremely fast. Why can that lift cars and roofs?', ['Fast spinning winds have huge force', 'Cars are light as air', 'It uses magnets', 'It blows gently'], 0],
      { t: 'tf', q: 'Staying low, in a strong room away from windows, helps keep people safe in a tornado.', answer: true },
      ['A tornado stretches from a storm cloud down to the ground. What connects the two?', ['The spinning funnel of air', 'A rope', 'A rainbow', 'A river'], 0],
    ],
  },
  watercycle: {
    name: 'Water Cycle', type: 'Weather · The Great Loop', emoji: '🔄', badge: 'Cycle Master', build: 'watercycle',
    mission: '🔄 Rain, clouds, rivers, sea — they\'re all part of one endless loop. Ready to ride the water cycle?',
    stats: [['Evaporation', 'Water rises'], ['Condensation', 'Clouds form'], ['Precipitation', 'Rain/snow falls'], ['Never ends', 'It loops forever']],
    facts: ['🔄 The water cycle is the endless journey water takes around our planet.', '☀️ The Sun warms seas and lakes, turning water into invisible vapour that rises (evaporation).', '☁️ High up it cools and forms clouds (condensation).', '🌧️ Then it falls as rain or snow (precipitation) and flows back to the sea to start again.'],
    fun: 'The water you drank today might once have been sipped by a dinosaur — the same water has cycled for billions of years!',
    quiz: [
      ['What powers the whole water cycle?', ['The Sun', 'The Moon', 'The wind only', 'Electricity'], 0],
      { t: 'tf', q: 'The water cycle repeats over and over, forever.', answer: true },
      { t: 'pic', q: 'In the water cycle, what falls from the clouds?', options: [
        { shape: 'drop', color: '#4BA6E8', label: 'Rain' }, { shape: 'star', color: '#4BA6E8', label: 'Stars' }, { shape: 'square', color: '#4BA6E8', label: 'Blocks' }], answer: 0 },
    ],
    quizHard: [
      ['The Sun turns sea water into vapour, which forms clouds, which rain back to the sea. What kind of path is that?', ['A never-ending loop', 'A straight line', 'A dead end', 'A one-way trip'], 0],
      { t: 'tf', q: 'Because the same water is recycled forever, today\'s rain could be very ancient water.', answer: true },
      ['Rain, clouds and snow are all steps of one system. What system ties them together?', ['The water cycle', 'The food chain', 'Gravity only', 'The seasons'], 0],
    ],
  },
};

/* ---------------- procedural weather stations ---------------- */
function buildWeather(THREE, kind) {
  const g = new THREE.Group();
  if (kind === 'rain' || kind === 'snow' || kind === 'thunder' || kind === 'cloud') {
    const dark = kind === 'thunder';
    const c = cloud(THREE, dark ? 0x5A6472 : 0xF4F7FF, 1.4);
    c.position.y = 3.5; g.add(c);
    if (kind === 'rain' || kind === 'snow') {
      const N = 90, geo = new THREE.BufferGeometry(), pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 6; pos[i * 3 + 1] = Math.random() * 6; pos[i * 3 + 2] = (Math.random() - 0.5) * 4; }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ color: kind === 'rain' ? 0x8FD0FF : 0xFFFFFF, size: kind === 'rain' ? 0.35 : 0.5, transparent: true, opacity: 0.85 });
      const pts = new THREE.Points(geo, mat); pts.position.y = 0.5; g.add(pts);
      g.userData.particles = { geo, N, speed: kind === 'rain' ? 10 : 3 };
    }
    if (kind === 'thunder') {
      const bolt = new THREE.Group();
      let x = 0, y = 3;
      for (let i = 0; i < 4; i++) {
        const seg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.2, 0.25), new THREE.MeshBasicMaterial({ color: 0xFFF07A }));
        x += (Math.random() - 0.5) * 0.9; y -= 0.9;
        seg.position.set(x, y, 0); seg.rotation.z = (Math.random() - 0.5) * 0.8; bolt.add(seg);
      }
      g.add(bolt); g.userData.bolt = bolt;
      const flash = new THREE.PointLight(0xFFF3B0, 0, 40); flash.position.y = 3; g.add(flash); g.userData.flash = flash;
    }
  } else if (kind === 'rainbow') {
    const cols = [0xE23B2E, 0xF2822A, 0xF6E15A, 0x6BCB77, 0x4BA6E8, 0x7A4BE8];
    cols.forEach((c, i) => {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(4.4 - i * 0.35, 0.18, 8, 40, Math.PI), new THREE.MeshBasicMaterial({ color: c }));
      arc.position.y = 1; g.add(arc);
    });
    const c1 = cloud(THREE, 0xF4F7FF, 0.8); c1.position.set(-4.4, 1, 0); g.add(c1);
    const c2 = cloud(THREE, 0xF4F7FF, 0.8); c2.position.set(4.4, 1, 0); g.add(c2);
  } else if (kind === 'wind') {
    for (let i = 0; i < 3; i++) {
      const swirl = new THREE.Mesh(new THREE.TorusGeometry(1.6 + i * 0.7, 0.14, 8, 30, Math.PI * 1.4),
        new THREE.MeshStandardMaterial({ color: 0xCFE6FF, transparent: true, opacity: 0.6, flatShading: true }));
      swirl.position.y = 2 + i * 1.2; swirl.rotation.x = 1.2; idle(swirl, 'sway', 0.3, 1 + i, 'z'); g.add(swirl);
    }
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 4), M(THREE, 0x6BCB77));
    leaf.position.set(2, 4, 0); idle(leaf, 'bobY', 0.5, 4); g.add(leaf);
  } else if (kind === 'tornado') {
    const funnel = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const r = 0.4 + i * 0.45;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.18, 8, 20),
        new THREE.MeshStandardMaterial({ color: 0x8FA0B0, transparent: true, opacity: 0.55, flatShading: true }));
      ring.position.y = 0.4 + i * 0.9; ring.rotation.x = Math.PI / 2; funnel.add(ring);
    }
    g.add(funnel); g.userData.funnel = funnel;
    const top = cloud(THREE, 0x6A7482, 1.2); top.position.y = 7; g.add(top);
  } else if (kind === 'watercycle') {
    const sun = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 12), new THREE.MeshBasicMaterial({ color: 0xF6D64A }));
    sun.position.set(-3.5, 5, 0); g.add(sun);
    const c = cloud(THREE, 0xF4F7FF, 0.9); c.position.set(2.5, 5.5, 0); g.add(c);
    const sea = new THREE.Mesh(new THREE.CircleGeometry(4, 24), new THREE.MeshStandardMaterial({ color: 0x3E8EDE, transparent: true, opacity: 0.8 }));
    sea.rotation.x = -Math.PI / 2; sea.position.y = 0.3; g.add(sea);
    const loop = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.14, 8, 40), new THREE.MeshStandardMaterial({ color: 0x5BF0A5, transparent: true, opacity: 0.5 }));
    loop.position.y = 3; g.add(loop); g.userData.loop = loop;
    // rising vapour + falling rain bits
    const N = 30, geo = new THREE.BufferGeometry(), pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 6; pos[i * 3 + 1] = Math.random() * 6; pos[i * 3 + 2] = (Math.random() - 0.5) * 2; }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const drops = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xBFE9FF, size: 0.35, transparent: true, opacity: 0.7 }));
    drops.position.y = 0.5; g.add(drops); g.userData.particles = { geo, N, speed: 4 };
  }
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  const keys = Object.keys(SUBJECTS);
  const R = 46;

  // A soft cloud floor + a few distant background clouds.
  const floor = new THREE.Mesh(new THREE.CircleGeometry(R + 30, 48),
    new THREE.MeshStandardMaterial({ color: 0x9FC0E8, roughness: 1, transparent: true, opacity: 0.25 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -6; group.add(floor);
  for (let i = 0; i < 6; i++) {
    const c = cloud(THREE, 0xC7D8EE, 2 + Math.random() * 2);
    const a = Math.random() * Math.PI * 2, d = R + 26 + Math.random() * 30;
    c.position.set(Math.cos(a) * d, 6 + Math.random() * 20, Math.sin(a) * d); group.add(c);
  }

  keys.forEach((key, i) => {
    const def = SUBJECTS[key];
    const holder = new THREE.Group();
    const item = buildWeather(THREE, def.build);
    holder.add(item);
    const p = ringPosition(i, keys.length, R, 5);
    holder.position.set(p.x, p.y + 2, p.z);
    holder.userData = { key, def, focusRadius: 8, bobPhase: Math.random() * 6, baseY: p.y + 2,
      anims: collectIdle(item), particles: item.userData.particles || null, funnel: item.userData.funnel || null,
      bolt: item.userData.bolt || null, flash: item.userData.flash || null, loop: item.userData.loop || null, flashT: Math.random() * 3 };
    attachMarker(THREE, holder, isDone(key), 6);
    clickables.push(holder);
    group.add(holder);
  });

  function update(dt, t, camera) {
    clickables.forEach((m) => {
      const u = m.userData;
      m.position.y = u.baseY + Math.sin(t * 0.6 + u.bobPhase) * 0.4;
      runIdle(u.anims, t);
      if (u.particles) {
        const arr = u.particles.geo.attributes.position.array;
        for (let i = 0; i < u.particles.N; i++) {
          arr[i * 3 + 1] -= dt * u.particles.speed;
          if (arr[i * 3 + 1] < 0) arr[i * 3 + 1] = 6;
        }
        u.particles.geo.attributes.position.needsUpdate = true;
      }
      if (u.funnel) u.funnel.rotation.y += dt * 4;
      if (u.loop) u.loop.rotation.z += dt * 0.6;
      if (u.bolt) {
        u.flashT -= dt;
        if (u.flashT <= 0) { u.flashT = 1.6 + Math.random() * 2; u._flash = 0.18; }
        if (u._flash > 0) { u._flash -= dt; u.bolt.visible = true; if (u.flash) u.flash.intensity = 6; }
        else { u.bolt.visible = false; if (u.flash) u.flash.intensity = 0; }
      }
    });
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, home: { radius: 118 } };
}

export default {
  key: 'weather',
  name: 'Weather & Sky',
  icon: '⛈️',
  blurb: 'Chase rain, lightning, and rainbows through the ever-changing sky.',
  unlockCost: 264,
  category: 'Earth & Sky',
  theme: { primary: 0x6FA8E0, secondary: 0xF6E15A, bg: 0x1a2e4a, light: 0xEAF2FF, ambient: 0x3a5578 },
  masterTitle: 'Weather Master ⛈️',
  subjects: SUBJECTS,
  build,
};
