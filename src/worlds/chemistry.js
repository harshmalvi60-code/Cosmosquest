import { attachMarker, updateMarkers, ringPosition } from './helpers.js';
import { idle, collectIdle, runIdle } from './anim.js';

/**
 * World 18 — Chemistry & Matter. A floating lab-bench: subjects sit above a
 * glowing bench and a background particle cloud slowly morphs between solid
 * (neat grid), liquid (loose jiggle) and gas (spread out) as ambient motion,
 * echoing the States-of-Matter idea. Abstract subjects (Atoms, Elements, Data-
 * like Reactions) use clear procedural symbols.
 */

const M = (THREE, c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0.1, flatShading: true, ...o });

const SUBJECTS = {
  states: {
    name: 'States of Matter', type: 'Chemistry · Solid, Liquid, Gas', emoji: '🧊', badge: 'State Shifter', build: 'states',
    mission: '🧊💧☁️ Ice, water, steam — all the SAME stuff in three forms! Ready to change states?',
    stats: [['Solid', 'Holds its shape'], ['Liquid', 'Flows & pours'], ['Gas', 'Spreads out'], ['Same stuff', 'Just rearranged']],
    facts: ['🧊 Matter comes in three main states: solid, liquid and gas.', '🔒 In a solid, tiny particles are packed tight and hold their shape.', '🌊 In a liquid they slide past each other and flow.', '☁️ In a gas they zoom apart and fill any space — and heating or cooling changes one into another.'],
    fun: 'Water is one of the few things you can easily see as a solid, a liquid AND a gas — ice, water, and steam!',
    quiz: [
      ['What are the three main states of matter?', ['Solid, liquid, gas', 'Big, medium, small', 'Hot, warm, cold', 'Red, green, blue'], 0],
      { t: 'tf', q: 'Ice, water and steam are all made of water.', answer: true },
      { t: 'pic', q: 'Which state holds its own shape?', options: [
        { shape: 'square', color: '#8FD0FF', label: 'Solid' }, { shape: 'oval', color: '#8FD0FF', label: 'Liquid' }, { shape: 'circle', color: '#8FD0FF', label: 'Gas' }], answer: 0 },
    ],
    quizHard: [
      ['Ice melts to water, then boils to steam. What is doing the changing?', ['Heating (adding warmth)', 'Painting it', 'Shaking it', 'Nothing'], 0],
      { t: 'tf', q: 'In a gas, the particles are much more spread out than in a solid.', answer: true },
      ['Ice and steam are both water, just rearranged. What does that tell you about the three states?', ['They can be the same stuff in different forms', 'They are totally different materials', 'They can never change', 'Only ice is real'], 0],
    ],
  },
  atoms: {
    name: 'Atoms', type: 'Chemistry · Building Blocks', emoji: '⚛️', badge: 'Atom Ace', build: 'atoms',
    mission: '⚛️ Everything around you is built from unimaginably tiny atoms. Ready to zoom into the building blocks?',
    stats: [['Building blocks', 'Of everything'], ['Tiny', 'Too small to see'], ['Mostly empty', 'Inside an atom'], ['Join up', 'To make stuff']],
    facts: ['⚛️ Atoms are the tiny building blocks that everything is made of — you, air, water, stars.', '🔬 They\'re far too small to see, even with most microscopes.', '🌌 An atom is mostly empty space, with a tiny centre and even tinier bits whizzing around it.', '🔗 Atoms join together to make everything around us.'],
    fun: 'There are more atoms in a single glass of water than there are glasses of water in all the oceans on Earth!',
    quiz: [
      ['What are atoms?', ['The tiny building blocks of everything', 'A kind of animal', 'A type of star', 'A colour'], 0],
      { t: 'tf', q: 'Everything around you is made of atoms.', answer: true },
      { t: 'pic', q: 'Atoms are super tiny. Tap the smallest!', options: [
        { shape: 'circle', color: '#B26CFF', label: '', size: 1 }, { shape: 'circle', color: '#B26CFF', label: '', size: 0.55 }, { shape: 'circle', color: '#B26CFF', label: '', size: 0.28 }], answer: 2 },
    ],
    quizHard: [
      ['You, air and water are all made of atoms. What does that mean about you?', ['You are built from countless tiny atoms', 'You have no atoms', 'You are one big atom', 'Atoms avoid people'], 0],
      { t: 'tf', q: 'Since an atom is mostly empty space, solid things are mostly empty space too!', answer: true },
      ['Atoms join together in different ways. What does that let them make?', ['All the different materials around us', 'Only water', 'Only gold', 'Nothing new'], 0],
    ],
  },
  water: {
    name: 'Water (H₂O)', type: 'Chemistry · Life\'s Liquid', emoji: '💧', badge: 'H₂O Hero', build: 'water',
    mission: '💧 Every water drop is two hydrogen atoms holding hands with one oxygen. Ready to meet H₂O?',
    stats: [['H₂O', 'Its recipe'], ['2 + 1', 'Hydrogen + oxygen'], ['Life', 'Everything needs it'], ['Dissolves', 'Lots of things']],
    facts: ['💧 Water\'s scientific name is H₂O — each drop is two hydrogen atoms joined to one oxygen atom.', '🌱 Every living thing needs water to survive.', '🧪 Water dissolves so many things it\'s called the "universal solvent".', '🧍 Your own body is about two-thirds water!'],
    fun: 'About two-thirds of YOUR body is water — you\'re basically a walking, talking water balloon with a skeleton!',
    quiz: [
      ['What is water made of?', ['Hydrogen and oxygen', 'Iron and gold', 'Sugar and salt', 'Just air'], 0],
      { t: 'tf', q: 'Every living thing needs water to survive.', answer: true },
      { t: 'pic', q: 'Which colour do we usually show water?', options: [
        { shape: 'drop', color: '#4BA6E8', label: 'Blue' }, { shape: 'drop', color: '#E23B2E', label: 'Red' }, { shape: 'drop', color: '#33313F', label: 'Black' }], answer: 0 },
    ],
    quizHard: [
      ['Water is written H₂O. What does the little "2" tell you?', ['There are two hydrogen atoms', 'It is very heavy', 'It costs two coins', 'It is two drops'], 0],
      { t: 'tf', q: 'Because water dissolves so many things, it can carry nutrients around living bodies.', answer: true },
      ['Your body is about two-thirds water. Why is drinking water so important?', ['Your body needs to top it up', 'To change colour', 'To grow fur', 'It isn\'t important'], 0],
    ],
  },
  magnets: {
    name: 'Magnets', type: 'Chemistry · Invisible Pull', emoji: '🧲', badge: 'Magnet Master', build: 'magnets',
    mission: '🧲 A magnet\'s invisible power can pull metal without even touching it. Ready to feel the force?',
    stats: [['Iron', 'It pulls'], ['2 poles', 'North & south'], ['Opposites', 'Attract'], ['Earth', 'A giant magnet']],
    facts: ['🧲 A magnet pulls on iron and a few other metals, even without touching them.', '🧭 Every magnet has two ends called poles: north and south.', '↔️ Opposite poles attract (pull together), but like poles repel (push apart).', '🌍 The whole Earth is like a giant magnet — that\'s how a compass works!'],
    fun: 'The Earth itself is a giant magnet — its magnetic pull is what makes a compass needle always point north!',
    quiz: [
      ['What do magnets pull on?', ['Iron and some metals', 'Wood', 'Water', 'Paper'], 0],
      { t: 'tf', q: 'Opposite magnet poles attract each other.', answer: true },
      { t: 'pic', q: 'Which shape is a classic horseshoe magnet?', options: [
        { shape: 'crescent', color: '#E23B2E', label: 'Horseshoe' }, { shape: 'square', color: '#E23B2E', label: 'Block' }, { shape: 'star', color: '#E23B2E', label: 'Star' }], answer: 0 },
    ],
    quizHard: [
      ['Two magnets sometimes push apart and sometimes pull together. What decides which?', ['Whether the poles are the same or opposite', 'Their colour', 'The day of the week', 'How shiny they are'], 0],
      { t: 'tf', q: 'A compass works because the Earth acts like a giant magnet.', answer: true },
      ['A magnet can pull a paperclip without touching it. What is doing the pulling?', ['An invisible magnetic force', 'A tiny string', 'Air', 'Static hair'], 0],
    ],
  },
  mixtures: {
    name: 'Mixtures', type: 'Chemistry · Mix & Separate', emoji: '🥣', badge: 'Mix Master', build: 'mixtures',
    mission: '🥣 Mix things together and they can often be UN-mixed again. Ready to stir up some mixtures?',
    stats: [['Combine', 'Two+ things'], ['No change', 'Still themselves'], ['Separate', 'Can be undone'], ['Salt water', 'A mixture']],
    facts: ['🥣 A mixture is two or more things combined, but not turned into something new.', '🔄 The parts keep being themselves, so a mixture can often be separated again.', '🧂 Salt dissolved in water is a mixture — let the water dry and the salt comes back!', '🧲 You can even pull iron bits out of a sand mixture with a magnet.'],
    fun: 'Mix sand and iron filings, then hold a magnet nearby — the iron leaps out, leaving the sand behind!',
    quiz: [
      ['What is a mixture?', ['Things combined but not changed', 'A brand-new material', 'A kind of atom', 'A magnet'], 0],
      { t: 'tf', q: 'A mixture can often be separated back into its parts.', answer: true },
      { t: 'pic', q: 'What can pull iron out of a sand mixture?', options: [
        { shape: 'crescent', color: '#E23B2E', label: 'A magnet' }, { shape: 'circle', color: '#4BA6E8', label: 'Water' }, { shape: 'square', color: '#6BCB77', label: 'A leaf' }], answer: 0 },
    ],
    quizHard: [
      ['Salt water is a mixture. If you let the water dry away, what happens?', ['The salt is left behind', 'The salt vanishes forever', 'It turns to gold', 'Nothing at all'], 0],
      { t: 'tf', q: 'In a mixture the parts stay themselves, which is why they can be separated.', answer: true },
      ['A magnet pulls iron out of sand but leaves the sand. Why does that work?', ['Iron is magnetic but sand is not', 'Sand is heavier', 'The magnet eats iron', 'Sand hides'], 0],
    ],
  },
  elements: {
    name: 'Elements', type: 'Chemistry · Nature\'s Alphabet', emoji: '🧪', badge: 'Element Expert', build: 'elements',
    mission: '🧪 Everything is built from about 118 basic ingredients called elements. Ready to explore nature\'s alphabet?',
    stats: [['~118', 'Known elements'], ['Pure', 'One kind of atom'], ['Periodic table', 'Lists them all'], ['Combine', 'Make everything']],
    facts: ['🧪 An element is a pure substance made of just one kind of atom.', '🔢 There are about 118 known elements, like oxygen, gold, iron and helium.', '📋 Scientists organise them all in a chart called the periodic table.', '🔗 Elements combine to make everything else — water is oxygen + hydrogen!'],
    fun: 'Just about 118 elements combine in endless ways to make EVERYTHING — like an alphabet building every word!',
    quiz: [
      ['What is an element?', ['A pure substance of one kind of atom', 'A big mixture', 'A machine', 'A planet'], 0],
      { t: 'tf', q: 'Elements are listed in a chart called the periodic table.', answer: true },
      { t: 'pic', q: 'Which shape matches the periodic table (a grid/chart)?', options: [
        { shape: 'square', color: '#5BC0DE', label: 'Grid' }, { shape: 'circle', color: '#5BC0DE', label: 'Ball' }, { shape: 'triangle', color: '#5BC0DE', label: 'Cone' }], answer: 0 },
    ],
    quizHard: [
      ['About 118 elements make everything in the universe. What is a good way to picture that?', ['Like letters of an alphabet building all words', 'Like one big rock', 'Like a single colour', 'Like empty space'], 0],
      { t: 'tf', q: 'Water is not an element, because it is made of two elements joined together.', answer: true },
      ['An element is made of just one kind of atom. What makes gold an element?', ['It is made of only gold atoms', 'It is shiny', 'It is heavy', 'It is expensive'], 0],
    ],
  },
  gold: {
    name: 'Gold', type: 'Chemistry · The Prized Metal', emoji: '🥇', badge: 'Gold Digger', build: 'gold',
    mission: '🥇 Gold never rusts and stays shiny for thousands of years. Ready to dig into the most prized metal?',
    stats: [['Element', 'A pure metal'], ['Never rusts', 'Stays shiny'], ['Rare', 'Hard to find'], ['Bendable', 'Very soft']],
    facts: ['🥇 Gold is a shiny yellow metal and one of the elements.', '✨ It never rusts or tarnishes, so it stays shiny for thousands of years.', '💎 It\'s rare and hard to find, which makes it valuable.', '🔨 Gold is so soft it can be hammered into sheets thin enough to see through!'],
    fun: 'Gold is so bendable that a single gram can be hammered into a sheet big enough to cover a small table!',
    quiz: [
      ['Why does gold stay shiny for thousands of years?', ['It doesn\'t rust or tarnish', 'It is painted', 'It is cleaned daily', 'It glows'], 0],
      { t: 'tf', q: 'Gold is one of the elements.', answer: true },
      { t: 'pic', q: 'Which colour is gold?', options: [
        { shape: 'circle', color: '#E3B23C', label: 'Gold' }, { shape: 'circle', color: '#8FA0B0', label: 'Silver' }, { shape: 'circle', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['Ancient gold treasures still shine today. What does that tell you about gold?', ['It doesn\'t rust or tarnish over time', 'It is brand new', 'It was just cleaned', 'It is fake'], 0],
      { t: 'tf', q: 'Because gold is rare and doesn\'t rust, people have prized it for thousands of years.', answer: true },
      ['Gold can be hammered into see-through sheets. What does that tell you about gold?', ['It is very soft and bendable', 'It is hard as diamond', 'It is a gas', 'It is liquid'], 0],
    ],
  },
  reactions: {
    name: 'Reactions', type: 'Chemistry · Making New Stuff', emoji: '💥', badge: 'Reaction Ranger', build: 'reactions',
    mission: '💥 Mix the right things and — POP — you get something brand new! Ready to spark a reaction?',
    stats: [['New stuff', 'Is made'], ['Change', 'Often can\'t undo'], ['Signs', 'Bubbles, heat, colour'], ['Baking', 'Is a reaction']],
    facts: ['💥 A chemical reaction is when substances change into something new.', '🔒 Unlike a mixture, you usually can\'t easily get the old things back.', '🫧 Signs of a reaction include bubbles, heat, light, or a colour change.', '🎂 Baking a cake, rusting iron, and burning wood are all reactions!'],
    fun: 'Mix baking soda and vinegar and it fizzes like crazy — that bubbling is a real chemical reaction making a new gas!',
    quiz: [
      ['What happens in a chemical reaction?', ['Substances change into something new', 'Nothing changes', 'Things get colder only', 'Colours disappear'], 0],
      { t: 'tf', q: 'Baking a cake is a kind of chemical reaction.', answer: true },
      { t: 'pic', q: 'Which is a sign of a chemical reaction?', options: [
        { shape: 'circle', color: '#8FD0FF', label: 'Bubbles' }, { shape: 'square', color: '#6E6E7A', label: 'Nothing' }, { shape: 'triangle', color: '#6E6E7A', label: 'Silence' }], answer: 0 },
    ],
    quizHard: [
      ['You can un-mix a mixture, but not un-do most reactions. What does that tell you about a reaction?', ['It makes truly new substances', 'It changes nothing', 'It is the same as a mixture', 'It is imaginary'], 0],
      { t: 'tf', q: 'Bubbles, heat and colour changes are clues that a reaction is happening.', answer: true },
      ['Rusting iron is a reaction. Why can\'t you easily turn rust back into shiny iron?', ['The iron changed into a new substance', 'Rust is a mixture', 'Iron is a gas', 'You can, easily'], 0],
    ],
  },
};

/* ---------------- procedural chemistry symbols ---------------- */
function buildChem(THREE, kind) {
  const g = new THREE.Group();
  const beaker = (c) => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.2, 3, 16, 1, true), M(THREE, c ?? 0xBFE9FF, { transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    b.position.y = 2; g.add(b); return b;
  };
  if (kind === 'states') {
    beaker();
    const parts = [];
    for (let i = 0; i < 18; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), M(THREE, 0x8FD0FF)); g.add(p); parts.push(p); }
    g.userData.stateParts = parts;
  } else if (kind === 'atoms' || kind === 'water') {
    if (kind === 'water') {
      const o = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 12), M(THREE, 0xE23B2E)); o.position.y = 2.4; g.add(o);
      for (const dx of [1, -1]) { const h = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 10), M(THREE, 0xF2F4F7)); h.position.set(dx * 1.2, 3.2, 0); g.add(h); }
    } else {
      const nuc = new THREE.Mesh(new THREE.SphereGeometry(0.7, 14, 12), M(THREE, 0xF2A93B, { emissive: 0x5a3a10, emissiveIntensity: 0.3 })); nuc.position.y = 2.6; g.add(nuc);
      const orbits = new THREE.Group(); orbits.position.y = 2.6; g.add(orbits); g.userData.orbits = orbits;
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4 + i * 0.5, 0.03, 6, 32), M(THREE, 0x4BA6E8, { emissive: 0x14304a, emissiveIntensity: 0.3 }));
        ring.rotation.set(Math.random() * 3, Math.random() * 3, 0); orbits.add(ring);
        const e = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), M(THREE, 0x8FD0FF)); e.position.x = 1.4 + i * 0.5; ring.add(e);
      }
    }
  } else if (kind === 'magnets') {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.4, 10, 20, Math.PI), M(THREE, 0x9A968C, { metalness: 0.6, roughness: 0.3 }));
    arc.position.y = 2.4; arc.rotation.z = Math.PI; g.add(arc);
    const nP = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1, 12), M(THREE, 0xE23B2E)); nP.position.set(-1.2, 2, 0); g.add(nP);
    const sP = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1, 12), M(THREE, 0x4BA6E8)); sP.position.set(1.2, 2, 0); g.add(sP);
    for (let i = 0; i < 4; i++) { const bit = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), M(THREE, 0x8A909A)); bit.position.set((Math.random() - 0.5) * 2, 0.5, (Math.random() - 0.5)); idle(bit, 'bobY', 0.15, 3 + i); g.add(bit); }
  } else if (kind === 'mixtures') {
    beaker(0xD8C4A0);
    for (let i = 0; i < 20; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), M(THREE, i % 2 ? 0xE3B23C : 0x8FA0B0)); p.position.set((Math.random() - 0.5) * 2, 1 + Math.random() * 2, (Math.random() - 0.5) * 2); idle(p, 'bobY', 0.1, 2 + i * 0.2); g.add(p); }
  } else if (kind === 'elements') {
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      const cell = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.2), M(THREE, new THREE.Color().setHSL((r * 5 + c) / 15, 0.6, 0.55).getHex(), { emissive: 0x111133, emissiveIntensity: 0.2 }));
      cell.position.set((c - 2) * 0.8, 3.4 - r * 0.8, 0); g.add(cell);
    }
  } else if (kind === 'gold') {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1, 1.2), M(THREE, 0xE3B23C, { metalness: 0.7, roughness: 0.2 }));
    bar.position.y = 1.6; bar.rotation.y = 0.3; idle(bar, 'bobY', 0.15, 1.5); g.add(bar);
    const bar2 = bar.clone(); bar2.position.set(0.3, 2.6, 0); bar2.rotation.y = -0.2; g.add(bar2);
    for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.TetrahedronGeometry(0.15), new THREE.MeshBasicMaterial({ color: 0xFFF3B0 })); s.position.set((Math.random() - 0.5) * 3, 2 + Math.random() * 2, (Math.random() - 0.5) * 2); idle(s, 'bobY', 0.2, 3 + i); g.add(s); }
  } else if (kind === 'reactions') {
    const flask = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.4, 16, 1, true), M(THREE, 0xBFE9FF, { transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    flask.position.y = 1.6; g.add(flask);
    const liquid = new THREE.Mesh(new THREE.ConeGeometry(1, 1.2, 16), M(THREE, 0x6BCB77, { transparent: true, opacity: 0.7 })); liquid.position.y = 1; g.add(liquid);
    const bubbles = [];
    for (let i = 0; i < 8; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), M(THREE, 0xEAFBE0, { transparent: true, opacity: 0.8 })); b.position.set((Math.random() - 0.5) * 1.2, 1 + Math.random() * 2, 0); g.add(b); bubbles.push(b); }
    g.userData.bubbles = bubbles;
  }
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  const keys = Object.keys(SUBJECTS);
  const R = 46;

  // Glowing lab bench.
  const bench = new THREE.Mesh(new THREE.CircleGeometry(R + 20, 48), new THREE.MeshBasicMaterial({ color: 0x1a3350, transparent: true, opacity: 0.3, side: THREE.DoubleSide }));
  bench.rotation.x = -Math.PI / 2; bench.position.y = -1; group.add(bench);

  // Background particle cloud that morphs solid -> liquid -> gas.
  const N = 120, geo = new THREE.BufferGeometry(), pos = new Float32Array(N * 3), home = [];
  for (let i = 0; i < N; i++) {
    const gx = (i % 6 - 2.5) * 4, gy = (Math.floor(i / 6) % 5) * 4 + 4, gz = (Math.floor(i / 30) - 2) * 4;
    home.push([gx, gy, gz]); pos[i * 3] = gx; pos[i * 3 + 1] = gy; pos[i * 3 + 2] = gz;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const cloud = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x6FA8E0, size: 0.7, transparent: true, opacity: 0.4 }));
  group.add(cloud);

  keys.forEach((key, i) => {
    const def = SUBJECTS[key];
    const holder = new THREE.Group();
    const item = buildChem(THREE, def.build);
    holder.add(item);
    const p = ringPosition(i, keys.length, R, 4);
    holder.position.set(p.x, p.y + 1, p.z);
    holder.userData = { key, def, focusRadius: 8, bobPhase: Math.random() * 6, baseY: p.y + 1,
      anims: collectIdle(item), orbits: item.userData.orbits || null, bubbles: item.userData.bubbles || null, stateParts: item.userData.stateParts || null };
    attachMarker(THREE, holder, isDone(key), 6);
    clickables.push(holder);
    group.add(holder);
  });

  function update(dt, t, camera) {
    // Morph the background cloud through the states.
    const phase = (Math.sin(t * 0.15) * 0.5 + 0.5) * 3; // 0..3
    const arr = geo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      const [hx, hy, hz] = home[i];
      let jitter = 0, spread = 1;
      if (phase < 1) { jitter = 0; spread = 1; }          // solid
      else if (phase < 2) { jitter = 0.6; spread = 1.3; } // liquid
      else { jitter = 2.5; spread = 2.2; }                // gas
      arr[i * 3] = hx * spread + Math.sin(t * 2 + i) * jitter;
      arr[i * 3 + 1] = hy * (phase < 2 ? 1 : 1.3) + Math.cos(t * 2.3 + i) * jitter;
      arr[i * 3 + 2] = hz * spread + Math.sin(t * 1.7 + i) * jitter;
    }
    geo.attributes.position.needsUpdate = true;

    clickables.forEach((m) => {
      m.rotation.y += dt * 0.16;
      m.position.y = m.userData.baseY + Math.sin(t * 0.6 + m.userData.bobPhase) * 0.4;
      runIdle(m.userData.anims, t);
      if (m.userData.orbits) m.userData.orbits.rotation.y += dt * 1.4;
      if (m.userData.bubbles) m.userData.bubbles.forEach((b, k) => { b.position.y = 1 + ((t * 1.2 + k * 0.4) % 2.2); b.material.opacity = 0.8 * (1 - ((t * 1.2 + k * 0.4) % 2.2) / 2.2); });
      if (m.userData.stateParts) m.userData.stateParts.forEach((p, k) => {
        const ph = (Math.sin(t * 0.15) * 0.5 + 0.5) * 3;
        const col = k % 6, row = Math.floor(k / 6);
        const bx = (col - 2.5) * 0.4, by = 1 + row * 0.5, bz = 0;
        const j = ph < 1 ? 0 : ph < 2 ? 0.3 : 1;
        p.position.set(bx + Math.sin(t * 3 + k) * j, by + Math.cos(t * 3 + k) * j * (ph < 2 ? 0.3 : 1.5), bz + Math.sin(t * 2 + k) * j);
      });
    });
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, home: { radius: 118 } };
}

export default {
  key: 'chemistry',
  name: 'Chemistry & Matter',
  icon: '🧪',
  blurb: 'Mix, melt, and morph your way through the science of stuff.',
  unlockCost: 684,
  category: 'Science & Space',
  theme: { primary: 0x5BC0DE, secondary: 0x6BCB77, bg: 0x0a1622, light: 0xDDF4FF, ambient: 0x2a4458 },
  masterTitle: 'Chemistry Master 🧪',
  subjects: SUBJECTS,
  build,
};
