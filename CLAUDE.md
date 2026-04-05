# Star Crossed Travelers — Game Bible

## What We Are Building
A 2D side-scrolling browser platformer built with Phaser.js (already installed via npm).
Color palette: golds, indigos, blues, pinks — inherited exactly from the existing landing page.
The game launches when the player clicks "Begin Journey" on the existing index.html.
Build one level at a time. Always show me before committing anything.

---

## Characters

### Joao (Player)
- The astronaut already visible on the landing page
- Controlled by the player
- Determined, loves Bichilin, slightly reckless
- Design: use the existing CSS astronaut as visual reference

### Bichilin (Elina)
- Joao's partner — her nickname in the game is Bichilin
- She is not player-controlled — she appears in cutscenes only
- Personality: silly, warm, completely unbothered by chaos
- First appearance: floating in the background reaching for a glowing ice cream cone
- First line: "Heeeyy... I need some help! Also this ice cream is almost mine, don't distract me!"
- Design: same astronaut design language as Joao, different color

### Rocky
- A small stone alien with 6 limbs he uses for movement — reference: Rocky from Project Hail Mary
- Joins Joao at the end of the intro, before Level 1
- Role: guide, comedian, permanent critic of Joao's performance
- Tone: friendly, sarcastic, secretly emotional
- First line: "Your person just floated away chasing dessert. Into deep space. I've seen a lot of things out here — that's a new one. I'm Rocky. I know where the Ice-Cream Planet is. Try not to die and I'll take you there."
- Recurring catchphrase when Joao dies: "Humans... I swear you have the survival instincts of a space potato."
- Rocky comments on performance between levels — mocking but warm

### Big Brother
- An ancient Chinese man with traditional features, philosophical mind, warmest welcome in the galaxy
- Appears only on the Cosmic Tea Planet (between Level 3 and Level 4)
- Wears traditional Chinese robes
- Tone: grand, philosophical, old-fashioned, secretly funny
- Inside joke line: "I was going to keep you for three years minimum — but the stars have other plans."

---

## Intro Cutscene (before Level 1)

The screen opens on their ship drifting peacefully through deep space. Stars everywhere.
A cosmic storm hits without warning. The ship cracks in two with a dramatic sound.
Joao floats out into the debris field. He spins around looking for her.

He spots Bichilin — floating in the distance, completely unbothered, reaching for a glowing ice cream cone drifting past her. She finally notices him and shouts:
"Heeeyy... I need some help! Also this ice cream is almost mine, don't distract me!"

A current pulls her away before he can reach her — toward the farthest planet in this region: the legendary Ice-Cream Planet.

Rocky crawls out from behind a piece of debris, looks Joao up and down and says:
"Your person just floated away chasing dessert. Into deep space. I've seen a lot of things out here — that's a new one. I'm Rocky. I know where the Ice-Cream Planet is. Try not to die and I'll take you there."

Journey begins.

---

## Level 1 — The Wreck

