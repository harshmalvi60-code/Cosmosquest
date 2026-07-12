import { attachMarker, updateMarkers, ringPosition } from './helpers.js';
import { idle, collectIdle, runIdle } from './anim.js';

/**
 * World 9 — Farm to Table. A sunny low-poly farmland diorama (green fields, a
 * red barn, fence posts, a warm sun) — the most grounded, relatable world. The
 * "Seed-to-Plate journey" is shown as a plate of colourful food, chosen as a
 * simple "this is where the journey ends up" metaphor for the whole food chain.
 */

const M = (THREE, c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, metalness: 0.03, flatShading: true, ...o });

const SUBJECTS = {
  farmanimals: {
    name: 'Farm Animals', type: 'Farm · The Farmyard', emoji: '🐄', badge: 'Farmyard Friend', build: 'animals',
    mission: '🐄 Cows, chickens, and other farm animals give us milk, eggs, and more. Ready to meet the farmyard?',
    stats: [['Cows', 'Give us milk'], ['Chickens', 'Lay eggs'], ['4 stomachs', 'A cow has!'], ['Farmers', 'Care for them']],
    facts: ['🐄 Cows give us milk and have FOUR stomach parts to help digest tough grass.', '🐔 Chickens lay eggs — a hen can lay almost one every day.', '👩‍🌾 Farmers feed, shelter, and look after all the farm animals.', '🔊 Each cow has its own voice, and mums "moo" to find their calves.'],
    fun: 'A cow has four stomach parts and chews its food twice — first as grass, then again as "cud"!',
    quiz: [
      ['What do we get from cows?', ['Milk', 'Wool', 'Honey', 'Eggs'], 0],
      { t: 'tf', q: 'A hen can lay an egg almost every day.', answer: true },
      { t: 'pic', q: 'Which colours is a classic dairy cow?', options: [
        { shape: 'circle', color: '#F4F4F4', label: 'Black & white' }, { shape: 'circle', color: '#4BA6E8', label: 'Blue' }, { shape: 'circle', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['A cow has four stomach parts to break down grass. What does that tell you about grass?', ['It\'s tough and hard to digest', 'It\'s easy to eat', 'It\'s made of meat', 'It\'s a fruit'], 0],
      { t: 'tf', q: 'Because hens lay eggs almost daily, a farm can collect fresh eggs every morning.', answer: true },
      ['Farm animals are fed and sheltered by farmers. Why do farmers take such good care of them?', ['Healthy animals give us good food', 'To win races', 'To teach them tricks', 'For no reason'], 0],
    ],
  },
  wheat: {
    name: 'Wheat', type: 'Crop · Golden Grain', emoji: '🌾', badge: 'Grain Grower', build: 'wheat',
    mission: '🌾 Those golden fields become your bread, pasta, and pizza! Ready to follow wheat from field to plate?',
    stats: [['A grass', 'Like bamboo'], ['Flour', 'Ground from it'], ['Bread', 'Made from flour'], ['Golden', 'When ripe']],
    facts: ['🌾 Wheat is a kind of grass grown in huge golden fields.', '⚙️ Its seeds, called grains, are ground into flour.', '🍞 Flour is used to make bread, pasta, pizza, and cake!', '🌍 Wheat is one of the most important foods in the whole world.'],
    fun: 'It takes the grains from thousands of wheat plants to make the flour for just one loaf of bread!',
    quiz: [
      ['What do we make by grinding wheat grains?', ['Flour', 'Milk', 'Sugar cubes', 'Butter'], 0],
      { t: 'tf', q: 'Bread is made from wheat flour.', answer: true },
      { t: 'pic', q: 'Which colour is ripe wheat?', options: [
        { shape: 'circle', color: '#E3B23C', label: 'Golden' }, { shape: 'circle', color: '#4BA6E8', label: 'Blue' }, { shape: 'circle', color: '#E23B2E', label: 'Red' }], answer: 0 },
    ],
    quizHard: [
      ['Wheat becomes flour, and flour becomes bread. What is this a good example of?', ['Food changing form on its way to your plate', 'Food staying the same', 'Magic', 'Cooking meat'], 0],
      { t: 'tf', q: 'Since one loaf needs thousands of wheat plants, farms grow wheat in huge fields.', answer: true },
      ['Wheat fields turn golden when the wheat is ripe. What does golden wheat tell a farmer?', ['It\'s ready to harvest', 'It needs more rain', 'It\'s too young', 'It\'s sick'], 0],
    ],
  },
  rice: {
    name: 'Rice', type: 'Crop · World Staple', emoji: '🍚', badge: 'Paddy Planter', build: 'rice',
    mission: '🍚 Rice feeds half the people on Earth and grows in flooded fields. Ready to wade into the paddy?',
    stats: [['Half the world', 'Eats it daily'], ['Paddies', 'Flooded fields'], ['A grass', 'Like wheat'], ['Water', 'It loves it']],
    facts: ['🍚 Rice is the main food for about half of all the people on Earth.', '💧 It grows in flooded fields called paddies.', '🌾 Like wheat, rice is actually a kind of grass.', '🙌 In many places, rice is still planted and picked by hand.'],
    fun: 'Rice feeds more people than any other single food — about half the planet eats it every single day!',
    quiz: [
      ['Where does rice usually grow?', ['In flooded fields called paddies', 'In dry deserts', 'On tall trees', 'Underwater in the sea'], 0],
      { t: 'tf', q: 'Rice is a main food for about half the world.', answer: true },
      { t: 'pic', q: 'Which colour is cooked white rice?', options: [
        { shape: 'circle', color: '#F4F1E8', label: 'White' }, { shape: 'circle', color: '#E23B2E', label: 'Red' }, { shape: 'circle', color: '#4BA6E8', label: 'Blue' }], answer: 0 },
    ],
    quizHard: [
      ['Rice is grown in flooded paddies. What does that tell you rice needs a lot of?', ['Water', 'Sand', 'Ice', 'Rocks'], 0],
      { t: 'tf', q: 'Because so many people eat rice, it is one of the most important crops on Earth.', answer: true },
      ['Rice and wheat are both grasses grown for their grains. What are grains?', ['The seeds of the plant we eat', 'The leaves', 'The roots', 'The flowers'], 0],
    ],
  },
  milk: {
    name: 'Milk', type: 'Food · From the Farm', emoji: '🥛', badge: 'Dairy Master', build: 'milk',
    mission: '🥛 One splash of milk can become cheese, butter, or yogurt! Ready to discover where milk comes from?',
    stats: [['Cows', 'Main source'], ['Calcium', 'Builds bones'], ['Cheese', 'Made from milk'], ['Yogurt', 'Made from milk']],
    facts: ['🥛 Most of our milk comes from cows (all mammal mums make milk for their babies).', '🦴 Milk is full of calcium, which helps build strong bones and teeth.', '🧀 Milk can be turned into cheese, butter, yogurt, and ice cream!', '🚜 Farmers milk their cows every day, often with gentle machines.'],
    fun: 'One dairy cow can give around 25 litres of milk a day — that\'s about 100 glasses!',
    quiz: [
      ['Which of these is made from milk?', ['Cheese', 'Bread', 'Rice', 'Honey'], 0],
      { t: 'tf', q: 'Milk has calcium that helps build strong bones.', answer: true },
      { t: 'pic', q: 'Which colour is a glass of milk?', options: [
        { shape: 'circle', color: '#F6F4EE', label: 'White' }, { shape: 'circle', color: '#E3B23C', label: 'Gold' }, { shape: 'circle', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['Cheese, butter, and yogurt all come from milk. What does that make milk?', ['A base for many other foods', 'A kind of bread', 'A vegetable', 'A metal'], 0],
      { t: 'tf', q: 'Because milk has calcium, drinking it can help your bones and teeth grow strong.', answer: true },
      ['All mammal mums, including cows, make milk. Who is milk originally made for?', ['Their babies', 'Farmers', 'Cats only', 'Nobody'], 0],
    ],
  },
  honey: {
    name: 'Honey', type: 'Food · Bee Gold', emoji: '🍯', badge: 'Hive Harvester', build: 'honey',
    mission: '🍯 Bees turn flower nectar into golden honey that never goes bad. Ready to peek in the hive?',
    stats: [['Bees', 'Make it'], ['Nectar', 'Turned into honey'], ['Never spoils', 'If sealed'], ['Beekeepers', 'Collect it']],
    facts: ['🍯 Honey is made by bees from the sweet nectar of flowers.', '🐝 Bees store honey in the hive as food to last through winter.', '👨‍🌾 Beekeepers keep hives and gently collect the extra honey.', '⏳ Honey almost never goes bad if it\'s sealed up.'],
    fun: 'Honey found in 3,000-year-old Egyptian tombs was still perfectly good to eat — honey basically never spoils!',
    quiz: [
      ['What do bees make honey from?', ['Flower nectar', 'Grass', 'Water', 'Sand'], 0],
      { t: 'tf', q: 'Sealed honey can stay good for a very long time.', answer: true },
      { t: 'pic', q: 'Which colour is honey?', options: [
        { shape: 'drop', color: '#E3A81E', label: 'Golden' }, { shape: 'drop', color: '#4BA6E8', label: 'Blue' }, { shape: 'drop', color: '#F4F4F4', label: 'White' }], answer: 0 },
    ],
    quizHard: [
      ['Bees store honey to eat in winter. Why can beekeepers take some without harming the hive?', ['Bees make more than they need', 'Bees don\'t eat honey', 'Honey is fake', 'Bees dislike honey'], 0],
      { t: 'tf', q: 'Because honey almost never spoils, very old honey has been found still edible.', answer: true },
      ['Honey starts as flower nectar that bees collect. What does that link honey to?', ['Flowers and the bees that visit them', 'Rocks', 'Rivers', 'The Moon'], 0],
    ],
  },
  fruittrees: {
    name: 'Fruit Trees', type: 'Farm · The Orchard', emoji: '🍎', badge: 'Orchard Keeper', build: 'fruittree',
    mission: '🍎 An apple starts as a flower and carries the tree\'s seeds inside. Ready to explore the orchard?',
    stats: [['Flowers first', 'Then fruit'], ['Seeds', 'Inside the fruit'], ['Bees', 'Pollinate them'], ['Orchard', 'A fruit-tree farm']],
    facts: ['🌸 Fruit trees first grow blossoms (flowers), which slowly turn into fruit.', '🐝 Bees pollinate the flowers so the fruit can form.', '🌱 The fruit protects and carries the tree\'s seeds — that\'s how new trees spread.', '🍏 A farm full of fruit trees is called an orchard.'],
    fun: 'One little apple pip can grow into a tree that makes thousands of apples — each holding even more seeds!',
    quiz: [
      ['What do fruit trees grow BEFORE the fruit?', ['Flowers (blossoms)', 'Rocks', 'Eggs', 'Leaves only'], 0],
      { t: 'tf', q: 'Fruit carries the tree\'s seeds inside it.', answer: true },
      { t: 'pic', q: 'Which colour is a ripe apple?', options: [
        { shape: 'circle', color: '#E23B2E', label: 'Red' }, { shape: 'circle', color: '#4BA6E8', label: 'Blue' }, { shape: 'circle', color: '#6E6E7A', label: 'Grey' }], answer: 0 },
    ],
    quizHard: [
      ['A flower must be pollinated by bees before it can become fruit. What does that make bees to fruit trees?', ['Helpers the trees need', 'Enemies', 'Food for the tree', 'Just visitors'], 0],
      { t: 'tf', q: 'Since fruit carries seeds, eating fruit and dropping seeds can help new trees grow.', answer: true },
      ['A fruit tree goes flower → fruit → seed → new tree. What is this an example of?', ['How plants make new plants', 'How rocks form', 'How rain falls', 'How milk is made'], 0],
    ],
  },
  fishing: {
    name: 'Fishing', type: 'Food · From the Water', emoji: '🎣', badge: 'Net Navigator', build: 'fishing',
    mission: '🎣 From ocean nets to dinner plates — fishing brings the sea to your table. Ready to cast off?',
    stats: [['Nets & rods', 'Catch fish'], ['Fish farms', 'Raise fish too'], ['Protein', 'Fish give us'], ['Not too many', 'Keep seas full']],
    facts: ['🎣 People catch fish from the sea, lakes, and rivers for food.', '🚢 Big boats use nets, while others use rods and lines.', '🐟 Some fish are raised on special fish farms.', '♻️ It\'s important not to catch too many, so plenty of fish are left to grow more.'],
    fun: 'Some fishing nets are so huge that a whole football pitch could fit inside them!',
    quiz: [
      ['How do big fishing boats catch lots of fish at once?', ['With large nets', 'With spoons', 'With magnets', 'With music'], 0],
      { t: 'tf', q: 'We should not catch too many fish, so more can grow.', answer: true },
      { t: 'pic', q: 'Which colour is a silvery fish?', options: [
        { shape: 'oval', color: '#AEB8C4', label: 'Silver' }, { shape: 'oval', color: '#E23B2E', label: 'Red' }, { shape: 'oval', color: '#6BCB77', label: 'Green' }], answer: 0 },
    ],
    quizHard: [
      ['Why do people leave some fish behind instead of catching them all?', ['So fish can breed and there\'s always more', 'Because nets get full', 'Fish taste bad', 'To be lazy'], 0],
      { t: 'tf', q: 'Fish farms raise fish so we don\'t have to catch as many wild ones.', answer: true },
      ['Fishing brings food from the water. What kind of food do fish mainly give us?', ['Protein to help us grow', 'Sugar', 'Flour', 'Honey'], 0],
    ],
  },
  seedtoplate: {
    name: 'Seed to Plate', type: 'Farm · The Whole Journey', emoji: '🍽️', badge: 'Food Tracker', build: 'plate',
    mission: '🍽️ Every meal is an adventure — from a tiny seed to your plate. Ready to follow the whole journey?',
    stats: [['Farm', 'Where it starts'], ['Harvest', 'Picking time'], ['Transport', 'Trucks & ships'], ['Your plate', 'The finish']],
    facts: ['🌱 Most food begins on a farm, growing from seeds or raised as animals.', '🚜 When it\'s ready, farmers harvest (gather) it.', '🚚 Then it travels by truck, train, or ship to shops and markets.', '🍽️ Finally it\'s cooked in a kitchen and served on your plate!'],
    fun: 'The food on your dinner plate might have travelled thousands of km — from farms in many different countries!',
    quiz: [
      ['Where does most of our food begin its journey?', ['On a farm', 'In a shop', 'In the kitchen', 'On your plate'], 0],
      { t: 'tf', q: 'Food often travels a long way from the farm to your plate.', answer: true },
      { t: 'pic', q: 'What is the FIRST step of food\'s journey?', options: [
        { shape: 'drop', color: '#6BCB77', label: 'Farm/seed' }, { shape: 'circle', color: '#AEB8C4', label: 'Plate' }, { shape: 'square', color: '#E3B23C', label: 'Shop' }], answer: 0 },
    ],
    quizHard: [
      ['Food goes farm → harvest → transport → shop → plate. What does knowing this teach you?', ['Food doesn\'t really start at the shop', 'Shops grow food', 'Food appears by magic', 'Plates make food'], 0],
      { t: 'tf', q: 'Because food travels from farms far away, trucks and ships are part of getting your dinner.', answer: true },
      ['Farmers harvest crops only when they are ripe. Why wait for ripeness before harvesting?', ['The food is ready and tastes best', 'The trucks are busy', 'It\'s the law', 'To confuse bugs'], 0],
    ],
  },
};

/* ---------------- procedural farm subjects ---------------- */
function buildFarm(THREE, kind) {
  const g = new THREE.Group();
  if (kind === 'animals') {
    // Cow
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 10), M(THREE, 0xF4F4F4));
    body.scale.set(1.7, 1, 0.95); body.position.set(-0.6, 1.6, 0); idle(body, 'breathe', 0.03, 2); g.add(body);
    for (let i = 0; i < 4; i++) {
      const patch = new THREE.Mesh(new THREE.SphereGeometry(0.5 + Math.random() * 0.3, 8, 8), M(THREE, 0x2A2A2A));
      patch.position.set(-0.6 + (Math.random() - 0.5) * 2.4, 1.6 + (Math.random() - 0.5), 0.7); g.add(patch);
    }
    const head = new THREE.Mesh(new THREE.BoxGeometry(1, 0.9, 0.9), M(THREE, 0xF4F4F4));
    head.position.set(1.6, 1.9, 0); g.add(head);
    for (const [dx, dz] of [[0.4, 0.6], [0.4, -0.6], [-1.4, 0.6], [-1.4, -0.6]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.4, 6), M(THREE, 0xE8E8E8));
      leg.position.set(dx, 0.7, dz); g.add(leg);
    }
    // Chicken beside it
    const chick = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 8), M(THREE, 0xF7EFD0));
    chick.position.set(-2.6, 0.9, 1.6); idle(chick, 'breathe', 0.05, 3); g.add(chick);
    const chead = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), M(THREE, 0xF7EFD0));
    chead.position.set(-2.2, 1.4, 1.6); g.add(chead);
    const comb = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 5), M(THREE, 0xE23B2E));
    comb.position.set(-2.2, 1.8, 1.6); g.add(comb);
  } else if (kind === 'wheat' || kind === 'rice') {
    const isRice = kind === 'rice';
    if (isRice) {
      const water = new THREE.Mesh(new THREE.CircleGeometry(4, 24),
        new THREE.MeshStandardMaterial({ color: 0x6FB8E0, transparent: true, opacity: 0.7, roughness: 0.2, metalness: 0.3 }));
      water.rotation.x = -Math.PI / 2; water.position.y = 0.1; g.add(water);
    }
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.random() * 3;
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 3, 5), M(THREE, isRice ? 0x8ACE5E : 0xC9A83C));
      stalk.position.set(Math.cos(a) * r, 1.5, Math.sin(a) * r); idle(stalk, 'sway', 0.1, 1.5 + i * 0.1, 'z'); g.add(stalk);
      const head = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.6, 4, 6), M(THREE, isRice ? 0xE8E4C8 : 0xE3B23C));
      head.position.set(Math.cos(a) * r, 3.2, Math.sin(a) * r); g.add(head);
    }
  } else if (kind === 'milk') {
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.2, 3, 16), M(THREE, 0xF6F4EE, { roughness: 0.3 }));
    bottle.position.y = 1.6; g.add(bottle);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 1, 12), M(THREE, 0xF6F4EE));
    neck.position.y = 3.4; g.add(neck);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 12), M(THREE, 0x4BA6E8));
    cap.position.y = 4; g.add(cap);
    const splash = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.12, 8, 14), M(THREE, 0xFFFFFF));
    splash.position.y = 4.4; splash.rotation.x = Math.PI / 2; idle(splash, 'bobY', 0.15, 3); g.add(splash);
  } else if (kind === 'honey') {
    for (let i = 0; i < 3; i++) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1, 2.6), M(THREE, i % 2 ? 0xE8C078 : 0xD9A94E));
      box.position.y = 0.6 + i; g.add(box);
    }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1, 4), M(THREE, 0x8A5A34));
    roof.position.y = 4; roof.rotation.y = Math.PI / 4; g.add(roof);
    const bee = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), M(THREE, 0xF2C21E));
    bee.position.set(1.8, 4, 1); idle(bee, 'bobY', 0.3, 4); g.add(bee);
  } else if (kind === 'fruittree') {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 3.5, 8), M(THREE, 0x8A5A34));
    trunk.position.y = 1.7; g.add(trunk);
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(2.6, 14, 12), M(THREE, 0x4E9E4A));
    canopy.position.y = 4.4; idle(canopy, 'breathe', 0.02, 1.5); g.add(canopy);
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2, r = 1.6 + Math.random();
      const apple = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), M(THREE, 0xE23B2E));
      apple.position.set(Math.cos(a) * r, 4.4 + (Math.random() - 0.5) * 2, Math.sin(a) * r); g.add(apple);
    }
  } else if (kind === 'fishing') {
    const pond = new THREE.Mesh(new THREE.CircleGeometry(3.6, 24),
      new THREE.MeshStandardMaterial({ color: 0x4BA6E8, transparent: true, opacity: 0.75, roughness: 0.2, metalness: 0.3 }));
    pond.rotation.x = -Math.PI / 2; pond.position.y = 0.1; g.add(pond);
    const fish = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 8), M(THREE, 0xAEB8C4));
    fish.scale.set(1.6, 0.7, 0.5); fish.position.set(0, 0.7, 0); idle(fish, 'bobY', 0.2, 2); g.add(fish);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.7, 4), M(THREE, 0xAEB8C4));
    tail.position.set(-1.2, 0.7, 0); tail.rotation.z = Math.PI / 2; g.add(tail);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 5, 6), M(THREE, 0x8A5A34));
    rod.position.set(3, 3, 0); rod.rotation.z = -0.6; g.add(rod);
    const line = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 3, 4), M(THREE, 0xDDDDDD));
    line.position.set(1.6, 1.8, 0); g.add(line);
  } else if (kind === 'plate') {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.2, 0.4, 24), M(THREE, 0xEDEDED, { roughness: 0.3 }));
    plate.position.y = 1; g.add(plate);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.2, 8, 24), M(THREE, 0xDADADA));
    rim.position.y = 1.2; rim.rotation.x = Math.PI / 2; g.add(rim);
    const foods = [[0xE23B2E, 0.6], [0xE3B23C, 0.5], [0x6BCB77, 0.55], [0xF4F1E8, 0.5]];
    foods.forEach(([c, s], i) => {
      const a = (i / foods.length) * Math.PI * 2;
      const food = new THREE.Mesh(new THREE.SphereGeometry(s, 10, 8), M(THREE, c));
      food.position.set(Math.cos(a) * 1.1, 1.5, Math.sin(a) * 1.1); idle(food, 'bobY', 0.08, 2 + i); g.add(food);
    });
  }
  return g;
}

