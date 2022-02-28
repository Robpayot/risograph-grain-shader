import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import wolf from '../../models/wolf.obj'
import glsl from 'glslify'
import fragmentShaderLambert from '../shaders/grain.frag'
import Sphere from './sphere'
import { degToRad, lerp, randFloat } from 'three/src/math/MathUtils'
import Box from './box'
import { GUI } from 'dat.gui'

export default class Scene {
  canvas
  renderer
  scene
  camera
  controls
  width
  height
  mouse = {
    x: 0,
    y: 0,
  }
  targetMouse = {
    x: 0,
    y: 0,
  }
  guiController = {
    uNoiseCoef: 2.1,
    uNoiseMin: 0.5,
    uNoiseMax: 22.09,
    uNoiseScale: 0.8,
    light1X: 10,
    light2X: 10,
  }

  constructor(el) {
    this.canvas = el

    this.init()
  }

  init() {
    this.setScene()
    this.setRender()
    this.setCamera()
    this.setControls()
    this.setContainer()
    this.setLight()
    this.setMaterial()
    this.setSpheres()
    this.setBoxs()
    this.setModel()
    this.setGUI()

    this.handleResize()

    // start RAF
    this.events()
  }

  /**
   * Our Webgl renderer, an object that will draw everything in our canvas
   * https://threejs.org/docs/?q=rend#api/en/renderers/WebGLRenderer
   */
  setRender() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    })
  }

  /**
   * This is our scene, we'll add any object
   * https://threejs.org/docs/?q=scene#api/en/scenes/Scene
   */
  setScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xffffff)
    this.scene.background = new THREE.TextureLoader().load('demo2/img/grey-gradient2.png')
  }

  /**
   * Our Perspective camera, this is the point of view that we'll have
   * of our scene.
   * A perscpective camera is mimicing the human eyes so something far we'll
   * look smaller than something close
   * https://threejs.org/docs/?q=pers#api/en/cameras/PerspectiveCamera
   */
  setCamera() {
    const aspectRatio = this.width / this.height
    const fieldOfView = 50
    const nearPlane = 0.1
    const farPlane = 10000

    this.camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
    this.camera.position.set(4, 1.5, 5.5)

    this.scene.add(this.camera)
  }

  /**
   * Threejs controls to have controls on our scene
   * https://threejs.org/docs/?q=orbi#examples/en/controls/OrbitControls
   */
  setControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.autoRotate = true
  }

  /**
   * For the GUI at the top right bottom of the screen
   */
  setGUI() {
    const gui = new GUI()

    const grainFolder = gui.addFolder('Grain')
    grainFolder
      .add(this.guiController, 'uNoiseCoef', 0, 20)
      .step(0.1)
      .onChange(this.guiChange)
    grainFolder
      .add(this.guiController, 'uNoiseMin', 0, 1)
      .step(0.1)
      .onChange(this.guiChange)
    grainFolder
      .add(this.guiController, 'uNoiseMax', 0, 22)
      .step(0.1)
      .onChange(this.guiChange)
    grainFolder
      .add(this.guiController, 'uNoiseScale', 0, 6)
      .step(0.1)
      .onChange(this.guiChange)
    grainFolder.open()
  }

  /**
   * GUI handle functions
   */
  guiChange = () => {
    this.uniforms.uNoiseCoef.value = this.guiController.uNoiseCoef
    this.uniforms.uNoiseMin.value = this.guiController.uNoiseMin
    this.uniforms.uNoiseMax.value = this.guiController.uNoiseMax
    this.uniforms.uNoiseScale.value = this.guiController.uNoiseScale
  }

  /**
   * Here will set our main Risopgrah grain material
   * https://threejs.org/docs/?q=ShaderMaterial#api/en/materials/ShaderMaterial
   */
  setMaterial() {
    this.uniforms = THREE.UniformsUtils.merge([
      THREE.ShaderLib.lambert.uniforms,
      {
        uNoiseMin: {
          value: this.guiController.uNoiseMin,
        },
      },
      {
        uNoiseCoef: {
          value: this.guiController.uNoiseCoef,
        },
      },
      {
        uNoiseMax: {
          value: this.guiController.uNoiseMax,
        },
      },
      {
        uNoiseScale: {
          value: this.guiController.uNoiseScale,
        },
      },
    ])

    this.customMaterial = new THREE.ShaderMaterial({
      vertexShader: THREE.ShaderLib.lambert.vertexShader,
      fragmentShader: glsl(fragmentShaderLambert),
      uniforms: this.uniforms,
      lights: true,
      transparent: true,
    })
  }

  /**
   * This is our global container that will contain every mesh of our scene
   * https://threejs.org/docs/#api/en/core/Object3D
   */
  setContainer() {
    this.container = new THREE.Object3D()
    this.scene.add(this.container)
  }

  setLight() {
    this.lights = []

    for (let i = 0; i < 2; i++) {
      const spotLight = new THREE.SpotLight(0xffffff)
      spotLight.position.set(10, 10, 10)
      spotLight.intensity = 1.1
      this.lights.push(spotLight)
      this.scene.add(spotLight)
    }
  }

  setBoxs() {
    const dist = 6

    let angle = 0

    for (let i = 0; i < 5; i++) {
      const position = new THREE.Vector3(Math.cos(angle) * dist, -2, Math.sin(angle) * dist)
      const scale = randFloat(1, 3)
      const object3D = new Box(this.customMaterial, scale, position)

      angle += degToRad(360 / 5)
      this.container.add(object3D)
    }
  }

  setSpheres() {
    const dist = 3

    this.spheres = []

    let angle = 0

    for (let i = 0; i < 3; i++) {
      const position = new THREE.Vector3(Math.cos(angle) * dist, randFloat(-1, 1), Math.sin(angle) * dist)
      const scale = randFloat(0.6, 0.9)
      const object3D = new Sphere(this.customMaterial, scale, position)

      angle += degToRad(360 / 3)
      this.scene.add(object3D)
      this.spheres.push(object3D)
    }
  }

  setModel() {
    const objLoader = new OBJLoader()

    objLoader.load(wolf, obj => {
      const { geometry } = obj.children[0]
      const mesh = new THREE.Mesh(geometry, this.customMaterial)
      const s = 0.0035
      mesh.scale.set(s, s, s)
      mesh.rotation.y += degToRad(-90)
      mesh.translateY(-2)
      // mesh.position.z -= 5
      this.container.add(mesh)

      this.model = mesh
    })
  }

  /**
   * List of events
   */
  events() {
    window.addEventListener('resize', this.handleResize, { passive: true })
    window.addEventListener('mousemove', this.handleMousemove, { passive: true })
    this.draw(0)
  }

  // EVENTS

  /**
   * Request animation frame function
   * This function is called 60/time per seconds with no performance issue
   * Everything that happens in the scene is drawed here
   * @param {Number} now
   */
  draw = now => {
    // now: time in ms

    this.mouse.x = lerp(this.mouse.x, this.targetMouse.x, 0.1)
    this.mouse.y = lerp(this.mouse.y, this.targetMouse.y, 0.1)

    for (let i = 0; i < this.spheres.length; i++) {
      this.spheres[i].render(now, this.mouse)
    }

    this.container.rotation.y = degToRad(20 * this.mouse.x)

    this.renderer.render(this.scene, this.camera)

    this.raf = window.requestAnimationFrame(this.draw)
  }

  // EVENTS
  handleMousemove = e => {
    const x = (e.clientX / window.innerWidth) * 2 - 1
    const y = -(e.clientY / window.innerHeight) * 2 + 1

    this.targetMouse.x = x
    this.targetMouse.y = y
  }

  /**
   * On resize, we need to adapt our camera based
   * on the new window width and height and the renderer
   */
  handleResize = () => {
    this.width = window.innerWidth
    this.height = window.innerHeight

    // Update camera
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()

    const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1

    this.renderer.setPixelRatio(DPR)
    this.renderer.setSize(this.width, this.height)
  }
}
