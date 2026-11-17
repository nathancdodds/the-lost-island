# The Lost Island

A complete, offline top-down survival adventure made with vanilla HTML, CSS,
JavaScript, and Canvas. All pixel art and sound are generated in code. No assets,
packages, game engines, accounts, subscriptions, or backend are needed.

## Run in VS Code

1. Select **File > Open Folder** and open `the-lost-island`.
2. Right-click `index.html` in the Explorer and choose **Reveal in Finder**.
3. Double-click `index.html` to open it in Chrome, Edge, Firefox, or Safari.

Alternatively, use VS Code's optional Live Server extension and select **Open
with Live Server**. A server is not required. Stay with the same browser and
URL when using local saves: file URLs and localhost have separate storage.

## Controls

| Control | Action |
| --- | --- |
| WASD or arrow keys | Move |
| Shift | Sprint (uses stamina) |
| E | Gather, search, enter caves, rest, or place a building |
| Space or click | Attack |
| I / C / M | Inventory / crafting / map |
| G / J | How-to guide / journal |
| V | Toggle 3D perspective and top-down view |
| 1-8 | Select equipment, consume supplies, or place quick-slot buildings |
| Escape | Pause, close menus, or cancel building placement |
| Click ground while building | Place within reach |

Touch devices have a directional pad and interaction/attack buttons, plus a bag
button for the inventory. The bottom bar also has quick **Bag** and **Guide**
buttons. The game opens in a 3D perspective view by default; press **V** or use
the pause menu to switch to a flat top-down view (your choice is remembered).

## Your Adventure

Gather wood, stone, fiber, and berries. Craft an axe and pickaxe to improve
resource yields. Build a campfire to heal nearby; build a shelter to set a
respawn point. Berries heal 12 health and replenish
20 stamina; bandages heal 40 health. Equipment applies automatically.
Trees, rocks, plants, and TNT blasts drop visible items nearby; press E next to
them to collect. Axes and pickaxes improve yields and have distinct swing effects.

Build a shelter or a sturdy **house** to set your home. You can only **sleep**
(resting until dawn, which restores health and stamina) at night; during the
day a shelter or house just sets your respawn point.

Craft a raft to sail across deep water automatically. You need it to cross the
open ocean to the three **far islands** — the Drowned Docks, Ashen Reach, and
Gull Rock — which cannot be reached on foot. Explore all six islands, search
the abandoned ruins, mine cave moonstone, and defeat the Hollow shrine's three
guardians. Search **broken-down places** — abandoned camps, ruined cabins,
supply caches, fallen watchtowers, and shipwrecks — for extra supplies.
Recover the relic in the main island's ruins, the relic inside
Moonstone Isle's cave, and the relic at the Hollow Wilds shrine. Bring them to
the main island's northern lighthouse with 12 wood, 10 stone, and 6 moonstone.
Restoring its light completes the story, but you can keep playing.

Moonstone Isle also has a broken runway. Repair it with 10 wood, 8 stone, and 4
fiber, then stand on the strip and select your Plane. Watch the takeoff sequence,
then steer through the sky with WASD; select the Plane again to land. You can
also build a runway from at least five tiles in a straight line.

Craft a Rocket (24 wood, 12 stone, 16 fiber, and 6 moonstone) and place it on
land, then press E to board and fly to the Moon. Craft a Spacesuit (8 wood, 12
fiber, and 4 moonstone) first: without one, your health drains on the lunar
surface until you die. With a suit, use the return rocket to fly back.

Moonstone Isle's cave contains the missing relic; the main island's cave
supplies moonstone but its altar is empty. Both caves use the same underground
layout and share resource depletion. Tools, raft, sword, and lantern are
permanent equipment. Fence, bridge, shelter, house, and campfire kits are
consumed when placed. Bridges can be placed in shallow water. Buildings cannot
overlap landmarks or resource nodes.

A full day takes eight real minutes. Resources and ordinary creatures return
after two in-game days. Shrine guardians stay defeated. Losing all health
returns you to your home the next morning without losing your inventory.

## Saves

Progress auto-saves every 30 seconds, when leaving the page, and after major
discoveries. The **Save** button saves immediately. The pause menu can load,
export a portable JSON backup, import a backup, or start a new adventure (with
confirmation). Use export if your browser blocks local storage. Saves belong
to the browser and URL, not to the HTML file itself. Clearing browser data or
starting a new adventure replaces local progress; export first to keep it.

All menus pause the world. Sound is optional and starts muted. The game has a
responsive desktop/mobile UI, keyboard focus handling, ten achievements, six
islands, and a day/night cycle with dynamic sun-cast shadows for a 2.5D feel.