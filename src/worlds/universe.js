import { attachMarker, updateMarkers, orbitLine } from './helpers.js';

/**
 * World 1 — Universe. The original CosmosQuest solar system, preserved intact
 * (Sun + 8 planets, Earth's Moon, Saturn's rings), plus the four Deep Space
 * mysteries which now live in an outer "deep space" cluster in the same scene
 * (the old star-gated toggle is replaced by the World Hub's progression).
 */

const SUBJECTS = {
  sun: { name: 'The Sun', type: 'Star', emoji: '☀️', color: 0xFFB84D, size: 9, dist: 0, speed: 0, badge: 'Sun Scholar',
    mission: '☀️ The Sun makes more energy in one second than humans ever have. Ready to meet our star?',
    stats: [['4.6 billion yrs', 'Age'], ['1.3 million', 'Earths fit inside'], ['5,500°C', 'Surface heat'], ['8 minutes', 'Light to reach Earth']],
    facts: ['🔥 The Sun is a giant ball of super-hot glowing gas — it is a STAR, not a planet!', '💪 It holds the whole solar system together with its gravity, like a cosmic magnet.', '⚡ In one second, the Sun makes more energy than humans have used in all of history.', '🌞 Sunlight you see right now left the Sun about 8 minutes ago. You\'re seeing the past!'],
    fun: 'If the Sun were a football, Earth would be a tiny peppercorn 26 metres away!',
    quiz: [['What is the Sun?', ['A giant star', 'A big planet', 'A moon', 'A comet'], 0],
      ['How long does sunlight take to reach Earth?', ['8 minutes', '8 seconds', '8 hours', '8 days'], 0],
      ['What keeps planets circling the Sun?', ['Gravity', 'Wind', 'Magnets on Earth', 'Rocket engines'], 0]] },
  mercury: { name: 'Mercury', type: 'Planet · Rocky', emoji: '🪨', color: 0xB8A28A, size: 1.1, dist: 16, speed: 0.9, badge: 'Speed Racer',
    mission: '🪨 One Mercury year is just 88 days — the fastest lap in the solar system. Race along?',
    stats: [['88 days', 'One year'], ['430°C', 'Day heat'], ['-180°C', 'Night cold'], ['0', 'Moons']],
    facts: ['🏃 Mercury is the fastest planet — it zooms around the Sun in just 88 days!', '🥵 Days are hot enough to melt metal, nights are colder than Antarctica.', '🕳️ Its surface is covered in craters, like our Moon — it got hit by lots of space rocks.', '📏 It\'s the smallest planet — only a bit bigger than our Moon.'],
    fun: 'A year on Mercury (88 days) is shorter than one Mercury day-night cycle (176 Earth days). Birthdays every 3 months!',
    quiz: [['Why is Mercury the "fastest" planet?', ['Shortest trip around the Sun', 'It spins fastest', 'It has rockets', 'It rolls downhill'], 0],
      ['How many moons does Mercury have?', ['Zero', 'One', 'Two', 'Fifty'], 0],
      ['What covers Mercury\'s surface?', ['Craters', 'Oceans', 'Forests', 'Ice cream'], 0]] },
  venus: { name: 'Venus', type: 'Planet · Rocky', emoji: '🌋', color: 0xE8C468, size: 1.7, dist: 22, speed: 0.7, badge: 'Cloud Walker',
    mission: '🌋 The hottest planet spins backwards, so the Sun rises in the west. Come see the strangest world?',
    stats: [['465°C', 'Hottest planet'], ['Backwards', 'It spins reverse'], ['243 days', 'One spin'], ['0', 'Moons']],
    facts: ['🔥 Venus is the HOTTEST planet — even hotter than Mercury! Its thick clouds trap heat like a blanket.', '🔄 Venus spins backwards. On Venus, the Sun rises in the west!', '☁️ Its clouds are made of acid — definitely no umbrella can help there.', '✨ It\'s the brightest thing in our night sky after the Moon. People call it the Evening Star.'],
    fun: 'A single day on Venus is longer than its whole year. Slowest spinner in the solar system!',
    quiz: [['Which planet is the hottest?', ['Venus', 'Mercury', 'Mars', 'Neptune'], 0],
      ['What\'s weird about how Venus spins?', ['It spins backwards', 'It doesn\'t spin', 'It spins in squares', 'It bounces'], 0],
      ['Why is Venus so hot?', ['Thick clouds trap heat', 'It\'s closest to the Sun', 'Volcano soup', 'It\'s on fire'], 0]] },
  earth: { name: 'Earth', type: 'Planet · Home 💙', emoji: '🌍', color: 0x3E8EDE, size: 1.8, dist: 29, speed: 0.55, hasMoon: true, badge: 'Home Hero',
    mission: '🌍 The only place we KNOW has life — including you! Ready to explore your home planet?',
    stats: [['71%', 'Covered in water'], ['1', 'Awesome Moon'], ['365 days', 'One year'], ['8+ million', 'Species live here']],
    facts: ['💙 Earth is the only place in the whole universe where we KNOW life exists — including YOU!', '🌊 From space, Earth looks blue because oceans cover most of it.', '🛡️ An invisible shield called the atmosphere protects us from space rocks and the Sun\'s rays.', '🌙 Our Moon causes ocean tides and slowly makes Earth\'s days longer.'],
    fun: 'Earth is not perfectly round — it bulges a little at the middle, like a slightly squashed ball!',
    quiz: [['How much of Earth is covered by water?', ['About 71%', 'About 10%', 'About 30%', '100%'], 0],
      ['What protects Earth from space rocks?', ['The atmosphere', 'A glass dome', 'Giant fans', 'Superheroes'], 0],
      ['Why does Earth look blue from space?', ['Oceans cover most of it', 'Blue paint', 'Blueberry forests', 'The sky is upside down'], 0]] },
  mars: { name: 'Mars', type: 'Planet · Rocky', emoji: '🔴', color: 0xD4593A, size: 1.4, dist: 36, speed: 0.45, badge: 'Red Ranger',
    mission: '🔴 Robots are driving on Mars right now, taking selfies. Ready to visit the rusty planet?',
    stats: [['2', 'Potato-shaped moons'], ['Olympus Mons', 'Tallest volcano ever'], ['-63°C', 'Average cold'], ['687 days', 'One year']],
    facts: ['🔴 Mars is red because its soil is full of rusty iron — it\'s literally a rusty planet!', '🌋 It has the tallest volcano in the solar system, Olympus Mons — 3x taller than Mount Everest.', '🤖 Robot rovers are driving on Mars RIGHT NOW, taking selfies and studying rocks.', '🧊 Mars has ice at its poles. Long ago it may have had rivers and lakes!'],
    fun: 'Humans might walk on Mars in your lifetime. Maybe the first Mars astronaut is reading this!',
    quiz: [['Why is Mars red?', ['Rusty iron in its soil', 'Tomato sauce', 'It\'s embarrassed', 'Red lights'], 0],
      ['What is Olympus Mons?', ['The tallest volcano known', 'A Greek god', 'A Mars city', 'A rover'], 0],
      ['What\'s driving around on Mars right now?', ['Robot rovers', 'School buses', 'Camels', 'Trains'], 0]] },
  jupiter: { name: 'Jupiter', type: 'Planet · Gas Giant', emoji: '🟠', color: 0xD9A066, size: 4.6, dist: 48, speed: 0.28, badge: 'Giant Guardian',
    mission: '🟠 The king of planets has a storm bigger than Earth raging for 350 years. Meet the giant?',
    stats: [['King', 'Biggest planet'], ['95+', 'Known moons'], ['350+ yrs', 'Storm still raging'], ['10 hours', 'Fastest day']],
    facts: ['👑 Jupiter is the KING of planets — all other planets could fit inside it together!', '🌀 The Great Red Spot is a storm bigger than Earth that has raged for over 350 years.', '🛡️ Jupiter\'s gravity pulls in comets and asteroids — it\'s like Earth\'s giant bodyguard.', '🌙 It has more than 95 moons. One of them, Europa, might have an ocean under its ice!'],
    fun: 'Jupiter spins so fast that its day is only 10 hours — the shortest day of any planet!',
    quiz: [['What is the Great Red Spot?', ['A giant storm', 'A volcano', 'A red moon', 'A sticker'], 0],
      ['Why is Jupiter Earth\'s "bodyguard"?', ['Its gravity catches space rocks', 'It has a shield', 'It shouts at asteroids', 'It\'s made of armour'], 0],
      ['How big is Jupiter?', ['Biggest planet of all', 'Smaller than Earth', 'Same as the Moon', 'Size of a car'], 0]] },
  saturn: { name: 'Saturn', type: 'Planet · Gas Giant', emoji: '🪐', color: 0xE3CFA0, size: 3.9, dist: 62, speed: 0.2, rings: true, badge: 'Ring Master',
    mission: '🪐 Saturn is so light it would float in a giant bathtub! Ready to spin its famous rings?',
    stats: [['Ice + rock', 'Rings are made of'], ['146+', 'Known moons'], ['Floats!', 'Lighter than water'], ['29 yrs', 'One year']],
    facts: ['💍 Saturn\'s famous rings are made of billions of chunks of ice and rock — some tiny, some house-sized!', '🛁 Saturn is so light it would FLOAT in a giant bathtub of water.', '🌙 Its moon Titan has lakes — but they\'re made of liquid gas, not water!', '🌀 A strange six-sided storm swirls at Saturn\'s north pole. A hexagon in space!'],
    fun: 'Saturn\'s rings are huge but super thin — like a pizza as wide as a city but thinner than a coin.',
    quiz: [['What are Saturn\'s rings made of?', ['Ice and rock chunks', 'Gold hoops', 'Rubber bands', 'Clouds'], 0],
      ['What would Saturn do in a giant bathtub?', ['Float', 'Sink', 'Melt', 'Explode'], 0],
      ['What shape is the storm on Saturn\'s north pole?', ['Hexagon', 'Circle', 'Triangle', 'Star'], 0]] },
  uranus: { name: 'Uranus', type: 'Planet · Ice Giant', emoji: '🧊', color: 0x8FD8E0, size: 2.6, dist: 74, speed: 0.14, badge: 'Sideways Star',
    mission: '🧊 This planet rolls on its side and might rain diamonds. Ready to tip the world sideways?',
    stats: [['Sideways', 'How it spins'], ['-224°C', 'Coldest planet'], ['84 yrs', 'One year'], ['28', 'Known moons']],
    facts: ['🤸 Uranus rolls around the Sun on its SIDE — like a bowling ball instead of a spinning top!', '🥶 It\'s the coldest planet, even colder than faraway Neptune.', '💎 Scientists think it might rain DIAMONDS deep inside Uranus!', '🔭 It was the first planet discovered with a telescope, in 1781.'],
    fun: 'Because it spins sideways, each pole on Uranus gets 42 years of daylight, then 42 years of night!',
    quiz: [['What\'s strange about how Uranus spins?', ['It spins on its side', 'It doesn\'t spin', 'It spins in zigzags', 'It spins twice a second'], 0],
      ['What might rain deep inside Uranus?', ['Diamonds', 'Chocolate', 'Fish', 'Snowballs'], 0],
      ['Which planet is the coldest?', ['Uranus', 'Mercury', 'Earth', 'Jupiter'], 0]] },
  neptune: { name: 'Neptune', type: 'Planet · Ice Giant', emoji: '🔵', color: 0x3F63D8, size: 2.5, dist: 85, speed: 0.11, badge: 'Wind Whisperer',
    mission: '🔵 Neptune was found using MATH before anyone saw it. Ready for the windiest world?',
    stats: [['2,100 km/h', 'Fastest winds'], ['165 yrs', 'One year'], ['Math!', 'How it was found'], ['16', 'Known moons']],
    facts: ['💨 Neptune has the fastest winds in the solar system — faster than a fighter jet!', '🔵 It\'s deep blue because of a gas called methane in its air.', '🧮 Neptune was discovered using MATH before anyone saw it in a telescope. Math is a superpower!', '🌙 Its moon Triton orbits backwards and shoots ice volcanoes.'],
    fun: 'Since it was discovered in 1846, Neptune has only completed ONE full trip around the Sun!',
    quiz: [['What is Neptune famous for?', ['Fastest winds', 'Hottest surface', 'Most rings', 'Talking moons'], 0],
      ['How was Neptune discovered?', ['With math predictions', 'By accident', 'By astronauts', 'In a dream'], 0],
      ['Why is Neptune blue?', ['Methane gas', 'Blue oceans', 'Blue paint', 'Sad feelings'], 0]] },
  // ---- Deep Space cluster (outer region) ----
  blackhole: { name: 'Black Hole', type: 'Deep Space · Gravity Monster', emoji: '🕳️', color: 0x05050C, pos: [-120, 18, -40], badge: 'Gravity Master',
    mission: '🕳️ Nothing escapes a black hole — not even light. Dare to peek at the darkest thing in space?',
    stats: [['Nothing', 'Escapes it — not even light'], ['Sagittarius A*', 'Our galaxy\'s giant one'], ['Spaghettification', 'Real science word!'], ['2019', 'First real photo']],
    facts: ['🕳️ A black hole has gravity SO strong that nothing can escape — not even light. That\'s why it looks black!', '🍝 If you fell in, you\'d stretch like spaghetti. Scientists really call it "spaghettification"!', '🌀 A supermassive black hole sits at the centre of our galaxy — 4 million times heavier than the Sun.', '📸 In 2019, scientists took the first-ever real photo of a black hole. It looks like a glowing donut!'],
    fun: 'Black holes don\'t "suck" like vacuum cleaners. If the Sun became one, Earth would keep orbiting normally — just in the dark!',
    quiz: [['What can escape a black hole?', ['Nothing at all', 'Only light', 'Only rockets', 'Only sound'], 0],
      ['What\'s at the centre of our galaxy?', ['A supermassive black hole', 'A giant lamp', 'Earth', 'A star factory only'], 0],
      ['What do scientists call the stretching inside a black hole?', ['Spaghettification', 'Noodlification', 'Stretchy-time', 'Pizzafication'], 0]] },
  galaxy: { name: 'Milky Way Galaxy', type: 'Deep Space · Our Star City', emoji: '🌌', color: 0xC9B8FF, pos: [120, 26, -50], size: 6, badge: 'Galaxy Guide',
    mission: '🌌 You live inside a spinning city of 200 billion stars. Ready to see the whole Milky Way?',
    stats: [['200+ billion', 'Stars inside'], ['100,000 yrs', 'Light to cross it'], ['Spiral', 'Its shape'], ['2 trillion', 'Galaxies in universe']],
    facts: ['🌌 The Milky Way is our home galaxy — a giant spinning city of over 200 BILLION stars!', '🌀 It\'s shaped like a spiral with swirling arms. Our Sun lives in one of the quiet arms.', '🚗 Even travelling at light speed, crossing the Milky Way would take 100,000 years.', '🔭 The universe has about 2 TRILLION galaxies. Ours is just one!'],
    fun: 'You are riding the galaxy right now — our whole solar system zooms around the Milky Way at 800,000 km/h!',
    quiz: [['What is the Milky Way?', ['Our home galaxy', 'A chocolate bar in space', 'A single star', 'A planet'], 0],
      ['Roughly how many stars live in it?', ['200+ billion', 'One hundred', 'Nine', 'A dozen'], 0],
      ['What shape is the Milky Way?', ['Spiral', 'Cube', 'Triangle', 'Banana'], 0]] },
  nebula: { name: 'Nebula', type: 'Deep Space · Star Nursery', emoji: '☁️', color: 0xFF6BD6, pos: [-90, -20, -120], size: 5, badge: 'Star Midwife',
    mission: '☁️ Baby stars are born inside these glowing clouds. Ready to visit space\'s nursery?',
    stats: [['Star nursery', 'Where stars are born'], ['Gas + dust', 'What it\'s made of'], ['Light-years', 'How big they are'], ['Orion', 'Famous one you can see']],
    facts: ['☁️ A nebula is a giant glowing cloud of gas and dust — it\'s where baby stars are BORN!', '✨ Gravity squeezes the cloud tighter and tighter until — WHOOSH — a new star lights up.', '🌈 Nebulae glow in amazing colours: pink, green, blue — space\'s own fireworks.', '🔭 You can see the Orion Nebula with your own eyes on a dark night — look below Orion\'s belt!'],
    fun: 'Our Sun was born in a nebula 4.6 billion years ago. That cloud was the Sun\'s nursery — and yours too!',
    quiz: [['What is born inside a nebula?', ['Stars', 'Fish', 'Planets only', 'Rainbows'], 0],
      ['What is a nebula made of?', ['Gas and dust', 'Water', 'Candy floss', 'Metal'], 0],
      ['Which force squeezes gas into a new star?', ['Gravity', 'Wind', 'Electricity bills', 'Magnets'], 0]] },
  comet: { name: 'Comet', type: 'Deep Space · Dirty Snowball', emoji: '☄️', color: 0xBFE8FF, pos: [95, -18, -110], size: 2, badge: 'Comet Chaser',
    mission: '☄️ A comet\'s glowing tail can stretch millions of km. Ready to chase a dirty snowball?',
    stats: [['Ice + dust', 'What it\'s made of'], ['Millions of km', 'Tail length'], ['Halley\'s', 'Returns every 76 yrs'], ['Away from Sun', 'Tail always points']],
    facts: ['☄️ A comet is a giant dirty snowball of ice and dust left over from when the solar system formed.', '🔥 When it flies near the Sun, its ice turns to gas and grows a glowing tail millions of km long!', '🧭 The tail always points AWAY from the Sun — pushed by sunlight itself.', '🗓️ Halley\'s Comet visits Earth every 76 years. Next show: the year 2061!'],
    fun: 'Shooting stars aren\'t stars — they\'re tiny bits of comet dust burning up in our sky. Make a wish anyway!',
    quiz: [['What is a comet mostly made of?', ['Ice and dust', 'Lava', 'Cheese', 'Glass'], 0],
      ['Which way does a comet\'s tail point?', ['Away from the Sun', 'Toward Earth', 'Straight down', 'In circles'], 0],
      ['What are "shooting stars" really?', ['Comet dust burning in our sky', 'Falling stars', 'Fireflies', 'Aeroplanes'], 0]] },
};

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];

  Object.keys(SUBJECTS).forEach((key) => {
    const def = SUBJECTS[key];
    const pivot = new THREE.Group();
    group.add(pivot);

    const mat = new THREE.MeshStandardMaterial({
      color: def.color, roughness: 0.75, metalness: 0.05,
      emissive: def.color, emissiveIntensity: key === 'sun' ? 0.9 : 0.12,
    });
    const size = def.size || 3;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 40, 40), mat);

    if (def.pos) mesh.position.set(def.pos[0], def.pos[1], def.pos[2]);
    else mesh.position.x = def.dist;
    pivot.add(mesh);

    mesh.userData = { key, def, pivot, angle: Math.random() * Math.PI * 2, phase: Math.random() * 6 };
    clickables.push(mesh);
    attachMarker(THREE, mesh, isDone(key), size);

    if (def.dist > 0) group.add(orbitLine(THREE, def.dist));

    if (def.rings) {
      const r = new THREE.Mesh(new THREE.RingGeometry(size * 1.4, size * 2.2, 60),
        new THREE.MeshBasicMaterial({ color: 0xD9C79A, side: THREE.DoubleSide, transparent: true, opacity: 0.55 }));
      r.rotation.x = Math.PI / 2.25; mesh.add(r);
    }
    if (def.hasMoon) {
      const mp = new THREE.Group(); mesh.add(mp);
      const moon = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 20),
        new THREE.MeshStandardMaterial({ color: 0xC9C9D4, roughness: 0.9 }));
      moon.position.x = 3.4; mp.add(moon); mesh.userData.moonPivot = mp;
    }
    if (key === 'sun') {
      const halo = new THREE.Mesh(new THREE.SphereGeometry(size * 1.25, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xFF9C33, transparent: true, opacity: 0.18 }));
      mesh.add(halo);
    }
    if (key === 'blackhole') {
      mat.emissiveIntensity = 0; mat.color.set(0x05050C);
      const disk = new THREE.Mesh(new THREE.RingGeometry(size * 1.15, size * 2.4, 70),
        new THREE.MeshBasicMaterial({ color: 0xFF8C1A, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }));
      disk.rotation.x = Math.PI / 2.4; mesh.add(disk); mesh.userData.disk = disk;
      const rim = new THREE.Mesh(new THREE.SphereGeometry(size * 1.04, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xFFB84D, transparent: true, opacity: 0.25, side: THREE.BackSide }));
      mesh.add(rim);
    }
    if (key === 'galaxy') {
      mat.transparent = true; mat.opacity = 0.35;
      const g = new THREE.BufferGeometry(), n = 900, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const arm = (i % 3) * (Math.PI * 2 / 3), tt = Math.random() * 4;
        const a = arm + tt * 1.6, r = tt * 2.6 + Math.random();
        pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = (Math.random() - 0.5) * 0.9; pos[i * 3 + 2] = Math.sin(a) * r;
        const c = new THREE.Color().setHSL(0.7 + Math.random() * 0.15, 0.8, 0.7);
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const spiral = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.5, vertexColors: true, transparent: true, opacity: 0.95 }));
      mesh.add(spiral); mesh.userData.spiral = spiral;
    }
    if (key === 'nebula') {
      mat.transparent = true; mat.opacity = 0.5; mat.emissiveIntensity = 0.5;
      for (let i = 0; i < 7; i++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(size * (0.5 + Math.random() * 0.7), 18, 18),
          new THREE.MeshBasicMaterial({ color: [0xFF6BD6, 0xB26CFF, 0x4DE3FF][i % 3], transparent: true, opacity: 0.14 }));
        puff.position.set((Math.random() - 0.5) * size * 2, (Math.random() - 0.5) * size, (Math.random() - 0.5) * size * 2);
        mesh.add(puff);
      }
    }
    if (key === 'comet') {
      const tail = new THREE.Mesh(new THREE.ConeGeometry(size * 0.8, size * 7, 16, 1, true),
        new THREE.MeshBasicMaterial({ color: 0x9FE8FF, transparent: true, opacity: 0.3, side: THREE.DoubleSide }));
      tail.rotation.z = Math.PI / 2; tail.position.x = size * 3.5; mesh.add(tail);
    }
  });

  function update(dt, t, camera) {
    clickables.forEach((m) => {
      const u = m.userData;
      if (u.def.dist > 0) {
        u.angle += u.def.speed * dt * 0.6;
        m.position.set(Math.cos(u.angle) * u.def.dist, 0, Math.sin(u.angle) * u.def.dist);
      }
      m.rotation.y += dt * 0.4;
      if (u.moonPivot) u.moonPivot.rotation.y += dt * 1.6;
      if (u.disk) u.disk.rotation.z += dt * 0.8;
      if (u.spiral) u.spiral.rotation.y += dt * 0.15;
    });
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, home: { radius: 118 } };
}

export default {
  key: 'universe',
  name: 'Universe',
  icon: '🪐',
  blurb: 'Fly the solar system, meet the Sun & 8 planets, then reach deep space.',
  unlockCost: 0,
  theme: { primary: 0x4DE3FF, secondary: 0xB26CFF, bg: 0x070B1F, light: 0xFFDFAA, ambient: 0x445588 },
  category: 'Science & Space',
  masterTitle: 'Cosmic Master 🌌',
  subjects: SUBJECTS,
  build,
};
