# Edelweiss

**Open source webGL game made with three.js**

**Play online here : https://felixmariotto.itch.io/edelweiss**

![Screenshot of Edelweiss](https://edelweiss-game.s3.eu-west-3.amazonaws.com/assets/teaser1.gif)
![Screenshot of Edelweiss](https://edelweiss-game.s3.eu-west-3.amazonaws.com/assets/teaser2.gif)


# How it works

**Custom physics engine**
The game works with a simplistic physics engine based on axis-aligned bounding box collision detection. All the physic objects in this game are either boxes or axis-aligned square tiles. [Find the code here.](https://github.com/felixmariotto/Edelweiss/blob/master/public/js/controler.js)

**Custom map editor**
The information about the physical map is contained in an JSON called sceneGraph that the game loads on statup. I created this file using a custom map editor, that I coding for the sole purpose of making this game. [You can find the code here in a separate repository.](https://github.com/felixmariotto/Edelweiss-Editor)

**Manual camera positioning**
Moving the camera to support a 3D platformer game is a challenge, that I had to face on my own since I used a custom physics engine. [You can find the code here.](https://github.com/felixmariotto/Edelweiss/blob/master/public/js/CameraControl.js)

**Automatic optimization**
The game is playable from mid-range mobile to high-range desktop. To support this adaptability, the game adapt itself to the device capability at runtime. [Find the code here](https://github.com/felixmariotto/Edelweiss/blob/master/public/js/Optimizer.js)

**Runtime assets loading**
This game is light, but I still wanted to optimize loading time by loading map tiles at runtime. [Find the code here](https://github.com/felixmariotto/Edelweiss/blob/master/public/js/MapManager.js)

# More open source games

Check out my previous game [The Temple of Doom](https://github.com/felixmariotto/Temple_Of_Doom)

Follow me on Github or Itch.io for more upcoming games
