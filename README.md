# Risograph grain effect in Three.js

Learn two ways of applying a creative grain effect to 3D elements in Three.js.

![Image Title](https://tympanus.net/codrops/wp-content/uploads/2022/03/RisographGrain_fea.jpg)

[Article on Codrops](https://tympanus.net/codrops/?p=58657)

[Demo 1](http://tympanus.net/Tutorials/RisographGrainShader/)

[Demo 2](http://tympanus.net/Tutorials/RisographGrainShader/index2.html)

The demos show two ways of creating a risograph 2D grain effect reacting to light reflection on 3D objects using Three.js. The first way is using a custom shader (fragment and vertex). The second way is reusing the MeshLambertMaterial shader and applies 2D grain effect on the fragment shader, it's also using a transparent effect.


## Installation

Install dependencies:

```
npm install
```

Compile the code for development and start a local server:

```
npm run start
```

Create the build:

```
npm run build
```

## Credits

- Some part of shaders comes from [webglfundamentals](https://webglfundamentals.org/webgl/lessons/webgl-3d-lighting-point.html)

## Misc

Follow *Robin Payot*: [Twitter](https://twitter.com/RobinPayot), [GitHub](https://github.com/Robpayot)

Follow Codrops: [Twitter](http://www.twitter.com/codrops), [Facebook](http://www.facebook.com/codrops), [GitHub](https://github.com/codrops), [Instagram](https://www.instagram.com/codropsss/)

## License
[MIT](LICENSE)

Made with :blue_heart: by [Codrops](http://www.codrops.com)