function build({ THREE, isDone }) {
  const group = new THREE.Group();
  const clickables = [];
  const keys = Object.keys(SUBJECTS);
  const R = 46;

  // Sunny field.
  const floor = new THREE.Mesh(new THREE.CircleGeometry(R + 34, 48),
    new THREE.MeshStandardMaterial({ color: 0x6FB84A, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1; group.add(floor);

  // Warm sun.
  const sun = new THREE.Mesh(new THREE.SphereGeometry(6, 20, 16),
    new THREE.MeshBasicMaterial({ color: 0xFFE07A }));
  sun.position.set(-60, 55, -80); group.add(sun);

  // Red barn in the background.
  const barn = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.BoxGeometry(16, 12, 12), M(THREE, 0xC0392B));
  wall.position.y = 6; barn.add(wall);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 9, 6, 4, 1), M(THREE, 0x7A2E22));
  roof.position.y = 15; roof.rotation.y = Math.PI / 4; barn.add(roof);
  const door = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 0.5), M(THREE, 0x8A5A34));
  door.position.set(0, 3, 6.1); barn.add(door);
  barn.position.set(55, 0, -70); group.add(barn);

  // Fence posts around the field.
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 3, 6), M(THREE, 0x9A6A3C));
    post.position.set(Math.cos(a) * (R + 14), 0.5, Math.sin(a) * (R + 14)); group.add(post);
  }

  keys.forEach((key, i) => {
    const def = SUBJECTS[key];
    const holder = new THREE.Group();
    const item = buildFarm(THREE, def.build);
    holder.add(item);
    const p = ringPosition(i, keys.length, R, 0);
    holder.position.set(p.x, 0, p.z);
    holder.userData = { key, def, focusRadius: 8, phase: Math.random() * 6, anims: collectIdle(item) };
    attachMarker(THREE, holder, isDone(key), 6);
    clickables.push(holder);
    group.add(holder);
  });

  function update(dt, t, camera) {
    clickables.forEach((m) => {
      m.rotation.y += dt * 0.15;
      runIdle(m.userData.anims, t);
    });
    updateMarkers(clickables, camera, t);
  }

  return { group, clickables, update, home: { radius: 120 } };
}

export default {
  key: 'farm',
  name: 'Farm to Table',
  icon: '🌾',
  blurb: 'From farm animals to your dinner plate — meet where food comes from.',
  unlockCost: 180,
  category: 'Nature & Life',
  theme: { primary: 0xE3B23C, secondary: 0x6FB84A, bg: 0x141006, light: 0xFFEEB0, ambient: 0x5a4a2a },
  masterTitle: 'Harvest Master 🌾',
  subjects: SUBJECTS,
  build,
};
