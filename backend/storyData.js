// Expanded storyData.js with more complex branching and scenarios

const storyScenes = {
  "start": {
    id: "start",
    text: "You awaken at a crossroads deep within a foreboding wood. Paths lead North to a lonely cabin, South to a roaring river, and East into a mist-laden forest.",
    image: "https://cdn.pixabay.com/photo/2018/01/20/17/11/tree-3094982_640.jpg",
    choices: [
      { text: "North: Approach the cabin", next: "cabin" },
      { text: "South: Follow the riverbank", next: "river" },
      { text: "East: Venture into the forest", next: "forest" }
    ],
    checkpoint: true
  },

  "cabin": {
    id: "cabin",
    text: "Night settles as you near the cabin’s warm glow. Inside, a sword rests beside a wounded merchant pleading for aid.",
    image: "https://cdn.pixabay.com/photo/2016/02/19/10/00/fantasy-1208280_640.jpg",
    choices: [
      { text: "Help the merchant", next: "merchant_help", action: "HELP_MERCHANT" },
      { text: "Take the sword and leave him", next: "armed_departure", action: "TAKE_SWORD" },
      { text: "Ignore both and flee", next: "forest_edge" }
    ],
    checkpoint: false
  },

  "merchant_help": {
    id: "merchant_help",
    text: "You bandage the merchant’s wounds. In gratitude, he gives you a tattered map and warns of a dragon to the North.",
    image: "https://cdn.pixabay.com/photo/2015/07/27/21/58/market-863605_640.jpg",
    choices: [
      { text: "Thank him and go North", next: "dragon" },
      { text: "Head East into forest", next: "forest" }
    ],
    checkpoint: true
  },

  "armed_departure": {
    id: "armed_departure",
    text: "You seize the sword. The merchant’s last plea echoes as you step outside.",
    image: "https://cdn.pixabay.com/photo/2017/03/05/20/08/sword-2128271_640.jpg",
    choices: [
      { text: "Proceed North", next: "dragon" },
      { text: "Return East to forest", next: "forest" }
    ],
    checkpoint: true
  },

  "river": {
    id: "river",
    text: "The river roars. A broken raft drifts nearby. The current looks deadly.",
    image: "https://cdn.pixabay.com/photo/2015/08/31/11/59/water-915106_640.jpg",
    choices: [
      { text: "Repair the raft and cross", next: "raft_cross" },
      { text: "Swim across", next: "river_death" }
    ]
  },

  "raft_cross": {
    id: "raft_cross",
    text: "Your makeshift raft holds. Mid-river, a hidden whirlpool appears ahead.",
    choices: [
      { text: "Steer around it", next: "island" },
      { text: "Brace and ride through", next: "river_death" }
    ],
    checkpoint: true
  },

  "island": {
    id: "island",
    text: "You wash ashore on a misty island. A cave entrance yawns in the cliffside.",
    image: "https://cdn.pixabay.com/photo/2014/10/17/15/09/island-492929_640.jpg",
    choices: [
      { text: "Enter the cave", next: "cave_entrance" },
      { text: "Rest on the beach", next: "beach_trap" }
    ],
    checkpoint: false
  },

  "beach_trap": {
    id: "beach_trap",
    text: "The sand shifts beneath you—quick! You sink and cannot escape.",
    death: true
  },

  "cave_entrance": {
    id: "cave_entrance",
    text: "Inside, glyphs surround a locked door with a riddle inscribed. A faint glow pulses behind it.",
    image: "https://cdn.pixabay.com/photo/2017/01/21/14/14/cave-1993648_640.jpg",
    choices: [
      { text: "Solve the riddle", next: "riddle" },
      { text: "Force the door open", next: "cave_death" }
    ]
  },

  "riddle": {
    id: "riddle",
    text: "\"I speak without a mouth and hear without ears. I have nobody, but I come alive with wind. What am I?\"",
    choices: [
      { text: "Answer: Echo", next: "riddle_success", action: "SOLVED_RIDDLE" },
      { text: "Unsure—attempt to open anyway", next: "cave_death" }
    ]
  },

  "riddle_success": {
    id: "riddle_success",
    text: "The door hums open, revealing a hidden armory with a gleaming sword and a mysterious gem.",
    image: "https://cdn.pixabay.com/photo/2017/03/27/14/56/sword-2178866_640.jpg",
    choices: [
      { text: "Take both items", next: "dragon" , action: "TAKE_SWORD" },
      { text: "Only take the gem", next: "dragon", action: "TAKE_GEM" }
    ],
    checkpoint: true
  },

  "forest": {
    id: "forest",
    text: "The mist swirls. You stumble upon a hermit offering a lesson—for a price.",
    image: "https://cdn.pixabay.com/photo/2015/01/19/13/51/forest-604777_640.jpg",
    choices: [
      { text: "Pay 1 token of kindness", next: "hermit_lesson", action: "HELP_HERMIT" },
      { text: "Ignore him and push on", next: "forest_edge" }
    ],
    checkpoint: false
  },

  "hermit_lesson": {
    id: "hermit_lesson",
    text: "He whispers secrets of the dragon’s weakness. You feel more confident.",
    choices: [
      { text: "Head North to face the dragon", next: "dragon", action: "LEARNED_WEAKNESS" },
      { text: "Retreat to cabin path", next: "cabin" }
    ],
    checkpoint: true
  },

  "forest_edge": {
    id: "forest_edge",
    text: "You emerge back at the crossroads in a clearing, world unchanged but you are weary.",
    choices: [
      { text: "Go North to cabin", next: "cabin" },
      { text: "Go South to river", next: "river" }
    ]
  },

  "dragon": {
    id: "dragon",
    text: "",
    image: "https://cdn.pixabay.com/photo/2017/02/01/16/50/fantasy-2038033_640.jpg",
    choices: []
  },

  "dragon_victory": {
    id: "dragon_victory",
    text: "Armed with knowledge, sword, or gem, you exploit the dragon’s weakness. Victory is yours!",    
    ending: true
  },

  "dragon_death": {
    id: "dragon_death",
    text: "Despite courage, you couldn’t withstand the dragon’s fury.",
    death: true
  },

  "cave_death": {
    id: "cave_death",
    text: "A trap springs, and the cave collapses on you.",
    death: true
  },

  "river_death": {
    id: "river_death",
    text: "The current drags you under.",
    death: true
  }
};

