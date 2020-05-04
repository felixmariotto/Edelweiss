# Edelweiss

Open source webGL game made with three.js

## Play online here : http://edelweiss.32x.io

![Screenshot of Edelweiss](https://felixmariotto.s3.eu-west-3.amazonaws.com/new_teaser_github1.gif)

# How it works

**Custom physics engine**    
The game works with a simplistic physics engine based on axis-aligned bounding box collision detection. All the physic objects in this game are either boxes or axis-aligned square tiles. [Find the code here.](https://github.com/felixmariotto/Edelweiss/blob/master/public/js/controler.js)

**Custom map editor**    
The information about the physical map is contained in an JSON called sceneGraph that the game loads on statup. I created this file using a custom map editor, that I coding for the sole purpose of making this game. [Find the code here in a separate repository.](https://github.com/felixmariotto/Edelweiss-Editor)

**Manual camera positioning**    
Moving the camera to support a 3D platformer game is a challenge, that I had to face on my own since I used a custom physics engine. [Find the code here.](https://github.com/felixmariotto/Edelweiss/blob/master/public/js/CameraControl.js)

**Automatic optimization**    
The game is playable from mid-range mobile to high-range desktop. To support this adaptability, the game adapt itself to the device capability at runtime. [Find the code here](https://github.com/felixmariotto/Edelweiss/blob/master/public/js/Optimizer.js)

**Runtime assets loading**    
This game is light, but I still wanted to optimize loading time by loading map tiles at runtime. [Find the code here](https://github.com/felixmariotto/Edelweiss/blob/master/public/js/MapManager.js)

# More open source games

Check out my previous game [The Temple of Doom](https://github.com/felixmariotto/Temple_Of_Doom)

Follow me on Github or Itch.io for more upcoming games

# Contributing

If you fancy extending the game, I'm up to merge your work, as I already did with Makc multiplayer and debug mods.

If you feel more like correcting a few bugs here and there, here is a wishlist :
- fix hero climb-down-right animation
- if the player dies, got the first edelweiss, but didn't save their progress yet, respawn them in front of the first cave instead of the starting point of the game
- add movement sounds (climbing, footstep...)
- add powerup sounds
- add tweening for the reduction of the stamina bar
- add dust animation when player fall because of a fall-tile
- fix issue of joystick position with Galaxy S9+ (chrome for android)

# Big thanks to [Makc](https://github.com/makc) for contributing !

He made :
- The multiplayer feature
- The debug and live-map-editing features, that you can access by typing these commands into your browser's console while playing the game :
```javascript
atlas.debug() // show the physical assets used for collision while you play, and UI for editing the map
atlas.player.showHelpers() // show a helper for the player's direction
controler.permissions.airborne // cheat code for flying freely with the glider
```

You can find his fork here : https://github.com/makc/Edelweiss
