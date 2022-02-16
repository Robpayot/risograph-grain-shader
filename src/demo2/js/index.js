// Managers
// import './managers/RAFManager'
// import './managers/ResizeManager'

// Scene
import Scene from './components/scene'

(() => {
  // scene
  const sceneEl = document.querySelector('[data-scene]')
  new Scene(sceneEl)
})()