function getStartSceneId() {
  return "start";
}

function getSceneById(id, memory = []) {
  const raw = storyScenes[id];
  if (!raw) return null;
  const scene = { ...raw };

  // Cabin actions
  if (id === "cabin") return scene;

  // Merchant help or not
  if (id === "merchant_help") return scene;

  // Riddle success grants flags
  if (id === "riddle_success") return scene;

  // Dragon dynamic logic
  if (id === "dragon") {
    const hasSword = memory.includes("HAS_SWORD");
    const helpedHermit = memory.includes("LEARNED_WEAKNESS");
    const hasGem = memory.includes("TAKE_GEM");
    const helpedMerchant = memory.includes("HELP_MERCHANT");

    if ((hasSword && helpedHermit) || hasGem || helpedMerchant) {
      scene.text = "The dragon roars, but your preparations and aid received make it vulnerable. It's time to strike!";
      scene.choices = [
        { text: "Launch a direct attack", next: "dragon_victory" }
      ];
    } else if (hasSword) {
      scene.text = "Brandishing your sword, you face the beast alone. The fight will be brutal."
      scene.choices = [
        { text: "Fight bravely", next: "dragon_victory" },
        { text: "Retreat", next: "dragon_death" }
      ];
    } else {
      scene.text = "Unarmed and unprepared, the dragon’s flames engulf you instantly.";
      scene.choices = [{ text: "Accept fate", next: "dragon_death" }];
    }
  }

  return scene;
}

module.exports = { getStartSceneId, getSceneById, storyScenes };
