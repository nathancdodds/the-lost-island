'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const canvas = $('world');
  let ctx = canvas.getContext('2d', { alpha: false });
  const mainCtx = ctx, groundBuf = document.createElement('canvas'), groundCtx = groundBuf.getContext('2d');
  const mini = $('minimap'), miniCtx = mini.getContext('2d');
  const lightMask = document.createElement('canvas'), lightCtx = lightMask.getContext('2d');
  const TILE = 16, WIDTH = 256, HEIGHT = 184, SAVE_KEY = 'lost-island-v3';
  const islands = [
    { x: 58, y: 70, rx: 40, ry: 35, name: "Wanderer's Shore" },
    { x: 143, y: 40, rx: 25, ry: 24, name: 'Moonstone Isle' },
    { x: 139, y: 112, rx: 29, ry: 23, name: 'The Hollow Wilds' },
    { x: 212, y: 66, rx: 22, ry: 19, name: 'The Drowned Docks' },
    { x: 214, y: 143, rx: 24, ry: 21, name: 'Ashen Reach' },
    { x: 44, y: 160, rx: 17, ry: 14, name: 'Gull Rock' }
  ];
  const items = {
    wood: { name: 'Wood', color: '#b67f4a' }, stone: { name: 'Stone', color: '#aab6b1' },
    fiber: { name: 'Fiber', color: '#9ac46a' }, berries: { name: 'Berries', color: '#e88d97' },
    crystal: { name: 'Moonstone', color: '#80ddd4' }, axe: { name: 'Stone axe', color: '#bac3ac' },
    pickaxe: { name: 'Pickaxe', color: '#bac3ac' }, sword: { name: 'Stone sword', color: '#d3dcc9' },
    raft: { name: 'Raft', color: '#cb9d65' }, dock: { name: 'Dock', color: '#b08a5a' }, ship: { name: 'Ship', color: '#c9a36a' }, campfire: { name: 'Campfire', color: '#efad5e' },
    shelter: { name: 'Shelter', color: '#c9b682' }, house: { name: 'House', color: '#c6a16a' }, wall: { name: 'Wooden fence', color: '#b99462' },
    bridge: { name: 'Bridge', color: '#c49b6c' }, bandage: { name: 'Bandage', color: '#eeeacf' },
    torch: { name: 'Lantern', color: '#f4cf78' }, relic: { name: 'Ancient relic', color: '#ecd98b' },
    bed: { name: 'Bed', color: '#c08a86' }, table: { name: 'Table', color: '#b58a5a' }, chair: { name: 'Chair', color: '#b58a5a' },
    rug: { name: 'Rug', color: '#cf8f6a' }, lamp: { name: 'Lamp', color: '#f4d98a' }, plant: { name: 'Potted plant', color: '#6fae5c' },
    bookshelf: { name: 'Bookshelf', color: '#9c7a4e' }, painting: { name: 'Painting', color: '#cdb57e' },
    spear: { name: 'Spear', color: '#cdd3c0' }, armor: { name: 'Woven armor', color: '#b9a06a' }, jam: { name: 'Berry jam', color: '#c65f74' }, rations: { name: 'Rations', color: '#d8b87a' },
    lanternpost: { name: 'Lantern post', color: '#f4d98a' }, stonewall: { name: 'Stone wall', color: '#9aa7a0' }, well: { name: 'Well', color: '#9aa7a0' }, fireplace: { name: 'Fireplace', color: '#d08a52' }, clock: { name: 'Clock', color: '#b58a5a' },
    seeds: { name: 'Seeds', color: '#c7b36a' }, veg: { name: 'Vegetables', color: '#8fbf5a' }, hoe: { name: 'Hoe', color: '#bac3ac' },
    rod: { name: 'Fishing rod', color: '#c9a36a' }, fish: { name: 'Fish', color: '#8fb6c6' }, cookedfish: { name: 'Cooked fish', color: '#d89a66' }, stew: { name: 'Hearty stew', color: '#c67b4a' },
    bomb: { name: 'Bomb', color: '#454a4a' }, tnt: { name: 'TNT', color: '#c0392b' }, rocket: { name: 'Rocket', color: '#e0564a' }, spacesuit: { name: 'Spacesuit', color: '#d5ddd2' }, car: { name: 'Car', color: '#c0564a' }, plane: { name: 'Plane', color: '#d7dcc9' }, runway: { name: 'Runway', color: '#8a8f96' }
  };
  const recipes = [
    { id: 'axe', cost: { wood: 4, stone: 3 }, desc: 'Gather more wood with every swing.', unique: true },
    { id: 'pickaxe', cost: { wood: 4, stone: 5 }, desc: 'Mine stone faster and harvest moonstone.', unique: true },
    { id: 'hoe', cost: { wood: 4, stone: 4 }, desc: 'A farming hoe. You need it to till soil and plant seeds.', unique: true },
    { id: 'campfire', cost: { wood: 6, stone: 4 }, desc: 'A warm place to heal. Place on land.', build: true },
    { id: 'bandage', cost: { fiber: 3, berries: 1 }, desc: 'Restores 40 health.' },
    { id: 'sword', cost: { wood: 5, stone: 8 }, desc: 'Deal more damage and keep the shadows back.', unique: true },
    { id: 'raft', cost: { wood: 18, fiber: 8 }, desc: 'Automatically sail when you enter deep water.', unique: true },
    { id: 'dock', cost: { wood: 10, fiber: 4 }, desc: 'A wooden pier. Place in shallow water by the shore.', build: true },
    { id: 'ship', cost: { wood: 30, fiber: 16, stone: 8 }, desc: 'A seaworthy ship that sails faster than a raft. You must have built a dock first.', unique: true, requires: s => s.buildings.some(b => b.type === 'dock'), reqText: 'a dock you have built' },
    { id: 'torch', cost: { wood: 4, fiber: 3, crystal: 1 }, desc: 'Carry a warm light through caves and night.', unique: true },
    { id: 'wall', cost: { wood: 3 }, desc: 'Build a fence. Keep unwelcome visitors out.', build: true },
    { id: 'shelter', cost: { wood: 14, fiber: 8, stone: 5 }, desc: 'A simple camp shelter. Sets your respawn point; sleep here at night.', build: true },
    { id: 'house', cost: { wood: 24, stone: 14, fiber: 10 }, desc: 'A sturdy home. Sets your respawn and lets you sleep through the night.', build: true },
    { id: 'bridge', cost: { wood: 5 }, desc: 'Place in shallow water to cross a river.', build: true },
    { id: 'bed', cost: { wood: 8, fiber: 6 }, desc: 'A cosy bed. Sleep at night from inside your home. Place inside your home.', build: true, decor: true },
    { id: 'table', cost: { wood: 6 }, desc: 'A wooden table. Place inside your home.', build: true, decor: true },
    { id: 'chair', cost: { wood: 4 }, desc: 'A simple chair. Place inside your home.', build: true, decor: true },
    { id: 'rug', cost: { fiber: 8 }, desc: 'A woven rug to warm the floor. Place inside your home.', build: true, decor: true },
    { id: 'lamp', cost: { wood: 3, crystal: 1 }, desc: 'A glowing moonstone lamp that lights the room. Place inside your home.', build: true, decor: true },
    { id: 'plant', cost: { fiber: 4, berries: 1 }, desc: 'A potted plant. Place inside your home.', build: true, decor: true },
    { id: 'bookshelf', cost: { wood: 10, stone: 2 }, desc: 'A shelf full of old books. Place inside your home.', build: true, decor: true },
    { id: 'painting', cost: { wood: 2, fiber: 2 }, desc: 'Framed wall art. Place inside your home.', build: true, decor: true },
    { id: 'spear', cost: { wood: 6, stone: 6, fiber: 3 }, desc: 'A long spear that strikes enemies from farther away.', unique: true },
    { id: 'armor', cost: { fiber: 14, wood: 6, stone: 4 }, desc: 'Woven armor that halves the damage you take.', unique: true },
    { id: 'rod', cost: { wood: 5, fiber: 4 }, desc: 'A fishing rod. Face the water and press E to cast.', unique: true },
    { id: 'jam', cost: { berries: 4 }, desc: 'Sweet berry jam. Restores 30 health and some stamina.' },
    { id: 'rations', cost: { berries: 2, fiber: 4 }, desc: 'Travel rations. Fully restore stamina and heal a little.' },
    { id: 'cookedfish', cost: { fish: 1 }, desc: 'Cook a fish for a hot meal. Needs a campfire nearby.', cook: true, requires: s => nearFire(s), reqText: 'a campfire nearby' },
    { id: 'stew', cost: { fish: 1, veg: 1, berries: 1 }, desc: 'A hearty stew that restores a lot. Needs a campfire nearby.', cook: true, requires: s => nearFire(s), reqText: 'a campfire nearby' },
    { id: 'seeds', cost: { berries: 1 }, desc: 'Plant on grass outdoors to grow crops (needs a hoe). Harvest them for vegetables when ripe.', build: true },
    { id: 'lanternpost', cost: { wood: 4, stone: 2, crystal: 1 }, desc: 'A standing lantern that lights the area at night. Place outdoors.', build: true },
    { id: 'stonewall', cost: { stone: 6 }, desc: 'A sturdy stone wall to keep enemies out.', build: true },
    { id: 'well', cost: { stone: 10, wood: 4 }, desc: 'A stone well. Press E to refresh your stamina. Place outdoors.', build: true },
    { id: 'fireplace', cost: { stone: 8, wood: 6 }, desc: 'A warm hearth that lights your home. Place inside your home.', build: true, decor: true },
    { id: 'clock', cost: { wood: 4, crystal: 1 }, desc: 'A handsome pendulum clock. Place inside your home.', build: true, decor: true },
    { id: 'bomb', cost: { stone: 3, crystal: 1, fiber: 1 }, desc: 'Place it and step back! Clears nearby trees and rocks and harms enemies.', build: true },
    { id: 'tnt', cost: { stone: 6, crystal: 3, fiber: 2 }, desc: 'A powerful charge that clears a large area. Stand well back.', build: true },
    { id: 'spacesuit', cost: { fiber: 12, crystal: 4, wood: 8 }, desc: 'Protects you from the Moon\'s freezing, airless surface.', unique: true },
    { id: 'rocket', cost: { wood: 24, stone: 12, fiber: 16, crystal: 6 }, desc: 'Place it, press E to board, and fly to the Moon. The rocket stays there for your return trip.', unique: true, build: true },
    { id: 'car', cost: { wood: 20, stone: 14, crystal: 2 }, desc: 'A car. Select it to drive quickly over land.', unique: true },
    { id: 'runway', cost: { stone: 4, wood: 2 }, desc: 'A runway strip. Lay at least 5 in a straight line to make a runway for your plane.', build: true },
    { id: 'plane', cost: { wood: 28, fiber: 16, stone: 10, crystal: 5 }, desc: 'A plane. Repair Moonstone Isle\'s runway or build a long one, then select the plane to take off.', unique: true }
  ];
  const DEFAULT_HOTBAR = ['axe', 'pickaxe', 'sword', 'berries', 'bandage', 'campfire', 'shelter', 'raft'];
  const decorTypes = ['bed', 'table', 'chair', 'rug', 'lamp', 'plant', 'bookshelf', 'painting', 'fireplace', 'clock'];
  const nearFire = s => s.buildings.some(b => (b.type === 'campfire' || b.type === 'fireplace') && !!b.home === !!s.player.inside && !!b.cave === !!s.player.cave && Math.hypot(b.x - s.player.x, b.y - s.player.y) < 72);
  function onRunway() {
    const airstrip = currentEntities().find(e => e.type === 'airstrip');
    if (state.runwayRepaired && airstrip && Math.abs(state.player.x - airstrip.x) < 56 && Math.abs(state.player.y - airstrip.y) < 15) return true;
    const strips = currentBuildings().filter(b => b.type === 'runway');
    if (!strips.some(b => Math.hypot(b.x - state.player.x, b.y - state.player.y) < 22)) return false;
    const row = strips.filter(b => Math.abs(b.y - state.player.y) < 14), col = strips.filter(b => Math.abs(b.x - state.player.x) < 14);
    return row.length >= 5 || col.length >= 5;
  }
  function runwayDirection() {
    const airstrip = currentEntities().find(e => e.type === 'airstrip');
    if (state.runwayRepaired && airstrip && Math.abs(state.player.x - airstrip.x) < 56 && Math.abs(state.player.y - airstrip.y) < 15) return { x: 1, y: 0 };
    const strips = currentBuildings().filter(b => b.type === 'runway');
    const row = strips.filter(b => Math.abs(b.y - state.player.y) < 14);
    return row.length >= 5 ? { x: 1, y: 0 } : { x: 0, y: 1 };
  }
  const quests = [
    { title: 'A foothold', desc: 'Gather 6 wood and 4 stone. Every journey begins with a little ingenuity.', goal: 10, value: s => Math.min(6, s.stats.wood) + Math.min(4, s.stats.stone) },
    { title: 'A spark in the wild', desc: 'Craft a stone axe, then craft and place a campfire.', goal: 2, value: s => Number(!!s.inventory.axe) + Number(s.buildings.some(b => b.type === 'campfire')) },
    { title: 'Beyond the shoreline', desc: 'Craft a raft and sail to Moonstone Isle.', goal: 2, value: s => Number(!!s.inventory.raft) + Number(s.discovered.includes(1)) },
    { title: 'Charting the deep', desc: 'With a raft, cross the open ocean to one of the far islands — the Drowned Docks, Ashen Reach, or Gull Rock.', goal: 1, value: s => Number(s.discovered.some(i => i >= 3)) },
    { title: 'Salvage the ruins', desc: 'Search 6 broken-down places — abandoned camps, ruined cabins, supply caches, fallen towers, and shipwrecks.', goal: 6, value: s => s.looted.filter(id => /^(camp|cabin|cache|tower|wreck)/.test(id)).length },
    { title: 'What the island remembers', desc: 'Recover the relics from the old ruins, the Moonstone cave, and the Hollow shrine.', goal: 3, value: s => s.relics.length },
    { title: 'A light to guide you home', desc: 'Restore the northern lighthouse: 3 relics, 12 wood, 10 stone, and 6 moonstone.', goal: 1, value: s => Number(s.won) }
  ];
  const achievements = [
    { id: 'gather', name: 'With your own two hands', desc: 'Gather your first resource.', test: s => s.stats.gathered > 0 },
    { id: 'maker', name: 'A little ingenuity', desc: 'Craft your first item.', test: s => s.stats.crafted > 0 },
    { id: 'home', name: 'Somewhere to belong', desc: 'Build a shelter or house.', test: s => s.buildings.some(b => b.type === 'shelter' || b.type === 'house') },
    { id: 'farsail', name: 'Into the open ocean', desc: 'Sail to one of the far islands.', test: s => s.discovered.some(i => i >= 3) },
    { id: 'sail', name: 'The horizon calls', desc: 'Set foot on every island.', test: s => s.discovered.length === islands.length },
    { id: 'salvager', name: 'Picking the bones', desc: 'Salvage six broken-down places.', test: s => s.looted.filter(id => /^(camp|cabin|cache|tower|wreck)/.test(id)).length >= 6 },
    { id: 'fight', name: 'Not afraid of the dark', desc: 'Defeat five enemies.', test: s => s.stats.kills >= 5 },
    { id: 'relic', name: 'Echoes of another age', desc: 'Recover all three relics.', test: s => s.relics.length === 3 },
    { id: 'survive', name: 'Another sunrise', desc: 'Survive to day three.', test: s => s.day >= 3 },
    { id: 'angler', name: 'Gone fishing', desc: 'Catch your first fish.', test: s => (s.stats.fished || 0) >= 1 },
    { id: 'cook', name: 'Home cooking', desc: 'Cook a meal at a campfire.', test: s => (s.stats.cooked || 0) >= 1 },
    { id: 'farmer', name: 'Green thumb', desc: 'Harvest a crop you grew.', test: s => (s.stats.harvested || 0) >= 1 },
    { id: 'win', name: 'The lost, found', desc: 'Restore the lighthouse.', test: s => s.won }
  ];
  let state, terrain, entities, caveEntities, homeEntities = [], terrain0, entities0 = [], terrain2, entities2 = [], moonTerrain, moonEntities = [], panel = null, selected = 'wood', placing = null;
  let keys = {}, camera = { x: 0, y: 0 }, particles = [], floaters = [], frameTime = 0, hudTime = 0, bombs = [], hotbarEdit = null, worldTravelCD = 0, rocketFlight = null;
  let planeTakeoff = null, planeAltitude = 0;
  let actionCooldown = 0, damageCooldown = 0, swing = 0, swingTool = null, activeTarget = null, discoveryTimer = 0;
  let audio, soundOn = false, lastSave = 0, mapBitmap, caveOrigin = null, confirmReset = false, vignette, view3d = true, homeOrigin = null;
  const sprites = {
    player: ['....hhhhh....','...hhhhhhh...','...hssssh....','....spss.....','.....ss......','...bbbbb.....','..bbbbbbb....','..sbbbbbss...','...bbbbb.....','...bbbbb.....','....ttt......','...tt.tt.....','...dd.dd.....'],
    deer: ['.......b..b....','......bbbb....','......bssb....','.....bbbsb....','..bbbbbbb.....','.bbbbbbbb.....','.bbbbbbb......','..b.b..b......','..b.b..b......'],
    boar: ['.........bb...','..bbbbbbbbb...','.bbbbbdbbsbb..','.bbbbbbbbb....','..b.b..b......','..b.b..b......'],
    shade: ['....pppp....','...pppppp...','..ppwppwp...','..pppppppp..','...pppppp...','..pppppppp..','.pppppppppp.','..p.pppp.p..','....p.pp....'],
    bat: ['.p........p.','.pp..pp..pp.','..pppppppp..','...ppwwpp...','....pppp....'],
    relic: ['....gg....','...gggg...','..gghhgg..','..gggggg..','...gggg...','....gg....','...ssss...'],
    crystal: ['....a.....','...aab....','..aaabb...','..aabbbc..','.aaabbbcc.','..abbbcc..','...bcc....']
  };
  const rand = (x, y, salt = 0) => { let value = Math.imul(x + salt * 17, 374761393) ^ Math.imul(y + 13, 668265263); value = Math.imul(value ^ value >>> 13, 1274126177); return ((value ^ value >>> 16) >>> 0) / 4294967295; };
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const count = id => state.inventory[id] || 0;
  const inCave = () => state.player.cave;
  const inHome = () => state.player.inside;
  const interior = () => state.player.cave || state.player.inside;
  const currentEntities = () => {
    const home = inHome(), cave = inCave(), location = home ? 'home' : cave ? 'cave' : 'surface';
    const currentWorld = state.player.moon ? 2 : state.player.world || 0;
    const base = home ? homeEntities : cave ? caveEntities : entities;
    const drops = (state.drops || []).filter(drop => (drop.home ? 'home' : drop.cave ? 'cave' : 'surface') === location && (location !== 'surface' || (drop.world || 0) === currentWorld));
    return drops.length ? [...base, ...drops] : base;
  };
  const currentBuildings = () => { if (state.player.moon) return []; const loc = inHome() ? 'home' : inCave() ? 'cave' : 'surface'; const w = state.player.world || 0; return state.buildings.filter(b => (b.home ? 'home' : b.cave ? 'cave' : 'surface') === loc && (loc !== 'surface' || (b.world || 0) === w)); };
  function terrainAt(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= WIDTH || ty >= HEIGHT) return 0;
    return terrain[ty * WIDTH + tx];
  }
  function tileAt(x, y) {
    const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
    if (inHome()) return (tx >= 5 && tx <= 20 && ty >= 5 && ty <= 13) ? 7 : 8;
    if (inCave()) return tx < 3 || tx > 34 || ty < 3 || ty > 24 || ((tx === 13 || tx === 24) && ty > 7 && ty < 21 && ty !== 14 && ty !== 15) ? 5 : 6;
    if (state.player.moon) return 6;
    return terrainAt(tx, ty);
  }
  function generate() {
    terrain = new Uint8Array(WIDTH * HEIGHT); entities = []; caveEntities = [];
    for (let ty = 0; ty < HEIGHT; ty++) for (let tx = 0; tx < WIDTH; tx++) {
      let tile = 0;
      for (const island of islands) {
        const normalized = Math.hypot((tx - island.x) / island.rx, (ty - island.y) / island.ry);
        const coast = 1 + Math.sin(tx * .24 + ty * .15) * .045 + Math.cos(ty * .31) * .03;
        if (normalized < coast + .075) tile = 1;
        if (normalized < coast) tile = 2;
        if (normalized < coast - .13) tile = 3;
      }
      if (tile === 3 && ty > 43 && ty < 96 && Math.abs(tx - (66 + Math.sin(ty * .12) * 6)) < 1.7) tile = 1;
      if (ty >= 70 && ty <= 71 && tx > 61 && tx < 74) tile = 4;
      terrain[ty * WIDTH + tx] = tile;
      const chance = rand(tx, ty);
      const safe = Math.hypot(tx - 42, ty - 85) < 4 || Math.hypot(tx - 59, ty - 46) < 5 || Math.hypot(tx - 47, ty - 64) < 5 || Math.hypot(tx - 144, ty - 40) < 4 || Math.hypot(tx - 141, ty - 111) < 4 || Math.hypot(tx - 54, ty - 82) < 4 || (Math.abs(tx - 144) <= 4 && Math.abs(ty - 56) <= 2);
      if (tile === 3 && !safe) {
        const type = chance < .075 ? 'tree' : chance < .098 ? 'rock' : chance < .117 ? 'bush' : chance < .135 ? 'fiber' : null;
        if (type) entities.push({ id: `n${tx},${ty}`, type, x: tx * TILE + 8, y: ty * TILE + 8, hp: type === 'tree' ? 3 : type === 'rock' ? 3 : 1, depleted: false, seed: rand(tx, ty, 8) });
      }
    }
    entities.push(
      { id: 'ruins', type: 'ruin', x: 47 * TILE, y: 64 * TILE },
      { id: 'lighthouse', type: 'lighthouse', x: 59 * TILE, y: 46 * TILE },
      { id: 'cave0', type: 'cave', x: 80 * TILE, y: 61 * TILE, island: 0 },
      { id: 'cave1', type: 'cave', x: 144 * TILE, y: 40 * TILE, island: 1 },
      { id: 'airstrip', type: 'airstrip', x: 144 * TILE + 8, y: 56 * TILE + 8 },
      { id: 'shrine', type: 'shrine', x: 141 * TILE, y: 111 * TILE },
      { id: 'sign', type: 'sign', x: 43 * TILE, y: 82 * TILE },
      { id: 'dock0', type: 'dock', x: 90 * TILE, y: 72 * TILE },
      { id: 'dock1', type: 'dock', x: 123 * TILE, y: 51 * TILE },
      { id: 'dock2', type: 'dock', x: 123 * TILE, y: 99 * TILE }
    );
    const places = [
      ['dock', 'dock3', 189, 66], ['dock', 'dock4', 195, 143], ['dock', 'dock5', 57, 160],
      ['wreck', 'wreck', 39, 91], ['wreck', 'wreck1', 206, 58], ['wreck', 'wreck2', 220, 75], ['wreck', 'wreck3', 37, 166],
      ['camp', 'camp0', 34, 74], ['camp', 'camp1', 148, 104], ['camp', 'camp2', 208, 71], ['camp', 'camp3', 206, 151], ['camp', 'camp4', 47, 157],
      ['cabin', 'cabin0', 70, 92], ['cabin', 'cabin1', 130, 118], ['cabin', 'cabin2', 205, 72], ['cabin', 'cabin3', 210, 137], ['cabin', 'cabin4', 221, 149],
      ['tower', 'tower0', 150, 33], ['tower', 'tower1', 213, 61], ['tower', 'tower2', 215, 141],
      ['cache', 'cache0', 52, 55], ['cache', 'cache1', 136, 48], ['cache', 'cache2', 217, 67], ['cache', 'cache3', 223, 143], ['cache', 'cache4', 44, 163]
    ];
    for (const [type, id, tx, ty] of places) entities.push({ id, type, x: tx * TILE + 8, y: ty * TILE + 8, seed: rand(tx, ty, 4) });
    entities = entities.filter(e => !['tree', 'rock', 'bush', 'fiber'].includes(e.type) || !places.some(([, , tx, ty]) => Math.abs(tx * TILE + 8 - e.x) < 30 && Math.abs(ty * TILE + 8 - e.y) < 30));
    for (let index = 0; index < 60; index++) {
      const island = islands[index % islands.length];
      const tx = Math.round(island.x + (rand(index, 1) - .5) * island.rx * 1.3);
      const ty = Math.round(island.y + (rand(index, 2) - .5) * island.ry * 1.3);
      if (terrainAt(tx, ty) === 3) entities.push({ id: `animal${index}`, type: index % 4 === 0 ? 'boar' : index % 4 === 1 ? 'shade' : 'deer', x: tx * TILE, y: ty * TILE, homeX: tx * TILE, homeY: ty * TILE, hp: index % 4 === 0 ? 50 : 40, timer: index, seed: rand(index, 3) });
    }
    for (const [index, pos] of [[0, [140, 109]], [1, [143, 113]], [2, [138, 112]]]) entities.push({ id: `guardian${index}`, type: 'shade', x: pos[0] * TILE, y: pos[1] * TILE, homeX: pos[0] * TILE, homeY: pos[1] * TILE, hp: 60, timer: index });
    for (let index = 0; index < 14; index++) caveEntities.push({ id: `crystal${index}`, type: 'crystal', x: (6 + index % 7 * 4) * TILE, y: (index < 7 ? 8 : 20) * TILE, hp: 2, seed: index / 14 });
    caveEntities.push({ id: 'cave-exit', type: 'exit', x: 6 * TILE, y: 14 * TILE }, { id: 'cave-relic', type: 'altar', x: 31 * TILE, y: 14 * TILE });
    for (let index = 0; index < 4; index++) caveEntities.push({ id: `bat${index}`, type: 'bat', x: (17 + index * 3) * TILE, y: 13 * TILE, homeX: (17 + index * 3) * TILE, homeY: 13 * TILE, hp: 30, timer: index });
    homeEntities = [{ id: 'home-door', type: 'door', x: 12 * TILE + 8, y: 13 * TILE + 8 }];
    terrain0 = terrain; entities0 = entities;
    generateFarWorld();
    generateMoonWorld();
    createMap();
  }
  function generateFarWorld() {
    terrain2 = new Uint8Array(WIDTH * HEIGHT); entities2 = [];
    const isles = [{ x: 74, y: 74, rx: 50, ry: 42 }, { x: 178, y: 118, rx: 38, ry: 32 }, { x: 196, y: 48, rx: 26, ry: 22 }];
    for (let ty = 0; ty < HEIGHT; ty++) for (let tx = 0; tx < WIDTH; tx++) {
      let tile = 0;
      for (const island of isles) { const n = Math.hypot((tx - island.x) / island.rx, (ty - island.y) / island.ry); const coast = 1 + Math.sin(tx * .2 + ty * .17) * .05 + Math.cos(ty * .27) * .035; if (n < coast + .08) tile = 1; if (n < coast) tile = 2; if (n < coast - .12) tile = 3; }
      terrain2[ty * WIDTH + tx] = tile;
      const chance = rand(tx, ty, 99), safe = Math.hypot(tx - 74, ty - 74) < 5;
      if (tile === 3 && !safe) { const type = chance < .08 ? 'tree' : chance < .104 ? 'rock' : chance < .124 ? 'bush' : chance < .144 ? 'fiber' : chance < .15 ? 'crystal' : null; if (type) entities2.push({ id: `w1-${tx},${ty}`, type, x: tx * TILE + 8, y: ty * TILE + 8, hp: type === 'tree' ? 3 : type === 'rock' ? 3 : type === 'crystal' ? 2 : 1, depleted: false, seed: rand(tx, ty, 8) }); }
    }
    entities2.push({ id: 'w1-tower0', type: 'tower', x: 178 * TILE, y: 118 * TILE, seed: .3 }, { id: 'w1-tower1', type: 'tower', x: 196 * TILE, y: 48 * TILE, seed: .7 });
    for (let index = 0; index < 26; index++) { const island = isles[index % 3]; const tx = Math.round(island.x + (rand(index, 1, 7) - .5) * island.rx * 1.3), ty = Math.round(island.y + (rand(index, 2, 7) - .5) * island.ry * 1.3); if (terrain2[ty * WIDTH + tx] === 3) entities2.push({ id: `w1-animal${index}`, type: index % 3 === 0 ? 'boar' : index % 3 === 1 ? 'shade' : 'deer', x: tx * TILE, y: ty * TILE, homeX: tx * TILE, homeY: ty * TILE, hp: index % 3 === 0 ? 50 : 40, timer: index, seed: rand(index, 3) }); }
  }
  function generateMoonWorld() {
    moonTerrain = new Uint8Array(WIDTH * HEIGHT).fill(6);
    moonEntities = [{ id: 'moon-rocket', type: 'moonrocket', x: 128 * TILE + 8, y: 91 * TILE + 8 }];
  }
  function setWorldActive() {
    terrain = state.player.moon ? moonTerrain : state.player.world === 1 ? terrain2 : terrain0; entities = state.player.moon ? moonEntities : state.player.world === 1 ? entities2 : entities0;
    for (const e of entities) { e.depleted = !!state.depleted[e.id]; if (['tree', 'rock', 'crystal'].includes(e.type)) e.hp = e.type === 'crystal' ? 2 : 3; }
    createMap();
  }
  function seedHome() {
    if (state.buildings.some(b => b.home)) return;
    state.buildings.push(
      { type: 'bed', x: 7 * TILE + 8, y: 6 * TILE + 8, cave: false, home: true },
      { type: 'table', x: 14 * TILE + 8, y: 7 * TILE + 8, cave: false, home: true },
      { type: 'painting', x: 12 * TILE + 8, y: 5 * TILE + 8, cave: false, home: true }
    );
  }
  function freshState() {
    return { version: 3, player: { x: 42 * TILE, y: 85 * TILE, health: 100, stamina: 100, face: { x: 0, y: 1 }, cave: false, inside: false, vehicle: null, world: 0, moon: false }, inventory: { berries: 3 }, buildings: [], drops: [], depleted: {}, stats: { wood: 0, stone: 0, gathered: 0, crafted: 0, kills: 0, fished: 0, cooked: 0, harvested: 0 }, relics: [], achievements: [], discovered: [0], quest: 0, day: 1, time: 8 * 60, won: false, runwayRepaired: false, moonOrigin: null, moonExposure: 0, spawn: { x: 42 * TILE, y: 85 * TILE }, seen: [], looted: [], caveOrigin: null, homeOrigin: null, hotbar: [...DEFAULT_HOTBAR] };
  }
  function notify(text, detail = '') {
    const toast = document.createElement('div'); toast.className = 'toast'; toast.textContent = text;
    if (detail) { const small = document.createElement('small'); small.textContent = detail; toast.append(small); }
    $('notifications').append(toast);
    while ($('notifications').children.length > 4) $('notifications').firstChild.remove();
    setTimeout(() => toast.remove(), 4500);
  }
  function tone(frequency = 440, length = .09, type = 'sine') {
    if (!soundOn) return;
    try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); const oscillator = audio.createOscillator(), gain = audio.createGain(); oscillator.type = type; oscillator.frequency.value = frequency; gain.gain.setValueAtTime(.035, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + length); oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + length); } catch { soundOn = false; }
  }
  function addItem(id, amount) {
    state.inventory[id] = count(id) + amount;
    if (id === 'wood' || id === 'stone') state.stats[id] += amount;
    state.stats.gathered += amount; notify(`+${amount} ${items[id].name}`); updateProgress();
  }
  function dropItem(x, y, item, amount) {
    if (!items[item] || !Number.isInteger(amount) || amount < 1) return;
    state.drops ||= [];
    const offset = (Math.random() - .5) * 14;
    state.drops.push({ id: `drop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type: 'drop', item, amount, x: Math.max(8, Math.min(WIDTH * TILE - 8, x + offset)), y: Math.max(8, Math.min(HEIGHT * TILE - 8, y + offset)), cave: !!inCave(), home: !!inHome(), world: state.player.moon ? 2 : state.player.world || 0 });
  }
  function updateProgress() {
    while (state.quest < quests.length - 1 && quests[state.quest].value(state) >= quests[state.quest].goal) { notify('Journey complete', quests[state.quest].title); state.quest++; tone(660, .18); }
    for (const achievement of achievements) if (!state.achievements.includes(achievement.id) && achievement.test(state)) { state.achievements.push(achievement.id); notify('Achievement unlocked', achievement.name); }
    updateHUD();
  }
  function save(silent = false) {
    state.caveOrigin = caveOrigin; state.homeOrigin = homeOrigin;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); lastSave = Date.now(); $('save-status').textContent = 'SAVED JUST NOW'; if (!silent) notify('Adventure saved', 'Stored in this browser.'); return true; }
    catch { if (!silent) notify('Browser storage unavailable', 'Use Export save in the pause menu.'); return false; }
  }
  function validSave(data) {
    const finite = value => typeof value === 'number' && Number.isFinite(value);
    const point = value => value && finite(value.x) && finite(value.y) && value.x >= 0 && value.y >= 0 && value.x < WIDTH * TILE && value.y < HEIGHT * TILE;
    return data && data.version === 3 && point(data.player) && point(data.spawn) && typeof data.player.cave === 'boolean' && typeof data.player.inside === 'boolean' && data.player.face && finite(data.player.face.x) && finite(data.player.face.y) && Math.abs(data.player.face.x) <= 1 && Math.abs(data.player.face.y) <= 1 && finite(data.player.health) && data.player.health > 0 && data.player.health <= 100 && finite(data.player.stamina) && data.player.stamina >= 0 && data.player.stamina <= 100 && Number.isInteger(data.quest) && data.quest >= 0 && data.quest < quests.length && finite(data.time) && data.time >= 0 && data.time < 1440 && Number.isInteger(data.day) && data.day > 0 && data.inventory && Object.entries(data.inventory).every(([id, quantity]) => items[id] && Number.isInteger(quantity) && quantity >= 0 && quantity < 1000000) && Array.isArray(data.buildings) && data.buildings.length < 10000 && data.buildings.every(b => point(b) && (b.type === 'crop' ? Number.isInteger(b.planted) && b.planted >= 0 && b.planted < 1e9 : recipes.some(r => r.id === b.type && r.build)) && typeof b.cave === 'boolean' && (b.home === undefined || typeof b.home === 'boolean') && (b.world === undefined || b.world === 0 || b.world === 1)) && ['relics', 'achievements', 'discovered', 'seen', 'looted'].every(key => Array.isArray(data[key])) && data.relics.every(id => ['ruins', 'moon', 'shrine'].includes(id)) && new Set(data.relics).size === data.relics.length && data.discovered.every(id => Number.isInteger(id) && id >= 0 && id < islands.length) && data.achievements.every(id => achievements.some(a => a.id === id)) && data.seen.every(id => typeof id === 'string') && data.looted.every(id => typeof id === 'string') && typeof data.won === 'boolean' && data.stats && ['wood', 'stone', 'gathered', 'crafted', 'kills'].every(key => finite(data.stats[key]) && data.stats[key] >= 0) && data.depleted && Object.entries(data.depleted).every(([id, value]) => typeof id === 'string' && Number.isInteger(value) && value >= 0) && (!data.player.cave || point(data.caveOrigin)) && (!data.player.inside || point(data.homeOrigin)) && (data.player.vehicle === undefined || data.player.vehicle === null || ['car', 'plane'].includes(data.player.vehicle)) && (data.player.world === undefined || data.player.world === 0 || data.player.world === 1) && (data.hotbar === undefined || (Array.isArray(data.hotbar) && data.hotbar.length === 8 && data.hotbar.every(id => id === null || items[id])));
  }
  function applySave(data) {
    if (!validSave(data)) throw new Error('Invalid save');
    state = data; caveOrigin = data.caveOrigin; homeOrigin = data.homeOrigin; placing = null; keys = {}; selected = 'wood';
    if (typeof state.runwayRepaired !== 'boolean') state.runwayRepaired = false;
    state.player.moon = !!state.player.moon; state.moonExposure = Number.isFinite(state.moonExposure) ? state.moonExposure : 0;
    if (!state.moonOrigin || !Number.isFinite(state.moonOrigin.x) || !Number.isFinite(state.moonOrigin.y)) state.moonOrigin = { x: state.spawn.x, y: state.spawn.y, world: 0 };
    state.drops = Array.isArray(state.drops) ? state.drops.filter(drop => drop && typeof drop.id === 'string' && drop.type === 'drop' && point(drop) && items[drop.item] && Number.isInteger(drop.amount) && drop.amount > 0 && typeof drop.cave === 'boolean' && typeof drop.home === 'boolean' && [0, 1, 2].includes(drop.world)) : [];
    if (!Array.isArray(state.hotbar) || state.hotbar.length !== 8) state.hotbar = [...DEFAULT_HOTBAR];
    if (state.player.vehicle === undefined) state.player.vehicle = null;
    if (state.player.world === undefined) state.player.world = 0;
    planeTakeoff = null; planeAltitude = state.player.vehicle === 'plane' ? 84 : 0;
    bombs = []; rocketFlight = null; hotbarEdit = null;
    setWorldActive();
    for (const entity of [...entities0, ...entities2, ...moonEntities, ...caveEntities]) { entity.depleted = !!state.depleted[entity.id]; if (['tree', 'rock', 'crystal'].includes(entity.type)) entity.hp = entity.type === 'crystal' ? 2 : 3; }
    particles = []; floaters = []; camera.x = state.player.x; camera.y = state.player.y; updateProgress();
  }
  function load() {
    try { const raw = localStorage.getItem(SAVE_KEY); if (!raw) { notify('No saved adventure yet'); return false; } applySave(JSON.parse(raw)); closePanel(); notify('Welcome back, wanderer'); return true; }
    catch { notify('Could not load this save', 'Your current adventure has not been changed.'); return false; }
  }
  function canCraft(recipe) { return (!recipe.unique || !count(recipe.id)) && (!recipe.requires || recipe.requires(state)) && Object.entries(recipe.cost).every(([id, quantity]) => count(id) >= quantity); }
  function craft(id) {
    const recipe = recipes.find(entry => entry.id === id); if (!recipe || !canCraft(recipe)) return false;
    for (const [resource, quantity] of Object.entries(recipe.cost)) state.inventory[resource] -= quantity;
    state.inventory[id] = count(id) + 1; state.stats.crafted++; if (recipe.cook) state.stats.cooked = (state.stats.cooked || 0) + 1; selected = id; tone(620, .12); notify(`${items[id].name} crafted`);
    updateProgress(); if (recipe.build) { closePanel(); placing = id; notify('Choose your spot', 'Click ground or press E ahead of you. Escape cancels.'); } else if (panel === 'craft') renderPanel();
    return true;
  }
  function buildAt(x, y) {
    if (!placing || !count(placing)) return false;
    x = Math.floor(x / TILE) * TILE + 8; y = Math.floor(y / TILE) * TILE + 8;
    const tile = tileAt(x, y), spot = { x, y }, isDecor = decorTypes.includes(placing), small = isDecor || placing === 'seeds', explosive = placing === 'bomb' || placing === 'tnt';
    if (isDecor !== inHome()) { notify(isDecor ? 'Decorations go inside your home' : 'Step outside to build this'); return false; }
    if (placing === 'seeds' && !count('hoe')) { notify('You need a hoe', 'Craft a hoe before you can till soil and plant seeds.'); return false; }
    const badTile = ['bridge', 'dock'].includes(placing) ? tile !== 1 : placing === 'seeds' ? tile !== 3 : isDecor ? tile !== 7 : ![2, 3, 6].includes(tile);
    if (distance(spot, state.player) > 80 || badTile || (!explosive && (currentBuildings().some(b => distance(b, spot) < (small ? 14 : 22)) || currentEntities().some(e => !e.depleted && !['deer', 'shade', 'boar', 'bat', 'door'].includes(e.type) && distance(e, spot) < (small ? 16 : 23)) || (['wall', 'shelter', 'house'].includes(placing) && distance(spot, state.player) < 20)))) { notify('Not a good building spot', placing === 'seeds' ? 'Plant seeds on open grass.' : isDecor ? 'Choose a clear floor tile inside your home.' : 'Choose a clear tile nearby. Bridges go in shallow water.'); return false; }
    if (explosive) { bombs.push({ type: placing, x, y, fuse: 1.6, power: placing === 'tnt' ? 72 : 42 }); state.inventory[placing]--; tone(140, .12, 'square'); notify(`${items[placing].name} set`, 'Step back \u2014 it is about to blow!'); }
    else if (placing === 'seeds') { state.buildings.push({ type: 'crop', x, y, planted: state.day * 1440 + Math.floor(state.time), cave: false, home: false }); state.inventory.seeds--; tone(300, .1); notify('Seeds planted', 'They will ripen over the next day or so.'); }
    else { state.buildings.push({ type: placing, x, y, cave: !!inCave(), home: !!inHome(), world: state.player.world || 0 }); state.inventory[placing]--; tone(220, .15, 'triangle'); notify(`${items[placing].name} placed`); if (['shelter', 'house'].includes(placing) && !interior()) state.spawn = { x: x + 24, y: y + 24 }; }
    placing = count(placing) ? placing : null; updateProgress(); return true;
  }
  function explode(x, y, power) {
    burst(x, y, '#f4b24a', 34); burst(x, y, '#e0564a', 18); burst(x, y, '#6b6b6b', 14);
    for (let index = 0; index < 10; index++) particles.push({ x, y, vx: (Math.random() - .5) * 220, vy: -Math.random() * 170, life: .85, color: '#ffd98a' });
    tone(70, .4, 'sawtooth'); tone(48, .5, 'square');
    let cleared = 0;
    for (const e of currentEntities()) {
      if (e.depleted) continue; const d = Math.hypot(e.x - x, e.y - y); if (d > power) continue;
      if (['tree', 'rock', 'bush', 'fiber', 'crystal'].includes(e.type)) { e.depleted = true; state.depleted[e.id] = state.day; dropItem(e.x, e.y, { tree: 'wood', rock: 'stone', bush: 'berries', fiber: 'fiber', crystal: 'crystal' }[e.type], e.type === 'tree' ? 2 : 1); cleared++; }
      else if (['shade', 'boar', 'bat', 'deer'].includes(e.type)) { e.hp -= 60; burst(e.x, e.y - 8, '#d2d8ac'); if (e.hp <= 0) { e.depleted = true; state.depleted[e.id] = state.day; state.stats.kills++; dropItem(e.x, e.y, e.type === 'shade' || e.type === 'bat' ? 'crystal' : 'berries', 1); } }
    }
    if (cleared) notify('The blast scattered supplies', `${cleared} drop${cleared > 1 ? 's' : ''} landed nearby. Press E to collect them.`);
    if (Math.hypot(state.player.x - x, state.player.y - y) < power * .65) hurt(28);
    updateProgress(); save(true);
  }
  function startRocketFlight(destination) {
    if (interior() || rocketFlight) { notify('Step outside to board the rocket'); return; }
    if (destination.moon) state.moonOrigin = { x: destination.x, y: destination.y, world: destination.world || 0 };
    rocketFlight = { timer: 2.4, destination };
    actionCooldown = 2.5; tone(300, .25); notify('Boarding the rocket', 'Engines warming up.');
  }
  function finishRocketFlight() {
    const destination = rocketFlight.destination; rocketFlight = null;
    keys.e = false;
    state.player.moon = destination.moon;
    if (destination.moon) {
      state.player.x = 128 * TILE + 8; state.player.y = 89 * TILE + 8; state.moonExposure = 0;
      setWorldActive(); camera.x = state.player.x; camera.y = state.player.y;
      notify('Touchdown on the Moon', count('spacesuit') ? 'Your spacesuit is holding. Press E at the rocket to return.' : 'No spacesuit! The lunar cold is draining your health.');
    } else {
      state.player.world = destination.world || 0; state.player.x = destination.x; state.player.y = destination.y + 32; state.moonExposure = 0;
      setWorldActive(); camera.x = state.player.x; camera.y = state.player.y;
      notify('Back on the island', 'The rocket is ready for another trip.');
    }
    worldTravelCD = 1; updateHUD(); save(true);
  }
  function blocked(x, y, actor = 'player') {
    const tile = tileAt(x, y);
    if (tile === 5 || tile === 8) return true;
    if (tile === 0 || tile === 1) {
      if (currentBuildings().some(b => ['bridge', 'dock'].includes(b.type) && Math.abs(b.x - x) < 15 && Math.abs(b.y - y) < 15)) return false;
      if (actor !== 'player' || !(count('raft') || count('ship'))) return true;
    }
    if (currentBuildings().some(b => ['wall', 'shelter', 'house', 'stonewall'].includes(b.type) && Math.abs(b.x - x) < (['shelter', 'house'].includes(b.type) ? 15 : 10) && Math.abs(b.y - y) < 10)) return true;
    return currentEntities().some(e => !e.depleted && ['tree', 'rock', 'crystal', 'lighthouse', 'shrine', 'ruin', 'cabin', 'tower', 'rocket', 'moonrocket'].includes(e.type) && Math.abs(e.x - x) < (e.type === 'tree' ? 7 : 13) && Math.abs(e.y - y) < 8);
  }
  function nearest() {
    const options = [...currentEntities(), ...currentBuildings()];
    return options.filter(e => !e.depleted && !['deer', 'shade', 'boar', 'bat', 'dock', 'table', 'chair', 'rug', 'lamp', 'plant', 'bookshelf', 'painting', 'lanternpost', 'stonewall', 'fireplace', 'clock', 'runway'].includes(e.type) && distance(e, state.player) < (['lighthouse', 'ruin', 'cave', 'shrine', 'shelter', 'house', 'cabin', 'tower', 'door', 'portal', 'rocket', 'moonrocket'].includes(e.type) ? 55 : 36)).sort((a, b) => distance(a, state.player) - distance(b, state.player))[0];
  }
  function burst(x, y, color, amount = 9) { for (let index = 0; index < amount; index++) particles.push({ x, y, vx: (Math.random() - .5) * 60, vy: -Math.random() * 65, life: .6, color }); }
  function relic(id) {
    if (state.relics.includes(id)) { notify('Only echoes remain'); return; }
    state.relics.push(id); state.inventory.relic = state.relics.length; burst(state.player.x, state.player.y - 10, '#f2da86', 30); notify('An ancient relic recovered', `${state.relics.length} of 3. The lighthouse is calling.`); tone(880, .4); updateProgress(); save(true);
  }
  function tryFish() {
    if (!count('rod') || interior()) return;
    const fx = state.player.x + state.player.face.x * 18, fy = state.player.y + state.player.face.y * 18;
    if (tileAt(fx, fy) > 1) return;
    if (state.player.stamina < 6) { notify('Too tired to cast'); return; }
    actionCooldown = .9; swing = .2; state.player.stamina -= 6; tone(420, .1);
    if (Math.random() < .6) { state.stats.fished = (state.stats.fished || 0) + 1; burst(fx, fy, '#bfe4ea', 8); addItem('fish', 1); updateProgress(); }
    else { burst(fx, fy, '#bfe4ea', 4); notify("Nothing's biting", 'Try again, or move along the shore.'); }
  }
  function interact() {
    if (panel || actionCooldown > 0 || rocketFlight) return;
    if (placing) { buildAt(state.player.x + state.player.face.x * 32, state.player.y + state.player.face.y * 32); return; }
    const target = nearest(); if (!target) { tryFish(); return; }
    actionCooldown = .38;
    const type = target.type;
    if (['tree', 'rock', 'bush', 'fiber', 'crystal'].includes(type)) {
      if (state.player.stamina < 7) { notify('Catch your breath'); return; }
      if (type === 'crystal' && !count('pickaxe')) { notify('You need a pickaxe', 'Craft one with wood and stone.'); return; }
      state.player.stamina -= 7; swing = .2; swingTool = type === 'tree' ? 'axe' : ['rock', 'crystal'].includes(type) ? 'pickaxe' : null; tone(type === 'rock' || type === 'crystal' ? 170 : 270, .07, 'triangle');
      target.hp -= (type === 'tree' && count('axe') || ['rock', 'crystal'].includes(type) && count('pickaxe')) ? 2 : 1;
      burst(target.x, target.y - 9, type === 'tree' ? '#b4cc84' : items[type === 'bush' ? 'berries' : type === 'rock' ? 'stone' : type === 'crystal' ? 'crystal' : 'fiber'].color);
      if (target.hp <= 0) { target.depleted = true; state.depleted[target.id] = state.day; const resource = { tree: 'wood', rock: 'stone', bush: 'berries', fiber: 'fiber', crystal: 'crystal' }[type], amount = type === 'tree' ? (count('axe') ? 5 : 3) : type === 'rock' ? (count('pickaxe') ? 4 : 3) : type === 'crystal' ? 2 : 3; dropItem(target.x, target.y, resource, amount); burst(target.x, target.y - 12, items[resource].color, 16); notify(`${items[resource].name} dropped`, 'Press E nearby to pick it up.'); save(true); }
    } else if (type === 'drop') {
      state.drops = state.drops.filter(drop => drop.id !== target.id); burst(target.x, target.y - 5, items[target.item].color, 8); tone(520, .08); addItem(target.item, target.amount); save(true);
    } else if (type === 'ruin') { relic('ruins'); if (!state.seen.includes('ruins')) { state.seen.push('ruins'); notify('A weathered inscription', 'Three keepers. Three stones. One light across the sea.'); } }
    else if (type === 'shrine') {
      if (entities.some(e => e.id.startsWith('guardian') && !e.depleted && distance(e, target) < 180)) notify('The shrine is guarded', 'Defeat the nearby shadows first.'); else relic('shrine');
    } else if (type === 'altar') { if (caveOrigin?.island === 1) relic('moon'); else notify('An empty altar', 'The moonstone keeper sailed to the eastern island.'); }
    else if (type === 'cave') { caveOrigin = { x: target.x, y: target.y + 35, island: target.island }; state.player.cave = true; state.player.x = 7 * TILE; state.player.y = 14 * TILE; camera.x = state.player.x; camera.y = state.player.y; notify('Beneath the island', 'Moonstone glimmers in the dark.'); }
    else if (type === 'exit') { if (caveOrigin) { state.player.x = caveOrigin.x; state.player.y = caveOrigin.y; } state.player.cave = false; camera.x = state.player.x; camera.y = state.player.y; }
    else if (type === 'wreck') { if (state.looted.includes(target.id)) notify('The wreck has given all it can'); else { state.looted.push(target.id); addItem('wood', 5); addItem('fiber', 4); notify('A salt-stained journal', 'The northern lighthouse went dark. Its keepers never returned.'); save(true); } }
    else if (['camp', 'cabin', 'cache', 'tower'].includes(type)) {
      if (state.looted.includes(target.id)) { notify('Nothing left to salvage here'); }
      else {
        state.looted.push(target.id);
        const loot = { camp: { wood: 3, fiber: 3 }, cabin: { wood: 4, stone: 3 }, cache: { wood: 2, stone: 2, fiber: 2 }, tower: { stone: 5 } }[type];
        for (const [resource, quantity] of Object.entries(loot)) addItem(resource, quantity);
        const note = { camp: ['An abandoned camp', 'Cold ashes and a torn map hint at more islands further out to sea.'], cabin: ['A ruined cabin', 'Someone sheltered here once, waiting for a light that never came.'], cache: ['A supply cache', 'Weathered crates, still holding usable goods.'], tower: ['A fallen watchtower', 'From the rubble you glimpse yet more land across the water.'] }[type];
        notify(note[0], note[1]); save(true);
      }
    }
    else if (type === 'airstrip') {
      if (state.runwayRepaired) notify('The runway is ready', 'Stand on the strip and select your Plane to take off.');
      else if (count('wood') < 10 || count('stone') < 8 || count('fiber') < 4) notify('The runway needs repair', 'Bring 10 wood, 8 stone, and 4 fiber.');
      else {
        state.inventory.wood -= 10; state.inventory.stone -= 8; state.inventory.fiber -= 4; state.runwayRepaired = true;
        notify('Runway repaired', 'Stand on the strip and select your Plane to take off.'); tone(660, .3); save(true);
      }
    }
    else if (type === 'rocket') startRocketFlight({ moon: true, x: target.x, y: target.y, world: state.player.world || 0 });
    else if (type === 'moonrocket') startRocketFlight({ moon: false, ...(state.moonOrigin || { x: state.spawn.x, y: state.spawn.y, world: 0 }) });
    else if (type === 'sign') notify('The old trail', 'Ruins northwest. Lighthouse north. Moonstone across the eastern sea. Build a raft to reach the far islands beyond the deep water.');
    else if (type === 'campfire') { state.player.health = Math.min(100, state.player.health + 20); state.player.stamina = 100; notify('A moment of warmth', '+20 health. Stamina restored.'); }
    else if (type === 'well') { state.player.stamina = 100; state.player.health = Math.min(100, state.player.health + 5); notify('Cool, clear water', 'Stamina restored.'); tone(500); }
    else if (type === 'crop') { const age = (state.day * 1440 + state.time) - target.planted; if (age < 640) { notify('Still growing', age < 300 ? 'Just a sprout for now.' : 'Almost ripe — come back later.'); } else { state.buildings = state.buildings.filter(b => b !== target); state.stats.harvested = (state.stats.harvested || 0) + 1; addItem('veg', 2); addItem('seeds', 1); notify('Harvested your crop', '+2 vegetables, +1 seed to replant.'); tone(560); save(true); } }
    else if (type === 'shelter') {
      if (interior()) { notify('Rest here, but make a home on the surface'); }
      else {
        state.spawn = { x: target.x + 24, y: target.y + 24 };
        if (state.time >= 360 && state.time <= 1140) { notify('You can only sleep at night', 'This is your home now. Come back after dusk to rest.'); save(true); }
        else { advanceDay(); state.time = 8 * 60; state.player.health = 100; state.player.stamina = 100; notify('You slept until dawn', 'A new morning. Health and stamina restored.'); save(true); }
      }
    }
    else if (type === 'house') {
      homeOrigin = { x: target.x, y: target.y + 32 }; state.spawn = { x: target.x, y: target.y + 32 };
      seedHome();
      state.player.inside = true; state.player.cave = false; state.player.x = 12 * TILE; state.player.y = 11 * TILE; state.player.face = { x: 0, y: -1 }; camera.x = state.player.x; camera.y = state.player.y;
      notify('Inside your home', 'Decorate it! Craft decor (C) and place it with E. Press E at the door to leave.'); tone(440, .12); save(true);
    }
    else if (type === 'door') { if (homeOrigin) { state.player.x = homeOrigin.x; state.player.y = homeOrigin.y; } state.player.inside = false; state.player.face = { x: 0, y: 1 }; camera.x = state.player.x; camera.y = state.player.y; notify('Back outside'); }
    else if (type === 'bed') {
      state.spawn = { x: homeOrigin ? homeOrigin.x : state.spawn.x, y: homeOrigin ? homeOrigin.y : state.spawn.y };
      if (state.time >= 360 && state.time <= 1140) { notify('You can only sleep at night', 'Come back to bed after dusk to rest.'); }
      else { advanceDay(); state.time = 8 * 60; state.player.health = 100; state.player.stamina = 100; notify('You slept until dawn', 'A new morning. Health and stamina restored.'); save(true); }
    }
    else if (type === 'lighthouse') {
      if (state.won) { openPanel('victory'); return; }
      if (state.relics.length < 3 || count('wood') < 12 || count('stone') < 10 || count('crystal') < 6) { notify('Restore the lighthouse', 'Needs 3 relics, 12 wood, 10 stone, and 6 moonstone.'); return; }
      state.inventory.wood -= 12; state.inventory.stone -= 10; state.inventory.crystal -= 6; state.won = true; updateProgress(); save(true); openPanel('victory'); tone(880, .7);
    }
    updateHUD();
  }
  function attack() {
    if (panel || actionCooldown > 0 || state.player.stamina < 10) return;
    actionCooldown = .4; swing = .25; state.player.stamina -= 10; tone(110, .08, 'triangle');
    const reach = count('sword') ? 48 : count('spear') ? 58 : 35;
    const damage = count('sword') ? 30 : count('spear') ? 22 : count('axe') ? 18 : 10;
    for (const entity of currentEntities()) if (!entity.depleted && ['shade', 'boar', 'bat', 'deer'].includes(entity.type) && distance(entity, state.player) < reach) {
      entity.hp -= damage; burst(entity.x, entity.y - 8, '#d2d8ac'); floaters.push({ x: entity.x, y: entity.y - 15, text: `-${damage}`, life: .8 });
      if (entity.hp <= 0) { entity.depleted = true; state.depleted[entity.id] = state.day; state.stats.kills++; addItem(entity.type === 'shade' || entity.type === 'bat' ? 'crystal' : 'berries', entity.type === 'shade' ? 2 : 1); updateProgress(); }
    }
  }
  function useItem(id) {
    if (!count(id)) return;
    selected = id;
    const food = { berries: [12, 20, 'A little taste of summer'], bandage: [40, 0, 'Wounds tended'], jam: [30, 15, 'Sweet and restoring'], rations: [10, 100, 'Fed and ready'], veg: [25, 10, 'Fresh from the garden'], fish: [18, 15, 'A fresh catch'], cookedfish: [35, 20, 'A hot, tasty meal'], stew: [60, 45, 'A hearty, filling stew'] }[id];
    if (food) { const [h, st, msg] = food; if ((h === 0 || state.player.health >= 100) && (st === 0 || state.player.stamina >= 100)) { notify('You are already feeling well'); return; } state.inventory[id]--; state.player.health = Math.min(100, state.player.health + h); state.player.stamina = Math.min(100, state.player.stamina + st); tone(560); notify(msg); }
    else if (id === 'spacesuit') notify('Spacesuit ready', 'You can survive on the Moon.');
    else if (id === 'car') { if (interior()) { notify('Head outside to use your vehicle'); } else { state.player.vehicle = state.player.vehicle === 'car' ? null : 'car'; tone(360, .12); notify(state.player.vehicle ? 'Riding the car' : 'Parked the car', state.player.vehicle ? 'Select it again to get off.' : ''); } }
    else if (id === 'plane') { if (interior()) { notify('Head outside to use your plane'); } else if (state.player.vehicle === 'plane') { state.player.vehicle = null; planeTakeoff = null; planeAltitude = 0; tone(360, .12); notify('Landed the plane'); } else if (!onRunway()) { notify('You need a long runway', 'Lay at least 5 runway tiles in a line and stand on them to take off.'); } else { state.player.vehicle = 'plane'; planeAltitude = 0; planeTakeoff = { elapsed: 0, duration: 2.8, direction: runwayDirection() }; tone(360, .16); notify('Takeoff sequence', 'The plane is accelerating down the runway.'); } }
    else if (recipes.some(r => r.id === id && r.build)) { placing = id; closePanel(); notify(`Place ${items[id].name.toLowerCase()}`, 'Click nearby ground or press E.'); }
    updateHUD(); if (panel === 'inventory') renderPanel();
  }
  function advanceDay() {
    state.day++; updateProgress();
    for (const entity of [...entities, ...caveEntities, ...entities2, ...entities0]) if (entity.depleted && !entity.id.startsWith('guardian') && state.day - state.depleted[entity.id] >= 2) { entity.depleted = false; entity.hp = ['tree', 'rock'].includes(entity.type) ? 3 : entity.type === 'crystal' ? 2 : ['bush', 'fiber'].includes(entity.type) ? 1 : 40; delete state.depleted[entity.id]; }
  }
  function hurt(amount) {
    if (damageCooldown > 0) return;
    damageCooldown = 1; if (count('armor')) amount = Math.ceil(amount * .5); state.player.health -= amount; burst(state.player.x, state.player.y - 10, '#e78b77', 8); tone(90, .15, 'sawtooth');
    if (state.player.health <= 0) respawn();
  }
  function respawn() {
    const diedOnMoon = state.player.moon;
    state.player.moon = false; if (diedOnMoon) state.player.world = 0;
    setWorldActive(); state.player.health = 100; state.player.stamina = 100; state.player.x = state.spawn.x; state.player.y = state.spawn.y; state.player.cave = false; state.player.inside = false; state.moonExposure = 0;
    camera.x = state.player.x; camera.y = state.player.y; advanceDay(); state.time = 8 * 60;
    notify(diedOnMoon ? 'Lost on the Moon' : 'The tide brought you home', diedOnMoon ? 'Without a spacesuit, the lunar cold was fatal. Your inventory is safe.' : 'A new day. Your inventory is safe.'); save(true);
  }
  function update(dt) {
    actionCooldown = Math.max(0, actionCooldown - dt); damageCooldown = Math.max(0, damageCooldown - dt); swing = Math.max(0, swing - dt);
    const player = state.player;
    let dx = Number(!!(keys.d || keys.ArrowRight)) - Number(!!(keys.a || keys.ArrowLeft)), dy = Number(!!(keys.s || keys.ArrowDown)) - Number(!!(keys.w || keys.ArrowUp));
    if (rocketFlight) { rocketFlight.timer -= dt; if (rocketFlight.timer <= 0) finishRocketFlight(); }
    if (planeTakeoff) {
      planeTakeoff.elapsed += dt;
      const progress = Math.min(1, planeTakeoff.elapsed / planeTakeoff.duration), speed = 42 + progress * 130;
      player.x += planeTakeoff.direction.x * speed * dt; player.y += planeTakeoff.direction.y * speed * dt; planeAltitude = 84 * progress;
      if (progress === 1) { planeTakeoff = null; dx = 0; dy = 0; notify('Airborne', 'Use WASD to steer the plane through the sky.'); tone(620, .24); }
    }
    if ((dx || dy) && !rocketFlight && !planeTakeoff) { const length = Math.hypot(dx, dy); dx /= length; dy /= length; player.face = { x: dx, y: dy }; const veh = interior() ? null : player.vehicle; const sailing = !interior() && tileAt(player.x, player.y) <= 1; const sprint = keys.Shift && player.stamina > 5 && !veh; const fly = veh === 'plane'; const speed = (veh === 'plane' ? 165 : veh === 'car' ? 120 : sailing ? (count('ship') ? 104 : 83) : 66) * (sprint ? 1.5 : 1); if (sprint) player.stamina = Math.max(0, player.stamina - dt * 16); if (fly || !blocked(player.x + dx * speed * dt, player.y)) player.x += dx * speed * dt; if (fly || !blocked(player.x, player.y + dy * speed * dt)) player.y += dy * speed * dt; }
    if (!keys.Shift || (!dx && !dy)) player.stamina = Math.min(100, player.stamina + dt * 11);
    if (keys.e && !rocketFlight && !planeTakeoff) interact();
    if (player.moon && !count('spacesuit')) { player.health -= dt * 34; if (player.health <= 0) respawn(); }
    state.time += dt * 3;
    if (state.time >= 1440) { state.time -= 1440; advanceDay(); }
    if (currentBuildings().some(b => b.type === 'campfire' && distance(b, player) < 55)) player.health = Math.min(100, player.health + dt * 3);
    const night = state.time < 360 || state.time > 1140;
    for (const entity of currentEntities()) {
      if (entity.depleted || !['deer', 'boar', 'shade', 'bat'].includes(entity.type) || distance(entity, player) > 360) continue;
      const hostile = entity.type !== 'deer' && (entity.type !== 'shade' || night || entity.id.startsWith('guardian') || distance(entity, player) < 70);
      const dist = distance(entity, player); entity.timer += dt;
      let vx = Math.cos(entity.timer * .45 + (entity.seed || 0) * 9) * .4, vy = Math.sin(entity.timer * .36) * .4;
      if (hostile && dist < 170) { vx = (player.x - entity.x) / Math.max(1, dist); vy = (player.y - entity.y) / Math.max(1, dist); }
      else if (entity.type === 'deer' && dist < 65) { vx = (entity.x - player.x) / Math.max(1, dist); vy = (entity.y - player.y) / Math.max(1, dist); }
      else if (Math.hypot(entity.x - entity.homeX, entity.y - entity.homeY) > 90) { vx = (entity.homeX - entity.x) / 90; vy = (entity.homeY - entity.y) / 90; }
      const speed = entity.type === 'deer' ? 38 : entity.type === 'bat' ? 42 : 29;
      if (!blocked(entity.x + vx * dt * speed, entity.y, 'animal')) entity.x += vx * dt * speed;
      if (!blocked(entity.x, entity.y + vy * dt * speed, 'animal')) entity.y += vy * dt * speed;
      if (hostile && dist < 17) hurt(entity.type === 'boar' ? 12 : 8);
    }
    player.x = Math.max(8, Math.min(WIDTH * TILE - 8, player.x)); player.y = Math.max(8, Math.min(HEIGHT * TILE - 8, player.y));
    worldTravelCD = Math.max(0, worldTravelCD - dt);
    if (!player.moon && !interior() && player.vehicle === 'plane' && worldTravelCD <= 0) {
      let crossed = false;
      if (player.x <= 9) { player.x = WIDTH * TILE - 26; crossed = true; }
      else if (player.x >= WIDTH * TILE - 9) { player.x = 26; crossed = true; }
      else if (player.y <= 9) { player.y = HEIGHT * TILE - 26; crossed = true; }
      else if (player.y >= HEIGHT * TILE - 9) { player.y = 26; crossed = true; }
      if (crossed) { state.player.world = state.player.world === 1 ? 0 : 1; setWorldActive(); camera.x = player.x; camera.y = player.y; worldTravelCD = 2.5; notify(state.player.world === 1 ? 'The Far Reaches' : 'Home archipelago', 'You fly across the open sky to another land.'); tone(700, .3); save(true); }
    }
    camera.x += (player.x - camera.x) * Math.min(1, dt * 8); camera.y += (player.y - camera.y) * Math.min(1, dt * 8);
    for (const particle of particles) { particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.vy += 120 * dt; particle.life -= dt; }
    particles = particles.filter(p => p.life > 0);
    if (bombs.length) { for (const b of bombs) b.fuse -= dt; for (const b of bombs) if (b.fuse <= 0) explode(b.x, b.y, b.power); bombs = bombs.filter(b => b.fuse > 0); }
    for (const floater of floaters) { floater.y -= dt * 18; floater.life -= dt; } floaters = floaters.filter(f => f.life > 0);
    if (!player.moon && !interior() && (state.player.world || 0) === 0) {
      const index = islands.findIndex(island => Math.hypot((player.x / TILE - island.x) / island.rx, (player.y / TILE - island.y) / island.ry) < 1);
      if (index >= 0 && !state.discovered.includes(index)) { state.discovered.push(index); discover(islands[index].name); updateProgress(); save(true); }
    }
    hudTime += dt;
    if (hudTime > .16) { hudTime = 0; activeTarget = nearest(); updateHUD(); }
    if (Date.now() - lastSave > 30000) { save(true); lastSave = Date.now(); }
  }
  function discover(name) { $('discovery').querySelector('h2').textContent = name; $('discovery').classList.add('show'); clearTimeout(discoveryTimer); discoveryTimer = setTimeout(() => $('discovery').classList.remove('show'), 4000); }
  function rect(x, y, width, height, color) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), width, height); }
  const SHADOW_SIZE = { tree: [30, 50], rock: [22, 15], cabin: [40, 32], tower: [24, 46], shelter: [42, 26], house: [46, 42], lighthouse: [40, 100], ruin: [60, 30], shrine: [40, 26], player: [15, 24], deer: [20, 16], boar: [22, 16], cave: [44, 28], exit: [44, 28], well: [22, 18], lanternpost: [10, 28], stonewall: [22, 14], bomb: [12, 10], tnt: [16, 13], portal: [20, 30] };
  let sunDir = -1, sunLow = 1, sunAlpha = .2;
  function castShadow(x, y, w, height) {
    ctx.save(); ctx.globalAlpha = sunAlpha; ctx.fillStyle = interior() ? '#0a1210' : '#123026';
    const ox = interior() ? 0 : sunDir * height * (.18 + sunLow * .82), oy = height * .22;
    ctx.beginPath(); ctx.ellipse(Math.round(x + ox * .5), Math.round(y + 2 + oy * .4), w * .5 + Math.abs(ox) * .32, w * .26 + 2, 0, 0, 6.2832); ctx.fill(); ctx.restore();
  }
  function sprite(pattern, x, y, palette, scale = 1) {
    pattern.forEach((row, rowIndex) => [...row].forEach((pixel, colIndex) => { if (palette[pixel]) rect(x + colIndex * scale, y + rowIndex * scale, scale, scale, palette[pixel]); }));
  }
  function tree(x, y, seed) {
    const sway = Math.sin(frameTime * 1.6 + seed * 6) > .6 ? 1 : 0;
    rect(x - 14, y, 29, 5, '#21513c55'); rect(x - 11, y + 1, 23, 3, '#1d4a3740');
    rect(x - 4, y - 15, 8, 18, '#6b4c35'); rect(x - 1, y - 15, 3, 17, '#8f6b47'); rect(x - 4, y - 15, 2, 18, '#573d2c'); rect(x - 3, y - 7, 5, 2, '#4f3828');
    rect(x - 20 + sway, y - 34, 40, 18, '#1f4e39'); rect(x - 22 + sway, y - 29, 44, 11, '#275e40'); rect(x - 16 + sway, y - 45, 32, 25, '#256640'); rect(x - 11 + sway, y - 50, 22, 12, '#256640');
    rect(x - 14 + sway, y - 43, 28, 17, '#3c8a51'); rect(x - 8 + sway, y - 49, 18, 9, '#459455'); rect(x - 18 + sway, y - 34, 13, 10, '#44905a'); rect(x + 5 + sway, y - 29, 13, 9, '#3a8450');
    rect(x - 10 + sway, y - 47, 11, 3, '#6fbb6d'); rect(x - 16 + sway, y - 36, 6, 3, '#64b266'); rect(x + 4 + sway, y - 40, 6, 3, '#58aa5e'); rect(x - 4 + sway, y - 44, 4, 2, '#7cc47a');
    rect(x - 11 + sway, y - 20, 17, 3, '#1b4c36'); rect(x + 2 + sway, y - 24, 8, 3, '#215539');
    if (seed > .6) { rect(x + 8, y - 33, 2, 2, '#e8d27c'); rect(x - 11, y - 30, 2, 2, '#e37d8c'); rect(x + 1, y - 46, 2, 2, '#f2dd8f'); }
  }
  function drawEntity(entity) {
    const x = entity.x, y = entity.y, seed = entity.seed || 0;
    if (entity.depleted) { if (entity.type === 'tree') { rect(x - 4, y - 4, 8, 5, '#836442'); rect(x - 3, y - 4, 6, 2, '#c2a16a'); } return; }
    const type = entity.type;
    if (type === 'drop') {
      const py = y + Math.round(Math.sin(frameTime * 4 + seed * 9) * 2), color = items[entity.item]?.color || '#d5ddd2';
      rect(x - 10, py + 2, 20, 4, '#244c3b55');
      if (entity.item === 'wood') { rect(x - 8, py - 4, 11, 5, '#735c40'); rect(x - 7, py - 4, 9, 2, color); rect(x + 1, py - 1, 8, 4, '#8a6038'); }
      else if (entity.item === 'stone') { rect(x - 6, py - 7, 11, 10, '#798f89'); rect(x - 4, py - 8, 7, 3, '#d6d8c0'); rect(x + 2, py - 2, 6, 5, color); }
      else if (entity.item === 'berries') { rect(x - 5, py - 7, 5, 5, '#e88d97'); rect(x + 1, py - 5, 5, 5, color); rect(x - 1, py - 9, 4, 3, '#8dbf72'); }
      else if (entity.item === 'fiber') { rect(x - 5, py - 10, 2, 12, '#80a264'); rect(x, py - 8, 2, 10, color); rect(x + 4, py - 11, 2, 13, '#beca85'); }
      else if (entity.item === 'crystal') sprite(sprites.crystal, x - 5, py - 12, { a: '#c4f7e6', b: '#73c8cb', c: '#49909f' }, 1.2);
      ctx.save(); ctx.font = '8px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff0be'; if (entity.amount > 1) ctx.fillText(String(entity.amount), x + 10, py - 7); ctx.restore();
      if (Math.sin(frameTime * 5 + seed) > .75) rect(x - 1, py - 13, 2, 2, '#fff6d2');
    }
    else if (type === 'tree') tree(x, y, seed);
    else if (type === 'rock') { rect(x - 12, y - 1, 25, 5, '#2f685055'); rect(x - 10, y - 10, 20, 12, '#5f766f'); rect(x - 7, y - 15, 14, 15, '#8ea196'); rect(x - 8, y - 11, 16, 4, '#788d84'); rect(x - 5, y - 15, 8, 3, '#c7cdb6'); rect(x + 4, y - 13, 5, 3, '#aab6a6'); rect(x + 5, y - 9, 5, 9, '#6f857a'); rect(x - 9, y - 7, 3, 2, '#c2cbb4'); rect(x - 2, y - 4, 7, 2, '#4f6358'); if (seed > .5) { rect(x - 6, y - 1, 4, 2, '#5c8f52'); rect(x + 3, y - 2, 3, 2, '#6aa05c'); } }
    else if (type === 'bush' || type === 'fiber') { rect(x - 9, y - 1, 18, 4, '#2d5d3955'); rect(x - 8, y - 9, 16, 9, '#2f6038'); rect(x - 6, y - 13, 12, 11, '#5a9450'); rect(x - 9, y - 5, 19, 4, '#3f7742'); rect(x - 4, y - 12, 7, 4, '#6faa5c'); if (type === 'bush') { rect(x - 4, y - 10, 3, 3, '#df8f8f'); rect(x + 4, y - 6, 3, 3, '#ec9f7e'); rect(x - 7, y - 4, 3, 3, '#cf737c'); rect(x + 1, y - 11, 2, 2, '#f0b0b0'); } else { rect(x - 1, y - 16, 2, 14, '#b9c982'); rect(x - 5, y - 11, 2, 9, '#a9c57e'); rect(x + 4, y - 13, 2, 11, '#c2d089'); rect(x - 2, y - 17, 3, 2, '#d7df95'); } }
    else if (type === 'crystal') { const glow = (Math.sin(frameTime * 2 + seed * 10) + 1) / 2; ctx.globalAlpha = .18 + glow * .22; rect(x - 11, y - 18, 22, 22, '#9df0e4'); ctx.globalAlpha = 1; sprite(sprites.crystal, x - 9, y - 16, { a: '#c4f7e6', b: '#73c8cb', c: '#49909f' }, 2); rect(x - 2, y - 13, 2, 2, '#ffffff'); }
    else if (type === 'deer' || type === 'boar') { rect(x - 10, y - 1, 22, 4, '#234f3e40'); sprite(sprites[type], x - 12, y - 16 + Math.round(Math.sin(entity.timer * 8)), { b: type === 'deer' ? '#b19b64' : '#6e6e54', s: '#e0c895', d: '#4e523d' }, 1.6); }
    else if (type === 'shade' || type === 'bat') { const bob = Math.sin(frameTime * 3 + entity.timer) * 2; sprite(sprites[type], x - 10, y - 18 + bob, { p: type === 'bat' ? '#67757c' : '#516b66', w: '#f3d593' }, 1.8); }
    else if (type === 'cave' || type === 'exit') { rect(x - 22, y - 14, 44, 20, '#677f76'); rect(x - 17, y - 27, 34, 31, '#81948a'); rect(x - 10, y - 21, 20, 26, '#162f34'); rect(x - 5, y - 23, 10, 3, '#203f3d'); rect(x - 23, y - 1, 46, 5, '#a2ad91'); rect(x - 19, y - 24, 8, 4, '#a0ad94'); if (type === 'exit') rect(x - 6, y - 16, 12, 15, '#c2d4a8'); }
    else if (type === 'ruin') { rect(x - 31, y - 15, 64, 26, '#8a9e8055'); for (let index = 0; index < 4; index++) { rect(x - 28 + index * 16, y - 19, 12, 23, '#9ca88a'); rect(x - 28 + index * 16, y - 21, 13, 4, '#c8c7a2'); rect(x - 26 + index * 16, y - 14, 3, 16, '#b7b999'); } rect(x - 26, y - 37, 12, 18, '#a9b396'); rect(x + 17, y - 30, 11, 10, '#a9b396'); rect(x - 27, y - 8, 8, 4, '#527c4b'); rect(x + 17, y - 4, 12, 4, '#527c4b'); if (!state.relics.includes('ruins')) sprite(sprites.relic, x - 8, y - 23 + Math.sin(frameTime * 2) * 2, { g: '#e6d087', h: '#fff2b4', s: '#748268' }, 1.7); }
    else if (type === 'shrine' || type === 'altar') { rect(x - 22, y - 5, 44, 12, '#809385'); rect(x - 16, y - 12, 32, 7, '#b7bca0'); rect(x - 10, y - 23, 20, 12, '#8b9d87'); rect(x - 12, y - 26, 24, 5, '#c7c7a6'); if (!state.relics.includes(type === 'shrine' ? 'shrine' : 'moon') && (type === 'shrine' || caveOrigin?.island === 1)) sprite(sprites.relic, x - 8, y - 42 + Math.sin(frameTime * 2) * 2, { g: '#e6d087', h: '#fff2b4', s: '#748268' }, 1.7); }
    else if (type === 'lighthouse') { rect(x - 22, y - 3, 44, 12, '#899383'); rect(x - 15, y - 59, 30, 60, '#d7ceb0'); rect(x - 15, y - 59, 7, 60, '#b0b29a'); rect(x + 10, y - 59, 5, 60, '#a2aa96'); rect(x - 17, y - 38, 34, 8, '#6b8374'); rect(x - 6, y - 11, 12, 15, '#395953'); rect(x - 19, y - 68, 38, 9, '#758d80'); rect(x - 14, y - 86, 28, 18, '#446c63'); rect(x - 10, y - 82, 20, 10, state.won ? '#ffe6a3' : '#8ac3b0'); rect(x - 19, y - 91, 38, 5, '#5c7770'); rect(x - 12, y - 97, 24, 6, '#718679'); rect(x - 3, y - 103, 6, 6, '#e0c785'); }
    else if (type === 'dock' || type === 'wreck') { for (let index = 0; index < 5; index++) { rect(x - 14, y - 22 + index * 7, 30 + (type === 'wreck' ? (index % 2) * 8 : 0), 5, '#aa8559'); rect(x - 12, y - 21 + index * 7, 27, 1, '#d1ab77'); } rect(x - 12, y - 23, 3, 40, '#6a6649'); rect(x + 12, y - 23, 3, 40, '#6a6649'); if (type === 'wreck') { rect(x - 2, y - 43, 3, 40, '#b5a175'); rect(x + 1, y - 41, 16, 14, '#cfd1ae'); } }
    else if (type === 'sign') { rect(x - 2, y - 17, 3, 18, '#7b6b49'); rect(x - 10, y - 24, 20, 11, '#baa477'); rect(x - 6, y - 20, 11, 2, '#685f47'); }
    else if (type === 'bomb') { rect(x - 6, y - 1, 12, 3, '#2c201a40'); rect(x - 6, y - 11, 12, 11, '#3a4042'); rect(x - 6, y - 11, 12, 3, '#55605f'); rect(x - 4, y - 9, 3, 3, '#6b7572'); rect(x - 2, y - 14, 2, 4, '#8a6a46'); if (Math.sin(frameTime * 20) > 0) { rect(x - 2, y - 16, 3, 3, '#ffd36a'); rect(x - 1, y - 18, 2, 2, '#fff0a6'); } }
    else if (type === 'airstrip') {
      for (let index = -3; index <= 3; index++) {
        const segmentX = x + index * 16;
        const missing = !state.runwayRepaired && Math.abs(index) === 2;
        if (missing) {
          rect(segmentX - 8, y - 10, 16, 20, '#526858'); rect(segmentX - 6, y - 7, 5, 4, '#8a8f96'); rect(segmentX + 2, y + 3, 5, 4, '#777d83');
        } else {
          rect(segmentX - 8, y - 10, 16, 20, index % 2 ? '#777d83' : '#858b91'); rect(segmentX - 8, y - 10, 16, 2, '#a3a8ac'); rect(segmentX - 8, y + 8, 16, 2, '#62686e');
        }
        if (state.runwayRepaired || !missing) rect(segmentX - 1, y - 5, 2, 10, '#e8e4cf');
      }
      if (!state.runwayRepaired) { rect(x - 25, y - 13, 7, 3, '#6d7f58'); rect(x + 19, y + 10, 8, 3, '#6d7f58'); }
    }
    else if (type === 'rocket' || type === 'moonrocket') { rect(x - 15, y + 2, 30, 5, '#263a3745'); rect(x - 8, y - 31, 16, 34, '#d9ded5'); rect(x - 8, y - 31, 16, 4, '#f2f1e7'); rect(x - 5, y - 21, 10, 8, '#b8d7dc'); rect(x - 6, y - 1, 12, 4, '#aeb6ae'); rect(x - 13, y - 3, 7, 8, '#d65345'); rect(x + 6, y - 3, 7, 8, '#d65345'); rect(x - 4, y + 3, 3, 7, '#f4cf78'); rect(x + 1, y + 3, 3, 7, '#f4cf78'); }
    else if (type === 'runway') { rect(x - 8, y - 8, 16, 16, '#8a8f96'); rect(x - 8, y - 8, 16, 2, '#9ba0a6'); rect(x - 8, y + 6, 16, 2, '#6f757b'); rect(x - 1, y - 6, 2, 5, '#e8e4cf'); rect(x - 1, y + 2, 2, 4, '#e8e4cf'); }
    else if (type === 'tnt') { rect(x - 8, y - 1, 16, 3, '#2c201a40'); rect(x - 8, y - 14, 16, 14, '#c0392b'); rect(x - 8, y - 9, 16, 3, '#efe6d0'); rect(x - 8, y - 14, 16, 2, '#d9533f'); rect(x - 6, y - 7, 2, 4, '#7a241b'); rect(x + 4, y - 7, 2, 4, '#7a241b'); rect(x - 1, y - 17, 2, 4, '#8a6a46'); if (Math.sin(frameTime * 22) > 0) { rect(x - 1, y - 19, 3, 3, '#ffd36a'); rect(x, y - 21, 2, 2, '#fff0a6'); } }
    else if (type === 'campfire') { rect(x - 9, y - 4, 18, 6, '#878979'); rect(x - 6, y - 2, 13, 3, '#bb9770'); rect(x - 5, y - 8, 9, 7, '#e98851'); rect(x - 2, y - 13 - Math.round(Math.sin(frameTime * 9) * 2), 5, 11, '#efc36b'); rect(x, y - 8, 2, 5, '#fff0a6'); if (Math.sin(frameTime * 2) > .2) rect(x + 2, y - 19, 2, 2, '#e5c77b'); }
    else if (type === 'wall' || type === 'bridge') { rect(x - 13, y - 9, 26, 13, '#947b54'); for (let index = 0; index < 4; index++) rect(x - 12 + index * 7, y - 9, 4, 13, '#c29f6a'); if (type === 'wall') { rect(x - 12, y - 17, 4, 20, '#c6a97b'); rect(x + 9, y - 17, 4, 20, '#c6a97b'); } }
    else if (type === 'shelter') { rect(x - 23, y - 3, 46, 8, '#506d4855'); rect(x - 20, y - 25, 40, 27, '#9c8456'); rect(x - 10, y - 19, 20, 22, '#293f33'); for (let index = 0; index < 7; index++) rect(x - 24 + index * 3, y - 12 - index * 4, 48 - index * 6, 5, index % 2 ? '#bcc08b' : '#9da871'); rect(x - 22, y - 10, 3, 15, '#765f42'); rect(x + 19, y - 10, 3, 15, '#765f42'); }
    else if (type === 'house') { rect(x + 15, y - 27, 11, 29, '#75603f'); rect(x + 15, y - 27, 11, 29, '#0000001f'); rect(x - 22, y - 28, 38, 30, '#9f8459'); rect(x - 22, y - 28, 38, 4, '#b89a66'); for (let index = 0; index < 5; index++) rect(x - 22, y - 23 + index * 6, 38, 1, '#00000022'); rect(x - 7, y - 17, 14, 19, '#3b2c1d'); rect(x - 7, y - 17, 14, 2, '#5c4631'); rect(x + 3, y - 8, 2, 3, '#e0c57c'); rect(x - 18, y - 21, 10, 10, '#4a3a28'); rect(x - 17, y - 20, 8, 8, '#bfe2da'); rect(x - 13, y - 20, 1, 8, '#6f8f88'); rect(x - 17, y - 16, 8, 1, '#6f8f88'); for (let index = 0; index < 8; index++) rect(x - 28 + index * 3, y - 28 - index * 4, 56 - index * 6, 5, index % 2 ? '#8a4f3c' : '#9c5b45'); rect(x + 14, y - 32, 13, 6, '#6f4030'); rect(x - 25, y - 32, 50, 2, '#b06a4e'); rect(x + 8, y - 46, 6, 12, '#6f5c45'); rect(x + 8, y - 48, 6, 3, '#554735'); if (Math.sin(frameTime * 2) > 0) { const puff = Math.round(Math.sin(frameTime * 3) * 2); rect(x + 9, y - 53 + puff, 3, 3, '#c9cdbf'); rect(x + 10, y - 58 + puff, 2, 2, '#d7dace'); } }
    else if (type === 'camp') { const looted = state.looted.includes(entity.id); rect(x - 13, y - 1, 27, 5, '#2c634855'); rect(x - 13, y - 14, 15, 16, looted ? '#8a7c5e' : '#9c7f58'); rect(x - 13, y - 14, 15, 16, '#0000001a'); rect(x - 6, y - 14, 2, 16, '#c7ad7f'); rect(x - 13, y - 2, 15, 3, '#5f5038'); rect(x + 3, y - 8, 11, 9, looted ? '#7d7254' : '#b79a6a'); rect(x + 3, y - 8, 4, 9, '#00000022'); rect(x + 4, y - 3, 9, 2, '#5f5038'); rect(x - 2, y + 1, 10, 4, '#6b6050'); if (!looted) { rect(x - 1, y - 4 - Math.round(Math.sin(frameTime * 7) * 2), 4, 7, '#e9924f'); rect(x, y - 2, 2, 4, '#ffe39a'); } else { rect(x - 1, y + 1, 4, 2, '#4a4436'); } rect(x - 9, y + 3, 2, 2, '#6a7a52'); }
    else if (type === 'cabin') { rect(x - 20, y - 1, 41, 6, '#2c634855'); rect(x - 18, y - 20, 36, 22, '#8a7250'); rect(x - 18, y - 20, 36, 22, '#00000018'); for (let index = 0; index < 5; index++) rect(x - 18, y - 18 + index * 5, 36, 1, '#00000026'); rect(x - 18, y - 20, 36, 3, seed > .5 ? '#6f5c40' : '#7a6646'); rect(x + 4, y - 32, 30, 14, '#7c6848'); rect(x + 4, y - 32, 30, 14, '#0000002e'); rect(x + 2, y - 20, 10, 4, '#52432f'); rect(x - 14, y - 15, 9, 9, '#2c3a30'); rect(x - 13, y - 14, 7, 7, '#1d2a24'); rect(x + 6, y - 14, 6, 6, '#3c4a3b'); rect(x - 20, y - 20, 3, 22, '#5e4d36'); rect(x + 17, y - 20, 4, 15, '#5e4d36'); rect(x + 10, y - 4, 2, 6, '#4a3c2a'); rect(x - 6, y + 2, 12, 3, '#5f8c4e'); rect(x + 13, y - 8, 3, 3, '#6aa05c'); }
    else if (type === 'tower') { rect(x - 15, y - 1, 31, 6, '#2c634855'); rect(x - 11, y - 34, 22, 36, '#8b9080'); rect(x - 11, y - 34, 7, 36, '#747a68'); rect(x + 6, y - 34, 5, 36, '#6a7060'); for (let index = 0; index < 6; index++) rect(x - 11, y - 30 + index * 6, 22, 1, '#00000026'); rect(x - 13, y - 40, 7, 8, '#949a86'); rect(x + 1, y - 44, 9, 10, '#949a86'); rect(x - 6, y - 38, 3, 6, '#5a6150'); rect(x - 4, y - 18, 8, 10, '#2b3730'); rect(x - 3, y - 17, 6, 8, '#1d2a24'); rect(x - 14, y - 2, 10, 4, '#6d7362'); rect(x + 8, y + 1, 8, 3, '#6d7362'); rect(x - 2, y + 1, 7, 3, '#5f8c4e'); if (seed > .5) rect(x - 9, y - 3, 3, 3, '#6aa05c'); }
    else if (type === 'cache') { const looted = state.looted.includes(entity.id); rect(x - 11, y - 1, 23, 4, '#2c634855'); rect(x - 10, y - 11, 13, 13, looted ? '#7d7254' : '#9a7c52'); rect(x - 10, y - 11, 13, 13, '#0000001f'); rect(x - 10, y - 11, 13, 2, '#b89968'); rect(x - 10, y - 5, 13, 2, '#5f5038'); rect(x - 4, y - 11, 2, 13, '#5f5038'); rect(x + 2, y - 8, 10, 10, looted ? '#6e6549' : '#8a7049'); rect(x + 2, y - 8, 10, 2, '#a98c5c'); rect(x + 2, y - 3, 10, 2, '#54472f'); if (!looted) { rect(x - 3, y - 13, 6, 2, '#c9b074'); rect(x + 5, y - 10, 3, 3, '#d7c488'); } rect(x - 7, y + 1, 3, 2, '#6a7a52'); }
    else if (type === 'door') { rect(x - 11, y - 28, 22, 29, '#5e4631'); rect(x - 9, y - 26, 18, 26, '#8a6a46'); rect(x - 9, y - 26, 18, 2, '#a07c50'); rect(x - 1, y - 26, 2, 26, '#6e5236'); for (let index = 0; index < 3; index++) { rect(x - 8, y - 22 + index * 8, 7, 6, '#7a5c3c'); rect(x + 2, y - 22 + index * 8, 7, 6, '#7a5c3c'); } rect(x + 4, y - 13, 2, 2, '#e8cf86'); rect(x - 12, y - 29, 24, 3, '#4a3827'); }
    else if (type === 'rug') { rect(x - 15, y - 5, 30, 11, entity.cave ? '#cf8f6a' : items.rug.color); rect(x - 15, y - 5, 30, 11, '#00000012'); rect(x - 12, y - 3, 24, 7, '#e2ab82'); rect(x - 8, y - 2, 16, 5, '#b5704f'); rect(x - 3, y - 1, 6, 3, '#e2ab82'); }
    else if (type === 'bed') { rect(x - 14, y - 1, 28, 4, '#2c201a40'); rect(x - 14, y - 13, 28, 14, '#8a6a4a'); rect(x - 14, y - 13, 28, 2, '#a07c54'); rect(x - 13, y - 17, 12, 8, '#eceef0'); rect(x - 13, y - 17, 12, 2, '#cfd4da'); rect(x, y - 15, 13, 12, '#c08a86'); rect(x, y - 15, 13, 3, '#d7a29c'); rect(x, y - 9, 13, 2, '#a86f6b'); rect(x - 14, y - 4, 3, 5, '#5e4631'); rect(x + 11, y - 4, 3, 5, '#5e4631'); }
    else if (type === 'table') { rect(x - 12, y - 1, 24, 3, '#2c201a40'); rect(x - 13, y - 14, 26, 6, '#b58a5a'); rect(x - 13, y - 14, 26, 2, '#cda271'); rect(x - 13, y - 9, 26, 1, '#8a6038'); rect(x - 11, y - 8, 3, 9, '#6e5236'); rect(x + 8, y - 8, 3, 9, '#6e5236'); }
    else if (type === 'chair') { rect(x - 7, y - 1, 14, 3, '#2c201a40'); rect(x - 7, y - 18, 3, 18, '#8a6a46'); rect(x - 7, y - 18, 11, 3, '#a07c50'); rect(x - 7, y - 9, 12, 4, '#9a7349'); rect(x - 6, y - 5, 3, 6, '#6e5236'); rect(x + 3, y - 5, 3, 6, '#6e5236'); }
    else if (type === 'lamp') { rect(x - 3, y - 1, 6, 2, '#4a3a28'); rect(x - 1, y - 18, 2, 17, '#7a6245'); const glow = (Math.sin(frameTime * 3 + (entity.x + entity.y)) + 1) / 2; ctx.save(); ctx.globalAlpha = .25 + glow * .3; rect(x - 9, y - 26, 18, 14, '#ffe9a8'); ctx.globalAlpha = 1; ctx.restore(); rect(x - 6, y - 24, 12, 9, '#f4e2a0'); rect(x - 6, y - 24, 12, 2, '#fff3c6'); rect(x - 3, y - 20, 6, 4, '#fff6cf'); }
    else if (type === 'plant') { rect(x - 6, y - 1, 12, 2, '#2c201a40'); rect(x - 6, y - 9, 12, 9, '#b06a3e'); rect(x - 6, y - 9, 12, 2, '#c98a5a'); rect(x - 5, y - 4, 10, 2, '#8a4f2e'); rect(x - 2, y - 20, 3, 12, '#4f7d44'); rect(x - 9, y - 16, 7, 5, '#6fae5c'); rect(x + 2, y - 18, 7, 5, '#6fae5c'); rect(x - 5, y - 22, 6, 5, '#7cc06a'); rect(x + 1, y - 21, 5, 4, '#84c86f'); }
    else if (type === 'bookshelf') { rect(x - 12, y - 1, 24, 4, '#2c201a40'); rect(x - 12, y - 32, 24, 33, '#9c7a4e'); rect(x - 12, y - 32, 24, 33, '#00000018'); rect(x - 12, y - 32, 24, 3, '#b08a58'); for (let s = 0; s < 3; s++) { const yy = y - 27 + s * 9; rect(x - 10, yy, 20, 7, '#5e4631'); const books = ['#c86f6f', '#6f93c8', '#6fae5c', '#d6b45c', '#b07ec8']; for (let b = 0; b < 5; b++) rect(x - 9 + b * 4, yy, 3, 7, books[(s + b) % 5]); rect(x - 11, yy + 7, 22, 2, '#6e5236'); } }
    else if (type === 'painting') { rect(x - 10, y - 18, 20, 15, '#6e5236'); rect(x - 10, y - 18, 20, 15, '#00000010'); rect(x - 8, y - 16, 16, 11, '#cdb57e'); rect(x - 8, y - 16, 16, 5, '#8fb6c6'); rect(x - 8, y - 11, 16, 6, '#6fae5c'); rect(x - 3, y - 14, 4, 3, '#f2dd8f'); rect(x + 3, y - 9, 3, 2, '#5c8f52'); rect(x - 6, y - 9, 3, 2, '#5c8f52'); }
    else if (type === 'lanternpost') { rect(x - 4, y - 1, 8, 4, '#2c634855'); rect(x - 2, y - 24, 4, 25, '#6e5236'); rect(x - 2, y - 24, 2, 25, '#8a6a46'); const glow = (Math.sin(frameTime * 3 + (entity.x + entity.y)) + 1) / 2; ctx.save(); ctx.globalAlpha = .25 + glow * .35; rect(x - 10, y - 34, 20, 16, '#ffe9a8'); ctx.globalAlpha = 1; ctx.restore(); rect(x - 6, y - 32, 12, 11, '#6e5236'); rect(x - 5, y - 31, 10, 9, '#f6e39e'); rect(x - 3, y - 28, 6, 4, '#fff6cf'); rect(x - 7, y - 34, 14, 3, '#5e4631'); }
    else if (type === 'stonewall') { rect(x - 13, y - 1, 26, 4, '#2c634855'); rect(x - 13, y - 15, 26, 16, '#8b9790'); rect(x - 13, y - 15, 26, 3, '#a7b2ab'); rect(x - 13, y - 8, 26, 1, '#6a7870'); rect(x - 4, y - 15, 1, 7, '#6a7870'); rect(x + 5, y - 8, 1, 8, '#6a7870'); rect(x - 10, y - 13, 5, 3, '#9aa7a0'); rect(x + 2, y - 6, 5, 3, '#9aa7a0'); if (seed > .5) rect(x - 7, y - 1, 4, 2, '#5c8f52'); }
    else if (type === 'well') { rect(x - 12, y - 1, 25, 5, '#2c634855'); rect(x - 10, y - 9, 20, 10, '#8b9790'); rect(x - 10, y - 9, 20, 3, '#a7b2ab'); rect(x - 8, y - 7, 16, 6, '#20302f'); rect(x - 6, y - 6, 12, 4, '#38716f'); rect(x - 10, y - 26, 3, 18, '#6e5236'); rect(x + 7, y - 26, 3, 18, '#6e5236'); for (let index = 0; index < 7; index++) rect(x - 14 + index * 4, y - 30 + Math.abs(index - 3), 4, 5, index % 2 ? '#9c5b45' : '#8a4f3c'); rect(x - 15, y - 26, 30, 2, '#6b4030'); }
    else if (type === 'portal') { const p = frameTime * 3; rect(x - 11, y - 1, 23, 4, '#20143040'); for (let i = 0; i < 6; i++) { const r = 13 - i * 2, c = ['#4a2f80', '#6a3fb0', '#8a5fd8', '#b08cf0', '#d8c4ff', '#f3ecff'][i]; rect(x - r, y - 30 + i * 4 + Math.round(Math.sin(p + i) * 1.5), r * 2, 4, c); } rect(x - 3, y - 20 + Math.round(Math.sin(p) * 3), 6, 7, '#ffffff'); rect(x - 13, y - 32, 3, 30, '#3a2860'); rect(x + 10, y - 32, 3, 30, '#3a2860'); }
    else if (type === 'fireplace') { rect(x - 15, y - 20, 30, 3, '#9c8a70'); rect(x - 13, y - 17, 26, 18, '#7a6a58'); rect(x - 13, y - 17, 26, 18, '#00000018'); rect(x - 5, y - 30, 10, 13, '#6b5a48'); rect(x - 9, y - 11, 18, 11, '#241d18'); rect(x - 6, y - 8, 12, 7, '#e9924f'); rect(x - 2, y - 13 - Math.round(Math.sin(frameTime * 9) * 2), 5, 9, '#f4c15f'); rect(x, y - 9, 2, 5, '#fff0a6'); rect(x - 9, y - 2, 18, 2, '#4a3c30'); }
    else if (type === 'clock') { rect(x - 7, y - 1, 14, 3, '#2c201a40'); rect(x - 8, y - 30, 16, 31, '#9c7a4e'); rect(x - 8, y - 30, 16, 3, '#b08a58'); rect(x - 8, y - 30, 3, 31, '#00000018'); rect(x - 6, y - 27, 12, 10, '#ece3cf'); rect(x - 1, y - 24, 1, 5, '#3a2f22'); rect(x - 1, y - 23, 4, 1, '#3a2f22'); rect(x - 2, y - 14, 4, 11, '#5e4631'); rect(x - 1, y - 7, 2, 4, '#d6b45c'); }
    else if (type === 'crop') { const age = (state.day * 1440 + state.time) - (entity.planted || 0); rect(x - 7, y - 2, 15, 5, '#5a3f2a'); rect(x - 7, y - 2, 15, 2, '#6e4e34'); if (age < 300) { rect(x - 1, y - 5, 2, 4, '#6fae5c'); rect(x - 3, y - 4, 2, 2, '#7cc06a'); rect(x + 2, y - 4, 2, 2, '#7cc06a'); } else if (age < 640) { rect(x - 1, y - 11, 2, 9, '#4f8f44'); rect(x - 5, y - 8, 4, 3, '#6fae5c'); rect(x + 2, y - 9, 4, 3, '#6fae5c'); rect(x - 4, y - 11, 3, 2, '#7cc06a'); rect(x + 2, y - 12, 3, 2, '#7cc06a'); } else { rect(x - 1, y - 13, 2, 11, '#4f8f44'); rect(x - 6, y - 10, 5, 3, '#5fa050'); rect(x + 2, y - 11, 5, 3, '#5fa050'); rect(x - 5, y - 8, 3, 3, '#e4823f'); rect(x + 3, y - 9, 3, 3, '#e4823f'); rect(x - 1, y - 15, 3, 3, '#f0a84f'); } }
  }
  function drawTerrain() {
    const left = Math.floor((camera.x - canvas.width / 2) / TILE) - 1, top = Math.floor((camera.y - canvas.height / 2) / TILE) - 1;
    for (let ty = top; ty < top + Math.ceil(canvas.height / TILE) + 3; ty++) for (let tx = left; tx < left + Math.ceil(canvas.width / TILE) + 3; tx++) {
      const x = tx * TILE, y = ty * TILE, tile = tileAt(x, y), noise = rand(tx, ty);
      if (tile <= 1) {
        const deep = tile === 0;
        rect(x, y, TILE, TILE, deep ? (noise > .5 ? '#2d7a82' : '#2a757d') : (noise > .5 ? '#56aca7' : '#5bb0ac'));
        const band = Math.sin(frameTime * 1.1 + ty * .85 + tx * .35);
        if (band > .55) rect(x, y + 5, TILE, 2, deep ? '#327e86' : '#64b8b2');
        if (band < -.55) rect(x, y + 11, TILE, 1, deep ? '#2a747c' : '#52a7a2');
        if (Math.sin(frameTime * 1.5 + tx * .7 + ty * .9) > .9) rect(x + 5, y + 8, 4, 1, deep ? '#5aa39f' : '#bfe4da');
        if (!inCave()) {
          const surge = Math.sin(frameTime * 2.1 + tx + ty) > -.2, fw = surge ? 3 : 2, fc = '#eef2d4';
          if (terrainAt(tx, ty - 1) >= 2) rect(x, y, TILE, fw, fc);
          if (terrainAt(tx, ty + 1) >= 2) rect(x, y + TILE - fw, TILE, fw, fc);
          if (terrainAt(tx - 1, ty) >= 2) rect(x, y, fw, TILE, fc);
          if (terrainAt(tx + 1, ty) >= 2) rect(x + TILE - fw, y, fw, TILE, fc);
        }
        continue;
      }
      const color = state.player.moon ? (noise > .55 ? '#a5a198' : noise > .2 ? '#918e88' : '#aaa69c') : tile === 2 ? (noise > .5 ? '#e3d6a3' : '#ddcf97') : tile === 3 ? (noise > .55 ? '#78a763' : noise > .2 ? '#71a15c' : '#7fab67') : tile === 4 ? '#b0966a' : tile === 5 ? '#223a3e' : tile === 7 ? (noise > .5 ? '#a5794a' : '#9c7244') : tile === 8 ? '#584434' : (noise > .5 ? '#48605e' : '#4c6462');
      rect(x, y, TILE, TILE, color);
      if (tile === 3) {
        if (terrainAt(tx, ty + 1) <= 2) rect(x, y + 14, TILE, 2, '#5f8c4e');
        if (terrainAt(tx - 1, ty) <= 2) rect(x, y, 2, TILE, '#6b9752');
        if (noise > .45) { rect(x + 4, y + 6, 1, 3, '#5a8a50'); rect(x + 5, y + 7, 1, 2, '#8fb074'); rect(x + 11, y + 9, 1, 3, '#5a8a50'); }
        if (noise > .82) { const f = rand(tx, ty, 5); const fc = f > .66 ? '#f3e79a' : f > .33 ? '#eaeef0' : '#e79bbf'; rect(x + 9, y + 4, 2, 2, fc); rect(x + 10, y + 5, 1, 1, '#c8d48a'); }
        if (noise > .6 && noise < .66) rect(x + 6, y + 10, 3, 2, '#dad08f');
        if (!inCave() && ((Math.abs(tx - (48 + Math.sin(ty * .07) * 5)) < 1.4 && ty > 46 && ty < 86) || (ty === 70 && tx > 50 && tx < 83))) { rect(x, y, 16, 16, '#b4a877'); rect(x, y, 16, 16, '#b4a87733'); if (noise > .4) { rect(x + 6, y + 3, 3, 2, '#98895f'); rect(x + 10, y + 9, 2, 2, '#a89970'); } }
      }
      else if (tile === 2) { if (noise > .55) { rect(x + 4, y + 6, 3, 1, '#c9bb84'); rect(x + 9, y + 11, 3, 1, '#c9bb84'); } if (noise > .88) { rect(x + 10, y + 9, 2, 2, '#efe8c3'); rect(x + 3, y + 12, 1, 1, '#b7a977'); } if (terrainAt(tx, ty - 1) === 3) rect(x, y, TILE, 2, '#cabf8a'); }
      else if (tile === 4) { rect(x + 1, y + 1, 14, 4, '#c3a97b'); rect(x + 1, y + 8, 14, 4, '#c3a97b'); rect(x + 3, y + 2, 2, 2, '#9c8158'); rect(x + 10, y + 9, 2, 2, '#9c8158'); }
      else if (tile === 5) { rect(x + 1, y + 1, 14, 5, '#304646'); rect(x + 3, y + 8, 12, 5, '#2a4042'); rect(x + 2, y + 2, 4, 2, '#3c5555'); }
      else if (tile === 6) { if (state.player.moon) { if (noise > .86) { rect(x + 3, y + 7, 9, 3, '#77756f'); rect(x + 4, y + 6, 6, 1, '#b2aea4'); } if (noise < .08) rect(x + 11, y + 4, 2, 2, '#c2bdb2'); } else if (noise > .7) rect(x + 5, y + 7, 3, 2, '#5f716c'); else if (noise > .9) { rect(x + 10, y + 11, 2, 3, '#394f4c'); rect(x + 10, y + 10, 2, 1, '#6f8580'); } }
      else if (tile === 7) { rect(x, y + 14, TILE, 2, '#845c35'); rect(x, y, 2, TILE, '#875f39'); rect(x + 2, y + 2, TILE - 3, 1, '#b5884f'); if (noise > .7) rect(x + 5, y + 7, 5, 1, '#8a6038'); }
      else if (tile === 8) { rect(x, y, TILE, 3, '#6b5440'); rect(x, y, 2, TILE, '#473527'); rect(x + 7, y, 1, TILE, '#4a3828'); rect(x + 2, y + 5, 4, 2, '#6a523c'); rect(x + 9, y + 10, 4, 2, '#6a523c'); }
    }
  }
  const VIEW = { pitch: 0.62, depth: 0.95, scale: 1.08, horizon: 0.62 };
  function project(wx, wy) {
    const W = canvas.width, H = canvas.height, P = H * VIEW.depth;
    const v = wy - camera.y;
    const factor = P / (P - v * VIEW.pitch);
    const scale = factor * VIEW.scale;
    return { sx: W / 2 + (wx - camera.x) * scale, sy: H * VIEW.horizon + v * scale, scale, factor };
  }
  function buildVisible() {
    const vis = [...currentEntities(), ...currentBuildings(), ...bombs].filter(e => Math.abs(e.x - camera.x) < canvas.width / 2 + 90 && e.y - camera.y > -canvas.height && e.y - camera.y < canvas.height / 2 + 150);
    vis.push({ type: 'player', y: state.player.y, x: state.player.x }); vis.sort((a, b) => a.y - b.y); return vis;
  }
  function drawPlayer() {
    const player = state.player, bob = (keys.w || keys.a || keys.s || keys.d) && !panel ? Math.round(Math.sin(frameTime * 12)) : 0;
    if (damageCooldown > .6 && Math.floor(frameTime * 15) % 2 === 0) return;
    if (rocketFlight) { const lift = Math.sin((2.4 - rocketFlight.timer) / 2.4 * Math.PI) * 26; rect(player.x - 12, player.y + 4, 24, 5, '#263a3750'); rect(player.x - 6, player.y - 22 - lift, 12, 27, '#e0564a'); rect(player.x - 5, player.y - 24 - lift, 10, 4, '#e9e5d6'); rect(player.x - 9, player.y - 5 - lift, 18, 5, '#ba3e37'); rect(player.x - 4, player.y - 27 - lift, 8, 4, '#d6e1d6'); rect(player.x - 3, player.y + 5 - lift, 3, 9, '#f4cf78'); rect(player.x + 1, player.y + 5 - lift, 3, 9, '#ff9d59'); return; }
    const veh = interior() ? null : player.vehicle;
    if (veh === 'car') { rect(player.x - 11, player.y - 1, 23, 6, '#254f3d40'); rect(player.x - 11, player.y - 10, 22, 14, '#c0564a'); rect(player.x - 11, player.y - 10, 22, 3, '#d97a6a'); rect(player.x - 8, player.y - 7, 16, 7, '#2b3a44'); rect(player.x - 6, player.y - 6, 5, 4, '#bfe0ea'); rect(player.x + 1, player.y - 6, 5, 4, '#bfe0ea'); rect(player.x - 2, player.y - 13, 4, 4, '#e1b587'); rect(player.x - 13, player.y - 8, 3, 4, '#222'); rect(player.x + 10, player.y - 8, 3, 4, '#222'); rect(player.x - 13, player.y, 3, 4, '#222'); rect(player.x + 10, player.y, 3, 4, '#222'); return; }
    if (veh === 'plane') { const lift = planeAltitude + (planeTakeoff ? 0 : Math.round(Math.sin(frameTime * 3) * 2)); rect(player.x - 10, player.y + 2, 20, 4, '#1e3a3330'); const py = player.y - lift; rect(player.x - 20, py - 3, 40, 6, '#c2c8b4'); rect(player.x - 20, py - 3, 40, 2, '#e4e9d6'); rect(player.x - 4, py - 20, 8, 32, '#d7dcc9'); rect(player.x - 4, py - 20, 8, 3, '#b7bda8'); rect(player.x - 7, py + 9, 14, 4, '#c2c8b4'); rect(player.x - 2, py - 22, 4, 5, '#2b3a44'); rect(player.x - 2, py - 14, 4, 4, '#bfe0ea'); if (planeTakeoff && frameTime * 18 % 2 < 1) { rect(player.x - 13, py + 7, 4, 3, '#b6a48a'); rect(player.x + 10, py + 11, 5, 3, '#b6a48a'); } if (Math.floor(frameTime * 40) % 2) rect(player.x - 3, py - 26, 6, 2, '#ffffff55'); return; }
    const sailing = !interior() && tileAt(player.x, player.y) <= 1;
    if (sailing && count('ship')) { rect(player.x - 18, player.y - 2, 36, 10, '#8a6038'); rect(player.x - 20, player.y - 4, 5, 10, '#7a5230'); rect(player.x + 15, player.y - 4, 5, 10, '#7a5230'); rect(player.x - 16, player.y - 1, 32, 3, '#c49a63'); rect(player.x - 1, player.y - 27, 3, 25, '#6e5236'); rect(player.x + 2, player.y - 25, 13, 16, '#f3ecd6'); rect(player.x + 2, player.y - 25, 13, 2, '#d9d2bc'); }
    else if (sailing) { for (let index = 0; index < 4; index++) { rect(player.x - 14 + index * 8, player.y - 4, 6, 14, '#ac8352'); rect(player.x - 13 + index * 8, player.y - 3, 2, 11, '#d2ad71'); } rect(player.x - 14, player.y, 31, 2, '#81704a'); }
    else rect(player.x - 8, player.y - 2, 16, 4, '#254f3d50');
    sprite(sprites.player, player.x - 10, player.y - 24 + bob, { h: '#5a4939', s: '#e1b587', p: '#304640', b: '#e6d5a6', t: '#4c7770', d: '#3b5147' }, 1.6);
    rect(player.x + 3, player.y - 16 + bob, 4, 10, '#a48157');
    if (count('torch')) { rect(player.x - 12, player.y - 10, 3, 7, '#947149'); rect(player.x - 12, player.y - 14, 3, 4, '#ffe29a'); }
    if (count('spear')) { rect(player.x + 7, player.y - 23, 2, 21, '#8a6a46'); rect(player.x + 6, player.y - 26, 4, 5, '#dfe4d2'); }
    if (swing > 0) {
      const angle = Math.atan2(player.face.y, player.face.x);
      ctx.strokeStyle = '#f3e1ab'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(player.x, player.y - 7, 24, angle - 1.2 + swing * 3, angle + .5 + swing * 3); ctx.stroke();
      if (swingTool === 'axe' || swingTool === 'pickaxe') {
        ctx.save(); ctx.translate(player.x + player.face.x * 8, player.y - 8 + player.face.y * 8); ctx.rotate(angle + swing * 2.4);
        rect(0, -1, 17, 3, '#8a6a46');
        if (swingTool === 'axe') { rect(11, -6, 7, 8, '#bac3ac'); rect(12, -5, 3, 5, '#edf0dc'); }
        else { rect(11, -6, 8, 3, '#bac3ac'); rect(14, -7, 3, 10, '#aeb8a9'); }
        ctx.restore();
      }
    }
  }
  function placePreview() {
    return { px: Math.floor((state.player.x + state.player.face.x * 32) / TILE) * TILE, py: Math.floor((state.player.y + state.player.face.y * 32) / TILE) * TILE };
  }
  function render() {
    ctx = mainCtx; ctx.imageSmoothingEnabled = false;
    const dayFrac = Math.max(0, Math.min(1, (state.time - 300) / 960));
    sunLow = Math.abs(dayFrac - .5) * 2; sunDir = dayFrac < .5 ? -1 : 1; sunAlpha = inCave() ? .3 : .13 + (1 - sunLow) * .13;
    if (view3d) render3D(); else renderFlat();
    $('game').classList.toggle('plane-takeoff', !!planeTakeoff);
    if (planeTakeoff) {
      const progress = Math.min(1, planeTakeoff.elapsed / planeTakeoff.duration), bandY = canvas.height * .76;
      ctx.fillStyle = '#0c2529df'; ctx.fillRect(0, canvas.height * .16, canvas.width, 10); ctx.fillRect(0, bandY, canvas.width, 22);
      ctx.fillStyle = '#f0dfaa'; ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TAKEOFF', canvas.width / 2, bandY + 10);
      ctx.fillStyle = '#a8c987'; ctx.fillRect(canvas.width * .32, bandY + 19, canvas.width * .36 * progress, 2);
    }
  }
  function renderFlat() {
    ctx.fillStyle = inHome() ? '#2a1d14' : inCave() ? '#1a2f32' : '#2a757d'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ctx.translate(Math.round(canvas.width / 2 - camera.x), Math.round(canvas.height / 2 - camera.y)); drawTerrain();
    const visible = buildVisible();
    for (const entity of visible) { if (entity.depleted) continue; const size = SHADOW_SIZE[entity.type]; if (size) castShadow(entity.x, entity.y, size[0], size[1]); }
    for (const entity of visible) { if (entity.type === 'player') drawPlayer(); else drawEntity(entity); }
    if (placing) { const { px, py } = placePreview(); ctx.strokeStyle = '#eee0a1'; ctx.lineWidth = 1; ctx.strokeRect(px, py, TILE, TILE); ctx.globalAlpha = .55; drawEntity({ type: placing, x: px + 8, y: py + 8 }); ctx.globalAlpha = 1; }
    for (const particle of particles) rect(particle.x, particle.y, 2, 2, particle.color);
    ctx.font = '9px monospace'; ctx.textAlign = 'center'; for (const floater of floaters) { ctx.fillStyle = '#fff0be'; ctx.fillText(floater.text, floater.x, floater.y); }
    ctx.restore();
    applyPostFX(false);
  }
  function render3D() {
    const W = canvas.width, H = canvas.height, P = H * VIEW.depth;
    ctx = groundCtx; ctx.imageSmoothingEnabled = false; ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = inHome() ? '#241811' : inCave() ? '#15282b' : '#1f5560'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(Math.round(W / 2 - camera.x), Math.round(H / 2 - camera.y)); drawTerrain();
    const visible = buildVisible();
    for (const entity of visible) { if (entity.depleted || entity.type === 'player') continue; const size = SHADOW_SIZE[entity.type]; if (size) castShadow(entity.x, entity.y, size[0], size[1]); }
    ctx.restore();
    ctx = mainCtx; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
    const t = state.time, night = t < 360 || t > 1140, dusk = (t >= 300 && t < 480) || (t >= 1020 && t < 1200);
    const skyTop = inHome() ? '#1c130d' : inCave() ? '#0c1a1d' : night ? '#182440' : dusk ? '#6a5878' : '#4a8fa0';
    const skyBot = inHome() ? '#33241a' : inCave() ? '#15282b' : night ? '#324c66' : dusk ? '#dc9a68' : '#88c3bb';
    const sky = ctx.createLinearGradient(0, 0, 0, H * VIEW.horizon); sky.addColorStop(0, skyTop); sky.addColorStop(1, skyBot); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    if (!interior()) {
      const frac = Math.max(0, Math.min(1, night ? ((t > 1140 ? t - 1140 : t + 300) / 600) : (t - 360) / 780));
      const cx2 = W * (0.12 + frac * 0.76), cy2 = H * (0.17 - Math.sin(frac * Math.PI) * 0.12);
      const glow = night ? 'rgba(185,205,225,0.22)' : dusk ? 'rgba(255,150,90,0.34)' : 'rgba(255,232,150,0.32)';
      const gr = ctx.createRadialGradient(cx2, cy2, 4, cx2, cy2, 58); gr.addColorStop(0, glow); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.fillRect(cx2 - 58, cy2 - 58, 116, 116);
      const rr = night ? 7 : 9; ctx.fillStyle = night ? '#e8eef0' : '#ffe6a3'; ctx.fillRect(Math.round(cx2 - rr), Math.round(cy2 - rr), rr * 2, rr * 2);
      if (night) { ctx.fillStyle = skyTop; ctx.fillRect(Math.round(cx2 - rr + 5), Math.round(cy2 - rr - 1), rr * 2, rr * 2); }
      const hg = ctx.createLinearGradient(0, H * 0.14, 0, H * 0.24); hg.addColorStop(0, 'rgba(0,0,0,0)'); hg.addColorStop(1, night ? 'rgba(120,150,185,0.16)' : dusk ? 'rgba(255,175,115,0.24)' : 'rgba(224,242,232,0.2)'); ctx.fillStyle = hg; ctx.fillRect(0, H * 0.14, W, H * 0.1); }
    for (let by = 0; by < H; by++) {
      const v = by - H / 2, factor = P / (P - v * VIEW.pitch); if (factor <= .03) continue;
      const scale = factor * VIEW.scale, sy = H * VIEW.horizon + v * scale;
      const v2 = by + 1 - H / 2, sy2 = H * VIEW.horizon + v2 * (P / (P - v2 * VIEW.pitch)) * VIEW.scale;
      const h = Math.max(1, Math.ceil(sy2 - sy)); if (sy > H || sy2 < 0) continue;
      const dw = W * scale; ctx.drawImage(groundBuf, 0, by, W, 1, Math.round(W / 2 - dw / 2), Math.round(sy), Math.ceil(dw), h);
    }
    for (const entity of visible) {
      const base = project(entity.x, entity.y); if (base.factor <= .03) continue;
      ctx.save(); ctx.translate(base.sx, base.sy); ctx.scale(base.scale, base.scale); ctx.translate(-entity.x, -entity.y);
      if (entity.type === 'player') drawPlayer(); else drawEntity(entity); ctx.restore();
    }
    if (!interior() && !state.player.moon) { const hazeC = night ? '46,70,98' : dusk ? '228,168,118' : '150,198,188'; const hz = ctx.createLinearGradient(0, H * 0.18, 0, H * 0.52); hz.addColorStop(0, `rgba(${hazeC},0.5)`); hz.addColorStop(1, `rgba(${hazeC},0)`); ctx.fillStyle = hz; ctx.fillRect(0, H * 0.18, W, H * 0.34); }
    if (placing) { const { px, py } = placePreview(); const base = project(px + 8, py + 8); ctx.save(); ctx.translate(base.sx, base.sy); ctx.scale(base.scale, base.scale); ctx.translate(-(px + 8), -(py + 8)); ctx.globalAlpha = .55; drawEntity({ type: placing, x: px + 8, y: py + 8 }); ctx.globalAlpha = 1; ctx.restore(); }
    for (const particle of particles) { const p = project(particle.x, particle.y); const s = Math.max(1, Math.round(2 * p.scale)); rect(p.sx, p.sy, s, s, particle.color); }
    ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff0be'; for (const floater of floaters) { const p = project(floater.x, floater.y); ctx.fillText(floater.text, p.sx, p.sy); }
    applyPostFX(true);
  }
  function applyPostFX(is3d) {
    const W = canvas.width, H = canvas.height;
    const darkness = inHome() ? .22 : inCave() ? .60 : state.time < 300 || state.time > 1260 ? .64 : state.time < 420 ? (420 - state.time) / 120 * .64 : state.time > 1080 ? (state.time - 1080) / 180 * .64 : 0;
    if (darkness > 0) {
      const dark = lightCtx; dark.globalCompositeOperation = 'source-over'; dark.clearRect(0, 0, lightMask.width, lightMask.height); dark.fillStyle = `rgba(8,24,37,${darkness})`; dark.fillRect(0, 0, lightMask.width, lightMask.height); dark.globalCompositeOperation = 'destination-out';
      const world = [{ x: state.player.x, y: state.player.y, radius: count('torch') ? 115 : inHome() ? 85 : inCave() ? 60 : 55 }, ...currentBuildings().filter(b => ['campfire', 'lamp', 'lanternpost', 'fireplace'].includes(b.type)).map(b => ({ x: b.x, y: b.y, radius: b.type === 'campfire' ? 90 : b.type === 'lanternpost' ? 85 : b.type === 'fireplace' ? 80 : 70 }))];
      if (state.won && !interior()) world.push({ x: 59 * TILE, y: 46 * TILE - 70, radius: 200 });
      for (const light of world) { let x, y, r; if (is3d) { const p = project(light.x, light.y); x = p.sx; y = p.sy; r = Math.max(14, light.radius * p.scale); } else { x = light.x - camera.x + W / 2; y = light.y - camera.y + H / 2; r = light.radius; } const gradient = dark.createRadialGradient(x, y, 8, x, y, r); gradient.addColorStop(0, 'rgba(255,255,255,.95)'); gradient.addColorStop(1, 'rgba(255,255,255,0)'); dark.fillStyle = gradient; dark.fillRect(x - r, y - r, r * 2, r * 2); }
      ctx.drawImage(lightMask, 0, 0);
    }
    if (!interior()) {
      const t = state.time;
      if (t >= 300 && t < 480) { ctx.fillStyle = `rgba(255,176,96,${(1 - Math.abs(t - 390) / 90) * .12})`; ctx.fillRect(0, 0, W, H); }
      else if (t >= 1020 && t < 1200) { ctx.fillStyle = `rgba(255,132,70,${(1 - Math.abs(t - 1110) / 90) * .16})`; ctx.fillRect(0, 0, W, H); }
      ctx.fillStyle = '#cee2b30a'; for (let index = 0; index < 3; index++) { const x = (frameTime * 7 + index * 241) % (W + 200) - 100; ctx.fillRect(x, index * 107 + 30, 115, 24); ctx.fillRect(x + 25, index * 107 + 18, 65, 46); }
    }
    if ((state.player.world || 0) === 1 && !interior()) { ctx.fillStyle = 'rgba(150,96,185,0.1)'; ctx.fillRect(0, 0, W, H); }
    if (vignette) ctx.drawImage(vignette, 0, 0);
  }
  function createMap() {
    mapBitmap = document.createElement('canvas'); mapBitmap.width = WIDTH; mapBitmap.height = HEIGHT; const mapCtx = mapBitmap.getContext('2d');
    const colors = ['#285d64', '#529691', '#d5c691', '#79996b', '#b2a070', '#223a3e', '#99968d'];
    for (let ty = 0; ty < HEIGHT; ty++) for (let tx = 0; tx < WIDTH; tx++) { mapCtx.fillStyle = colors[terrainAt(tx, ty)]; mapCtx.fillRect(tx, ty, 1, 1); }
  }
  function drawMap(target, full = false) {
    const context = target.getContext('2d'); context.imageSmoothingEnabled = false; context.drawImage(mapBitmap, 0, 0, target.width, target.height);
    const sx = target.width / WIDTH, sy = target.height / HEIGHT, w0 = !state.player.moon && (state.player.world || 0) === 0;
    if (w0) for (let index = 0; index < islands.length; index++) if (!state.discovered.includes(index)) { context.fillStyle = '#0e3435bb'; const island = islands[index]; context.fillRect((island.x - island.rx - 2) * sx, (island.y - island.ry - 2) * sy, (island.rx * 2 + 4) * sx, (island.ry * 2 + 4) * sy); if (full) { context.fillStyle = '#bdc8b0'; context.font = '12px monospace'; context.textAlign = 'center'; context.fillText('UNCHARTED', island.x * sx, island.y * sy); } }
    const origin = inHome() ? (homeOrigin || state.spawn) : inCave() ? caveOrigin || state.spawn : state.player;
    if (w0) for (const landmark of entities.filter(e => ['lighthouse', 'ruin', 'cave', 'shrine', 'tower'].includes(e.type))) { const index = islands.findIndex(i => Math.hypot((landmark.x / TILE - i.x) / i.rx, (landmark.y / TILE - i.y) / i.ry) < 1.1); if (!state.discovered.includes(index)) continue; context.fillStyle = '#e7cd80'; context.fillRect(landmark.x / TILE * sx - 1, landmark.y / TILE * sy - 1, full ? 5 : 2, full ? 5 : 2); }
    for (const building of state.buildings.filter(b => ['shelter', 'house'].includes(b.type) && !b.cave && !b.home && (b.world || 0) === (state.player.world || 0))) { context.fillStyle = '#f0a37e'; context.fillRect(building.x / TILE * sx - 1, building.y / TILE * sy - 1, full ? 5 : 2, full ? 5 : 2); }
    context.fillStyle = '#fff6d2'; context.fillRect(origin.x / TILE * sx - 2, origin.y / TILE * sy - 2, full ? 6 : 4, full ? 6 : 4);
    if (full && w0) { context.font = '11px monospace'; context.textAlign = 'center'; for (let index = 0; index < islands.length; index++) if (state.discovered.includes(index)) { const island = islands[index]; context.fillStyle = '#102d29'; context.fillText(island.name, island.x * sx, (island.y + island.ry + 7) * sy); } }
    if (full && !w0) { context.font = '12px monospace'; context.textAlign = 'center'; context.fillStyle = '#e8dcff'; context.fillText(state.player.moon ? 'THE MOON' : 'THE FAR REACHES', target.width / 2, 20); }
  }
  function icon(id) {
    const image = document.createElement('canvas'); image.width = 24; image.height = 24; image.className = 'item-icon'; image.setAttribute('aria-hidden', 'true'); const context = image.getContext('2d');
    const box = (x, y, width, height, color) => { context.fillStyle = color; context.fillRect(x, y, width, height); };
    const color = items[id]?.color || '#ccd2a8';
    if (id === 'wood') { box(4, 7, 15, 10, '#735c40'); box(4, 6, 15, 7, color); box(5, 7, 3, 5, '#e2b77c'); box(9, 8, 10, 1, '#cf9f66'); }
    else if (id === 'stone') { box(4, 10, 16, 9, '#798f89'); box(7, 5, 11, 11, color); box(8, 6, 6, 2, '#d6d8c0'); }
    else if (id === 'berries') { box(9, 3, 7, 5, '#8dbf72'); box(4, 8, 8, 8, '#ba6c7e'); box(11, 10, 8, 8, color); box(6, 9, 2, 2, '#f0b0a0'); }
    else if (id === 'fiber') { box(5, 7, 3, 13, '#80a264'); box(10, 3, 3, 17, color); box(15, 8, 3, 12, '#beca85'); box(4, 15, 16, 3, '#c7a675'); }
    else if (id === 'hoe') { box(11, 4, 3, 16, '#b58e5d'); box(6, 3, 9, 4, color); box(6, 3, 3, 8, color); }
    else if (id === 'rod') { box(4, 17, 3, 3, '#6e5236'); box(5, 16, 11, 2, '#8a6a46'); box(15, 4, 2, 13, color); box(16, 4, 1, 13, '#cfd3c0'); box(6, 16, 1, 4, '#cfd3c0'); box(5, 19, 3, 2, '#8fb6c6'); }
    else if (id === 'fish') { box(5, 9, 11, 7, color); box(14, 7, 5, 10, color); box(3, 11, 3, 3, '#6f93a0'); box(8, 10, 2, 2, '#243842'); box(7, 13, 6, 1, '#6f93a0'); }
    else if (id === 'cookedfish') { box(3, 14, 18, 3, '#b58a5a'); box(5, 8, 12, 7, color); box(15, 7, 4, 9, color); box(8, 10, 2, 2, '#7a4a2a'); box(12, 11, 2, 1, '#a06a3a'); }
    else if (id === 'stew') { box(3, 11, 18, 7, color); box(3, 11, 18, 2, '#e0a378'); box(6, 8, 3, 3, '#8fbf5a'); box(11, 8, 3, 3, '#c65f74'); box(15, 9, 2, 2, '#d8b87a'); box(4, 17, 16, 2, '#8a5a3a'); }
    else if (id === 'bomb') { box(6, 8, 12, 11, '#3a4042'); box(6, 8, 12, 3, '#55605f'); box(9, 4, 2, 5, '#8a6a46'); box(9, 2, 3, 3, '#ffd36a'); }
    else if (id === 'tnt') { box(5, 7, 14, 12, color); box(5, 11, 14, 3, '#efe6d0'); box(10, 3, 2, 5, '#8a6a46'); box(10, 2, 3, 2, '#ffd36a'); }
    else if (id === 'rocket') { box(10, 3, 4, 10, color); box(11, 2, 2, 2, '#eee'); box(9, 13, 6, 4, '#c0392b'); box(8, 16, 2, 3, '#f4cf78'); box(14, 16, 2, 3, '#f4cf78'); }
    else if (id === 'spacesuit') { box(7, 5, 10, 13, color); box(5, 6, 3, 10, '#a9b5b4'); box(16, 6, 3, 10, '#a9b5b4'); box(9, 3, 6, 3, '#e9efe9'); box(9, 8, 6, 4, '#91c4c6'); box(9, 18, 3, 3, '#89938f'); box(13, 18, 3, 3, '#89938f'); }
    else if (id === 'car') { box(3, 9, 18, 8, color); box(3, 9, 18, 2, '#d97a6a'); box(6, 6, 12, 4, '#2b3a44'); box(4, 16, 4, 3, '#222'); box(16, 16, 4, 3, '#222'); }
    else if (id === 'plane') { box(10, 3, 4, 18, color); box(2, 9, 20, 4, '#c2c8b4'); box(8, 18, 8, 3, '#c2c8b4'); box(10, 3, 4, 3, '#2b3a44'); }
    else if (id === 'runway') { box(3, 4, 18, 16, color); box(3, 4, 18, 2, '#9ba0a6'); box(3, 18, 18, 2, '#6f757b'); box(11, 7, 2, 4, '#e8e4cf'); box(11, 13, 2, 4, '#e8e4cf'); }
    else if (['axe', 'pickaxe', 'sword'].includes(id)) { box(11, 5, 3, 16, '#b58e5d'); box(id === 'sword' ? 11 : 5, 3, id === 'sword' ? 3 : 14, id === 'sword' ? 13 : 6, color); if (id === 'sword') box(7, 15, 11, 2, '#b58e5d'); }
    else if (id === 'spear') { box(11, 3, 2, 18, '#8a6a46'); box(9, 2, 6, 6, color); box(11, 2, 2, 4, '#9aa08c'); }
    else if (id === 'armor') { box(6, 5, 12, 14, color); box(6, 5, 3, 14, '#9c8450'); box(15, 5, 3, 14, '#9c8450'); box(9, 5, 6, 4, '#6b5a3a'); box(10, 11, 4, 5, '#8a7340'); }
    else if (id === 'jam') { box(7, 3, 9, 3, '#8a6a46'); box(5, 6, 14, 13, '#d9d2bc'); box(7, 9, 10, 8, color); box(8, 10, 4, 2, '#e38aa0'); }
    else if (id === 'rations') { box(5, 6, 14, 12, color); box(5, 6, 14, 3, '#b58a5a'); box(8, 10, 3, 3, '#8a5a3a'); box(13, 12, 3, 3, '#8a5a3a'); box(5, 13, 14, 1, '#a07c50'); }
    else if (id === 'seeds') { box(5, 14, 14, 5, '#8a6a46'); box(5, 14, 14, 2, '#a07c50'); box(8, 7, 3, 4, color); box(13, 9, 3, 4, color); box(10, 4, 3, 4, color); }
    else if (id === 'veg') { box(8, 3, 3, 6, '#5fa050'); box(5, 9, 14, 9, color); box(5, 9, 14, 3, '#a7d57a'); box(8, 13, 3, 3, '#6fae5c'); box(13, 14, 3, 2, '#6fae5c'); }
    else if (id === 'lanternpost') { box(10, 10, 4, 11, '#6e5236'); box(6, 3, 12, 9, '#6e5236'); box(7, 4, 10, 7, color); box(9, 6, 6, 4, '#fff6cf'); }
    else if (id === 'stonewall') { box(3, 8, 18, 11, color); box(3, 8, 18, 2, '#b7c0b8'); box(11, 8, 1, 11, '#5f6e67'); box(3, 13, 18, 1, '#5f6e67'); }
    else if (id === 'well') { box(4, 10, 16, 9, color); box(4, 10, 16, 2, '#b7c0b8'); box(7, 12, 10, 5, '#20302f'); box(5, 3, 3, 8, '#6e5236'); box(16, 3, 3, 8, '#6e5236'); box(3, 2, 18, 3, '#8a4f3c'); }
    else if (id === 'fireplace') { box(4, 6, 16, 13, '#7a6a58'); box(7, 11, 10, 8, '#241d18'); box(9, 12, 6, 6, color); box(7, 3, 10, 4, '#6b5a48'); }
    else if (id === 'clock') { box(6, 3, 12, 18, color); box(8, 5, 8, 7, '#ece3cf'); box(11, 6, 1, 4, '#333'); box(11, 15, 2, 5, '#c0a060'); }
    else if (id === 'raft' || id === 'bridge' || id === 'wall' || id === 'dock') { for (let index = 0; index < 4; index++) box(3 + index * 5, 6, 4, 13, color); box(3, 9, 19, 2, '#6f6549'); box(3, 16, 19, 2, '#6f6549'); }
    else if (id === 'ship') { box(3, 13, 18, 6, '#8a6038'); box(3, 12, 18, 2, '#c49a63'); box(11, 3, 2, 10, '#6e5236'); box(13, 4, 7, 8, '#f3ecd6'); box(1, 14, 3, 4, '#7a5230'); box(20, 14, 3, 4, '#7a5230'); }
    else if (id === 'campfire' || id === 'torch') { box(6, 17, 13, 4, '#8d917b'); box(8, 10, 9, 9, '#df8c52'); box(11, 4, 4, 13, color); box(12, 9, 2, 7, '#ffeba3'); }
    else if (id === 'shelter') { for (let index = 0; index < 7; index++) box(11 - index, 4 + index * 2, 2 + index * 2, 3, color); box(9, 13, 7, 8, '#354f40'); }
    else if (id === 'house') { for (let index = 0; index < 6; index++) box(11 - index, 3 + index, 2 + index * 2, 2, '#9a5b45'); box(15, 4, 3, 5, '#7a6a55'); box(5, 12, 14, 9, color); box(5, 12, 14, 2, '#d8bd86'); box(10, 15, 4, 6, '#4a3726'); box(7, 14, 3, 3, '#bfe0d8'); }
    else if (id === 'bandage') { box(3, 8, 18, 9, color); box(10, 8, 5, 9, '#cf886e'); box(7, 11, 11, 3, '#cf886e'); }
    else { box(9, 3, 7, 4, color); box(6, 7, 13, 10, color); box(9, 17, 7, 4, color); box(9, 8, 4, 6, id === 'relic' ? '#fff0b4' : '#b3f2d7'); }
    return image;
  }
  function hotbarIds() { return (state.hotbar && state.hotbar.length === 8) ? state.hotbar : DEFAULT_HOTBAR; }
  function updateHUD() {
    const quest = quests[state.quest], value = Math.min(quest.goal, quest.value(state));
    $('quest-title').textContent = state.won ? 'The light returns' : quest.title; $('quest-description').textContent = state.won ? 'The island is no longer lost. Your adventure continues.' : quest.desc; $('quest-fill').style.width = `${value / quest.goal * 100}%`; $('quest-count').textContent = `${value} / ${quest.goal}`;
    $('health-value').textContent = Math.ceil(state.player.health); $('stamina-value').textContent = Math.ceil(state.player.stamina); $('health-fill').style.width = `${state.player.health}%`; $('stamina-fill').style.width = `${state.player.stamina}%`;
    const hours = Math.floor(state.time / 60), minutes = Math.floor(state.time % 60); $('clock').textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`; $('day').textContent = `DAY ${String(state.day).padStart(2, '0')}`; $('sun-icon').textContent = hours > 5 && hours < 19 ? '*' : ')';
    const index = islands.findIndex(i => Math.hypot((state.player.x / TILE - i.x) / i.rx, (state.player.y / TILE - i.y) / i.ry) < 1.1); $('location').textContent = state.player.moon ? 'The Moon' : inHome() ? 'Your home' : inCave() ? 'Moonstone Cavern' : (state.player.world || 0) === 1 ? 'The Far Reaches' : index < 0 ? 'The Open Sea' : islands[index].name;
    drawMap(mini);
    const bar = $('hotbar'), sig = hotbarIds().join(',');
    if (bar.dataset.sig !== sig) {
      bar.dataset.sig = sig; bar.replaceChildren();
      hotbarIds().forEach((id, index) => { const button = document.createElement('button'); button.className = 'slot'; button.title = id ? `${items[id].name} (${index + 1})` : `Empty slot (${index + 1})`; button.setAttribute('aria-label', button.title); if (id) button.append(icon(id)); const key = document.createElement('span'); key.className = 'key'; key.textContent = index + 1; button.append(key); const amount = document.createElement('span'); amount.className = 'amount'; button.append(amount); button.addEventListener('click', () => { const cur = hotbarIds()[index]; if (cur) useItem(cur); }); bar.append(button); });
    }
    [...bar.children].forEach((button, index) => { const id = hotbarIds()[index]; button.querySelector('.amount').textContent = id ? (count(id) || '-') : ''; button.classList.toggle('active', !!id && selected === id); button.style.opacity = id && count(id) ? '1' : '.55'; });
    const interaction = $('interaction'); interaction.hidden = !!panel || (!placing && !activeTarget && !planeTakeoff);
    interaction.querySelector('span').textContent = planeTakeoff ? 'TAKEOFF' : placing ? `Place ${items[placing].name.toLowerCase()} (Esc to cancel)` : activeTarget ? ({ tree: 'Gather wood', rock: 'Gather stone', bush: 'Pick berries', fiber: 'Gather fiber', crystal: 'Mine moonstone', cave: 'Enter cave', exit: 'Return to the island', ruin: 'Search the old ruins', shrine: 'Approach the shrine', altar: 'Examine the altar', lighthouse: state.won ? 'The light returns' : 'Restore the lighthouse', wreck: 'Search the shipwreck', sign: 'Read the old sign', airstrip: state.runwayRepaired ? 'Check the repaired runway' : 'Repair the island runway', rocket: 'Board the rocket', moonrocket: 'Board the return rocket', campfire: 'Rest by the fire', shelter: state.time >= 360 && state.time <= 1140 ? 'Set home (sleep at night)' : 'Sleep until dawn', house: 'Enter your home', door: 'Leave your home', bed: state.time >= 360 && state.time <= 1140 ? 'Set home (sleep at night)' : 'Sleep until dawn', camp: 'Search the abandoned camp', cabin: 'Search the ruined cabin', cache: 'Open the supply cache', tower: 'Search the fallen tower', well: 'Drink from the well', crop: ((state.day * 1440 + state.time) - (activeTarget.planted || 0)) >= 640 ? 'Harvest the crop' : 'Tend the growing crop' }[activeTarget.type] || 'Interact') : '';
    if (activeTarget?.type === 'drop') interaction.querySelector('span').textContent = `Collect ${items[activeTarget.item].name} x${activeTarget.amount}`;
  }
  function closePanel() { panel = null; confirmReset = false; hotbarEdit = null; $('overlay').hidden = true; keys = {}; updateHUD(); canvas.focus(); }
  function setView(on) { view3d = on; $('game').classList.toggle('view-3d', on); try { localStorage.setItem('lost-island-view3d', on ? '1' : '0'); } catch { } }
  function openPanel(name) { panel = name; keys = {}; $('overlay').hidden = false; renderPanel(); $('close-panel').focus(); updateHUD(); }
  function button(text, action, className = 'secondary') { const element = document.createElement('button'); element.className = className; element.textContent = text; element.onclick = action; return element; }
  function paragraph(text, className = 'panel-copy') { const element = document.createElement('p'); element.className = className; element.textContent = text; return element; }
  function renderPanel() {
    const content = $('panel-content'); content.replaceChildren(); $('panel-title').textContent = ({ inventory: 'Your satchel', craft: 'Make something useful', map: 'The archipelago', guide: 'How to get things', journal: 'A wanderer\'s journal', settings: 'A moment of quiet', victory: 'The light returns' })[panel];
    if (panel === 'inventory') {
      content.append(paragraph(hotbarEdit !== null ? `Tap an item below to put it in slot ${hotbarEdit + 1}, or tap the slot again to clear it.` : 'Your bar — tap a slot, then tap an item to assign it.', 'panel-copy'));
      const barEdit = document.createElement('div'); barEdit.className = 'hotbar-edit';
      hotbarIds().forEach((id, index) => { const slot = document.createElement('button'); slot.className = 'edit-slot' + (hotbarEdit === index ? ' active' : ''); slot.title = id ? items[id].name : 'Empty'; if (id) slot.append(icon(id)); const k = document.createElement('span'); k.className = 'key'; k.textContent = index + 1; slot.append(k); slot.onclick = () => { if (hotbarEdit === index) { state.hotbar[index] = null; hotbarEdit = null; updateHUD(); renderPanel(); } else { hotbarEdit = index; renderPanel(); } }; barEdit.append(slot); });
      content.append(barEdit);
      const grid = document.createElement('div'); grid.className = 'inventory-grid';
      for (const [id, amount] of Object.entries(state.inventory).filter(([, amount]) => amount > 0)) { const element = button('', () => { if (hotbarEdit !== null) { state.hotbar[hotbarEdit] = id; notify(`${items[id].name} added to your bar`); hotbarEdit = null; updateHUD(); renderPanel(); } else useItem(id); }, 'inventory-item'); element.append(icon(id)); const label = document.createElement('div'), name = document.createElement('strong'), quantity = document.createElement('small'); name.textContent = items[id].name; quantity.textContent = `x ${amount}`; label.append(name, quantity); element.append(label); element.title = hotbarEdit !== null ? `Assign to slot ${hotbarEdit + 1}` : ['berries', 'bandage'].includes(id) ? 'Consume' : recipes.some(r => r.id === id && r.build) ? 'Place building' : 'Select item'; grid.append(element); }
      content.append(grid); if (!grid.children.length) content.append(paragraph('Your satchel is empty. The island has plenty to offer.'));
      content.append(button('Not sure how? Open the Guide (G)', () => openPanel('guide'), 'secondary'));
    } else if (panel === 'craft') {
      for (const recipe of recipes) { const row = document.createElement('div'); row.className = 'recipe'; row.append(icon(recipe.id)); const info = document.createElement('div'); info.className = 'recipe-info'; const title = document.createElement('h3'); title.textContent = items[recipe.id].name; info.append(title, paragraph(recipe.desc, '')); const cost = document.createElement('div'); cost.className = 'cost'; cost.textContent = Object.entries(recipe.cost).map(([id, amount]) => `${items[id].name} ${count(id)}/${amount}`).join('  /  '); info.append(cost); if (recipe.requires && !recipe.requires(state)) info.append(paragraph('Requires ' + (recipe.reqText || 'a prerequisite') + '.', 'cost')); const make = button(recipe.unique && count(recipe.id) ? 'Owned' : 'Craft', () => craft(recipe.id)); make.disabled = !canCraft(recipe); make.dataset.recipe = recipe.id; row.append(info, make); content.append(row); }
    } else if (panel === 'map') { const map = document.createElement('canvas'); map.width = 576; map.height = 414; map.className = 'world-map'; map.setAttribute('aria-label', 'Archipelago map with player and landmarks'); content.append(map); drawMap(map, true); content.append(paragraph('Ivory: you    /    Gold: ancient landmarks    /    Coral: your home', 'map-legend')); }
    else if (panel === 'guide') {
      content.append(paragraph('A quick field guide to getting everything on the island. The count after each name is how many you already have.'));
      const gather = {
        wood: 'Stand next to a tree and press E to chop it, then press E by the dropped wood to collect it. A Stone axe makes each tree drop more wood.',
        stone: 'Press E at a grey rock to mine it, then collect the dropped stone. A Pickaxe makes each rock drop more stone.',
        fiber: 'Press E on the tall fiber plants, then collect the dropped fiber.',
        berries: 'Press E on a pink berry bush, then collect the dropped berries. Eat them (hotbar slot 4) to restore health and stamina.',
        crystal: 'Press E at a cave mouth to go underground, then mine the glowing Moonstone crystals — you need a Pickaxe. Collect the crystals they drop.',
        relic: 'Recover the three relics: in the old ruins, deep inside Moonstone Isle\'s cave, and at the Hollow Wilds shrine (clear its guardians first). Bring all three to the lighthouse to win.'
      };
      const section = (label, ids, describe) => {
        content.append(paragraph(label, 'section-label'));
        for (const id of ids) { const row = document.createElement('div'); row.className = 'recipe'; row.append(icon(id)); const info = document.createElement('div'); info.className = 'recipe-info'; const heading = document.createElement('h3'); heading.textContent = `${items[id].name}  ·  you have ${count(id)}`; info.append(heading, paragraph(describe(id), '')); row.append(info); content.append(row); }
      };
      const craftHow = id => { const recipe = recipes.find(entry => entry.id === id); return `Craft it in the Crafting menu (C). Needs ${Object.entries(recipe.cost).map(([resource, amount]) => `${amount} ${items[resource].name.toLowerCase()}`).join(', ')}.${recipe.build ? ' Then place it in the world.' : ''}${recipe.requires ? ' Requires ' + (recipe.reqText || 'a prerequisite') + '.' : ''}`; };
      section('RESOURCES — gather these out in the world', ['wood', 'stone', 'fiber', 'berries', 'crystal'], id => gather[id]);
      section('TOOLS & GEAR — craft these', ['axe', 'pickaxe', 'hoe', 'sword', 'spear', 'armor', 'rod', 'raft', 'dock', 'ship', 'torch', 'spacesuit'], craftHow);
      section('SUPPLIES — craft these', ['bandage', 'jam', 'rations', 'cookedfish', 'stew'], craftHow);
      content.append(paragraph('Fishing: craft a Fishing rod, stand at the water\'s edge facing the sea, and press E to cast. Catch fish, then cook them at a campfire into tasty meals and hearty stew.', 'panel-copy'));
      section('VEHICLES & GADGETS — craft these', ['bomb', 'tnt', 'rocket', 'car', 'runway', 'plane'], craftHow);
      content.append(paragraph('Clearing space: place a Bomb or TNT and step back — the blast clears trees, rocks and bushes (and harms enemies), handing you the resources. Vehicles: select the Car to drive fast over land. Repair the broken runway on Moonstone Isle with 10 wood, 8 stone, and 4 fiber, then stand on it and select the Plane. Watch the takeoff sequence, then steer through the sky with WASD; select the Plane again to land. You can also build a runway from at least 5 tiles in a straight line. Place a Rocket and press E to board for a Moon trip. Without a Spacesuit, the lunar cold drains your health until you die; with one, press E at the return rocket to come back.', 'panel-copy'));
      content.append(paragraph('Another world: fly your Plane to the very edge of the map and you will soar across the open sky to The Far Reaches — a wild new land. Fly off its edge to return home. You can only travel there by plane.', 'panel-copy'));
      content.append(paragraph('Customise your bar: open your Inventory, tap a hotbar slot at the top, then tap an item to assign it there (tap the slot again to clear it).', 'panel-copy'));
      section('BUILDINGS — craft, then place outdoors', ['campfire', 'wall', 'stonewall', 'bridge', 'lanternpost', 'well', 'shelter', 'house'], craftHow);
      content.append(paragraph('Farming: craft a Hoe, then craft Seeds from berries, plant them on open grass outdoors, and press E to harvest Vegetables once the crop ripens (about a day). Vegetables restore health and stamina.', 'panel-copy'));
      section('FARMING — craft, then plant on grass', ['seeds'], craftHow);
      content.append(paragraph('Build a House, then press E on it to step inside your own home. It starts with a bed, table, and wall art — craft the decor below and place it indoors with E. Press E at the door to leave. Sleep in the bed at night to rest until dawn.', 'panel-copy'));
      section('HOME DECOR — craft, then place inside your home', ['bed', 'table', 'chair', 'rug', 'lamp', 'plant', 'bookshelf', 'painting', 'fireplace', 'clock'], craftHow);
      section('THE GOAL', ['relic'], id => gather[id]);
      content.append(button('Open crafting (C)', () => openPanel('craft'), 'primary'));
    }
    else if (panel === 'journal') {
      for (let index = 0; index < quests.length; index++) { const entry = document.createElement('div'); entry.className = `journal-entry ${index < state.quest || state.won ? 'done' : ''}`; const title = document.createElement('h3'); title.textContent = `${index < state.quest || state.won ? '+ ' : ''}${quests[index].title}`; entry.append(title, paragraph(quests[index].desc, '')); content.append(entry); }
      content.append(paragraph(`ACHIEVEMENTS  ${state.achievements.length} / ${achievements.length}`, 'section-label'));
      for (const achievement of achievements) { const row = document.createElement('div'); row.className = `achievement ${state.achievements.includes(achievement.id) ? 'unlocked' : ''}`; const name = document.createElement('div'); name.textContent = achievement.name; name.append(paragraph(achievement.desc, 'eyebrow')); const status = document.createElement('span'); status.textContent = state.achievements.includes(achievement.id) ? 'UNLOCKED' : 'LOCKED'; row.append(name, status); content.append(row); }
    } else if (panel === 'victory') {
      content.append(paragraph('A golden beam stretches across the sea. For the first time in years, the keepers\' light shines again. Somewhere beyond the horizon, someone sees it.'), paragraph(`You restored the lighthouse on day ${state.day}, discovered ${state.discovered.length} islands, and earned ${state.achievements.length} achievements. This island is yours now. Keep exploring, build a home, and enjoy another sunrise.`)); content.append(button('Stay a little longer', closePanel, 'primary'));
    } else if (panel === 'settings') {
      content.append(paragraph('The world rests while this menu is open. Your adventure is saved automatically every 30 seconds.'));
      const actions = document.createElement('div'); actions.className = 'settings-buttons'; actions.append(button('Resume', closePanel, 'primary'), button(view3d ? 'View: 3D' : 'View: Top-down', () => { setView(!view3d); renderPanel(); }), button('Save progress', () => save()), button('Load progress', load), button(soundOn ? 'Sound: on' : 'Sound: off', () => { soundOn = !soundOn; tone(); renderPanel(); })); content.append(actions);
      const backup = document.createElement('div'); backup.className = 'settings-buttons'; backup.append(button('Export save', () => { state.caveOrigin = caveOrigin; const url = URL.createObjectURL(new Blob([JSON.stringify(state)], { type: 'application/json' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'the-lost-island-save.json'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }), button('Import save', () => $('import-file').click()), button(confirmReset ? 'Confirm reset \u2014 erases progress' : 'Reset game', () => { if (!confirmReset) { confirmReset = true; renderPanel(); return; } state = freshState(); generate(); caveOrigin = null; homeOrigin = null; placing = null; selected = 'wood'; particles = []; floaters = []; camera.x = state.player.x; camera.y = state.player.y; save(true); closePanel(); discover("Wanderer's Shore"); notify('Game reset', 'A brand new adventure begins.'); }, 'secondary danger')); content.append(backup);
      content.append(paragraph('FIELD GUIDE', 'section-label'));
      const controls = document.createElement('div'); controls.className = 'controls-list';
      for (const [key, label] of [['WASD', 'Move'], ['Shift', 'Sprint'], ['E', 'Gather / interact'], ['Space', 'Attack'], ['I', 'Inventory'], ['C', 'Crafting'], ['M', 'Map'], ['G', 'How-to guide'], ['J', 'Journal'], ['V', '3D / top-down view'], ['1-8', 'Quick items'], ['Esc', 'Pause / cancel'], ['Click', 'Attack / place']]) { const row = document.createElement('span'); const keyElement = document.createElement('kbd'); keyElement.textContent = key; row.append(keyElement, document.createTextNode(label)); controls.append(row); }
      content.append(controls, paragraph('Gather trees and rocks with E. Tools increase yields. Berries restore health and stamina. Campfires heal nearby. Build a shelter or a sturdy house to set your home \u2014 you can only sleep (resting until dawn) at night; by day they just set your respawn point. A raft lets you cross deep water automatically \u2014 you need it to reach the far islands (the Drowned Docks, Ashen Reach, and Gull Rock) across the open ocean. Find three relics and restore the lighthouse on the northern shore. The Moonstone relic is inside Moonstone Isle\'s cave. Search broken-down places \u2014 camps, cabins, caches, towers, and wrecks \u2014 for extra supplies. Resources return after two days; shrine guardians do not.'));
    }
  }
  function resize() { canvas.width = Math.ceil(innerWidth / 2); canvas.height = Math.ceil(innerHeight / 2); lightMask.width = canvas.width; lightMask.height = canvas.height; groundBuf.width = canvas.width; groundBuf.height = canvas.height; vignette = document.createElement('canvas'); vignette.width = canvas.width; vignette.height = canvas.height; const vc = vignette.getContext('2d'); const vg = vc.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.height * .34, canvas.width / 2, canvas.height / 2, canvas.height * .78); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(9,28,34,.32)'); vc.fillStyle = vg; vc.fillRect(0, 0, canvas.width, canvas.height); ctx.imageSmoothingEnabled = false; }
  function loop(timestamp) { const dt = Math.min(.05, (timestamp - (loop.previous || timestamp)) / 1000); loop.previous = timestamp; frameTime += dt; if (!panel && !document.hidden) update(dt); render(); requestAnimationFrame(loop); }
  document.addEventListener('keydown', event => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.code) && event.code !== 'Tab') event.preventDefault();
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === 'Escape') { if (placing) { placing = null; notify('Building cancelled', 'The item stays in your inventory.'); } else panel ? closePanel() : openPanel('settings'); return; }
    if (panel) { if (key === 'Tab') { const focusable = [...$('overlay').querySelectorAll('button:not(:disabled)')]; const first = focusable[0], last = focusable.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } return; }
    if (event.repeat && ['i', 'c', 'm', 'j', 'g', 'v', ' '].includes(key)) return;
    if (key === 'v') { setView(!view3d); if (panel === 'settings') renderPanel(); return; }
    if ({ i: 'inventory', c: 'craft', m: 'map', j: 'journal', g: 'guide' }[key]) { openPanel({ i: 'inventory', c: 'craft', m: 'map', j: 'journal', g: 'guide' }[key]); return; }
    if (key === ' ') attack(); else if (/^[1-8]$/.test(key)) useItem(hotbarIds()[Number(key) - 1]); else keys[key] = true;
  });
  document.addEventListener('keyup', event => { keys[event.key.length === 1 ? event.key.toLowerCase() : event.key] = false; });
  window.addEventListener('blur', () => { keys = {}; }); document.addEventListener('visibilitychange', () => { if (document.hidden) { keys = {}; save(true); if (!panel) openPanel('settings'); } });
  canvas.addEventListener('pointerdown', event => { if (panel) return; if (placing) { if (view3d) { buildAt(state.player.x + state.player.face.x * 32, state.player.y + state.player.face.y * 32); } else { const bounds = canvas.getBoundingClientRect(); buildAt((event.clientX - bounds.left) * canvas.width / bounds.width + camera.x - canvas.width / 2, (event.clientY - bounds.top) * canvas.height / bounds.height + camera.y - canvas.height / 2); } } else { const dx = (event.clientX / innerWidth - .5) * canvas.width, dy = (event.clientY / innerHeight - .5) * canvas.height; const length = Math.hypot(dx, dy) || 1; state.player.face = { x: dx / length, y: dy / length }; attack(); } });
  document.querySelectorAll('[data-panel]').forEach(element => element.onclick = () => openPanel(element.dataset.panel)); $('close-panel').onclick = closePanel; $('save-button').onclick = () => save();
  $('overlay').addEventListener('pointerdown', event => { if (event.target === $('overlay')) closePanel(); });
  for (const element of document.querySelectorAll('[data-key]')) { element.addEventListener('pointerdown', event => { event.preventDefault(); element.setPointerCapture(event.pointerId); keys[element.dataset.key] = true; }); for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) element.addEventListener(eventName, () => { keys[element.dataset.key] = false; }); }
  $('touch-interact').onclick = interact; $('touch-attack').onclick = attack;
  $('import-file').addEventListener('change', async event => { const file = event.target.files[0]; if (!file) return; try { if (file.size > 2000000) throw new Error('Too large'); applySave(JSON.parse(await file.text())); save(true); closePanel(); notify('Adventure imported'); } catch { notify('That is not a valid island save', 'Your current progress is unchanged.'); } event.target.value = ''; });
  window.addEventListener('resize', resize); window.addEventListener('pagehide', () => save(true));
  state = freshState(); generate();
  let restored = false;
  try { const raw = localStorage.getItem(SAVE_KEY); if (raw) { const data = JSON.parse(raw); if (validSave(data)) { applySave(data); restored = true; } } } catch { }
  camera.x = state.player.x; camera.y = state.player.y; lastSave = Date.now(); resize(); updateHUD();
  setView(localStorage.getItem('lost-island-view3d') !== '0');
  if (!restored) { discover("Wanderer's Shore"); notify('You wake up where the ocean ends', 'WASD to move. E to gather. Escape for the field guide.'); }
  else notify('Welcome back, wanderer', `Day ${state.day}. Your island remembers.`);
  requestAnimationFrame(loop);
  window.LostIsland = { get state() { return state; }, get entities() { return entities; }, get caveEntities() { return caveEntities; }, get placing() { return placing; }, craft, buildAt, interact, attack, save, load, validSave, tileAt, blocked, openPanel, closePanel, updateProgress, step: dt => { if (!panel) update(Math.max(0, Math.min(.05, dt))); render(); } };
})();