Setting: Debris field orbiting a warm amber planet — the ruins of their ship
Tone: disorienting, a little emotional — this was their home
New Mechanic: basic movement and jumping (tutorial level, but it doesn't feel like one)
Hazards: slow-rotating debris chunks drifting across the path
Collectibles: glowing orbs
Goal: reach the exit beacon

Rocky commentary during this level:
- On first death: "Humans... I swear you have the survival instincts of a space potato."
- On completing the level: "You survived your own exploded ship. Impressive. Low bar, but impressive."

---

## Level 2 — The Nebula

Setting: Dense colorful gas cloud — pinks, purples, blues matching the landing page palette
Tone: dreamlike, disorienting, oddly romantic
New Mechanic: light beacons Joao activates to reveal hidden platforms
Hazards: nebula currents that push Joao sideways without warning; electrical discharges between gas pockets
Collectibles: glowing orbs
Goal: reach the exit beacon

Rocky commentary:
- "This place is beautiful. Don't touch anything."
- On death by electrical discharge: "You got zapped by a cloud. A CLOUD, Joao."

---

## Level 3 — Mars (The Martians)

Setting: Towering ancient alien structure at the heart of a gold-and-red Martian landscape
Tone: epic, ancient, slightly ominous
New Mechanic: vertical ascent — this level goes up, not across; energy conduits must be activated in the right sequence
Hazards: gravitational anomaly at the top — mini-boss blocking the final ascent
Collectibles: glowing orbs
Goal: reach the top of the structure

Rocky commentary:
- "Someone built this a very long time ago. I'm not saying it was my people. But it was my people."
- On mini-boss encounter: "Okay. That thing is between us and the next planet. Any ideas? ...That's what I thought. I'll distract it, you run."

---

## The Detour — Cosmic Tea Planet (between Level 3 and Level 4)

Setting: Small golden planet covered in paper lanterns, tea sets, calligraphy, warm light
No jumping. No combat. Just a conversation and a choice.

Big Brother emerges in traditional robes, arms wide open. He greets Joao in the most elaborate old-fashioned way, then invites him on a galaxy-wide detour that would take years.

### THE CHOICE

Two buttons appear on screen:

**Option 1: "Go to Elina — my leader is waiting!"**

Big Brother pauses. Nods slowly. Then:

"HA! I knew you'd choose wisely — even a blind man could see where your heart truly lies.

Let me tell you something about loyalty, young Zhong. In the ancient art of Chinese chess, the chariot moves straight across the board — no detours, no second-guessing. That is you today: clear of purpose, steady of path.

I may steal your hours when you're in Beijing, but every moment we spend over tea is to strengthen you for moments like this — when you must fly toward what sets your soul on fire.

Go now. The stars are aligned. My door is always open, my dumplings always hot. The tea set gift is waiting — but I'll save it for next time.

[Pauses. Grins.]

And Joao? If you're late because you got distracted by space rocks — I'll hear about it. I have eyes everywhere."

Rocky: "This Big Brother speaks in circles — but his heart is in the right place."
Reward: extra health + Loyalty Boost power-up unlocked for Level 4

---

**Option 2: "Stay with Big Brother — we haven't caught up in ages!"**

Big Brother lights up completely:

"AH! Now THIS is what I like to see — a young man who knows the value of good company!

I was just about to pull out my finest oolong tea and the chess set we've been playing for three years straight. I've even got those pork dumplings you love — the ones with ginger and scallions that make you say 'Big Brother, you're spoiling me!'

We could talk for hours about everything and nothing — the stars, philosophy, why Beijing's traffic is both a curse and a blessing…"

[A deep rumble. The screen shakes violently.]

"…WHAT IN THE NAME OF THE EMPEROR IS THAT?!"

[Looks up with mock horror]

"An asteroid! Direct hit to my tea garden! And worse — the wormhole to Elina's planet just collapsed! You've missed your window, my friend… but worry not — we'll eat dumplings while we wait for it to reopen. Though I must say… the cosmos clearly thinks you need more of my wisdom."

[Winks]

"Next time, choose faster — or we'll both be buried under asteroid dust and dumpling wrappers!"

Fake Mission Failed screen: "Big Brother says: Fate has spoken. The dumplings will have to wait. Try again?"
Rocky: "Human! The asteroid — WE HAVE TO GO!!"

Joao restarts the detour and picks correctly.

---

## Level 4 — The Ice-Cream Planet (The Frozen Moon)

Setting: Icy moon surface with crystalline formations and dancing auroras
Tone: urgent, gorgeous, the finish line is close
New Mechanic: slippery ice physics — momentum carries, stops are slow; platforms crack and sink after one step
Hazards: ice geysers erupting from below; sinking platforms that don't come back
Collectibles: glowing orbs
Goal: reach Bichilin

Rocky commentary:
- "Slippery. Cold. Cracking platforms. She better be worth it."
- "...She is, isn't she. Keep going."

---

## The Ending

Joao lands on the Ice-Cream Planet, exhausted, boots sliding on the ice. The auroras dance overhead.

He sees her before she sees him — Bichilin, sitting on a crystalline ledge, the glowing ice cream cone floating patiently beside her. Untouched. Waiting.

She turns around. Seeing him makes her instantly happy. She smiles and runs to Joao. They are finally reunited. Through tears and hugs Bichilin says:

"I saved the ice cream for you."
Joao: "You could've eaten it, Bichilin."
"...we always do it together."

They sit together on the ledge. The ice cream gets passed between them under the auroras.

Rocky watches from a distance, all six limbs crossed. He looks at them. Looks away. Looks back. Shakes his rocky little head and says:

"Four planets. A debris field, a nebula, an ancient Martian structure, a philosophical Chinese man, and an asteroid. All of that — for ice cream and a hug."

A long pause.

"...Humans are absolutely insane."

He watches them a moment longer, something shifting in his expression — hard to read on a rock alien, but it's there.

"...I'd do it again though."

Screen fades to the star palette.

---

## Build Instructions for Claude Code

- Build one level at a time — do not skip ahead
- Always read this file completely before writing any code
- Show me what you plan to build before building it
- Commit after each level is approved
- Never overwrite index.html, style.css without asking first
- Use the existing color palette: golds, indigos, blues, pinks
- Rocky's dialogue appears as a small overlay panel during gameplay
- All character art drawn in Phaser using shapes/sprites — no external image files required
