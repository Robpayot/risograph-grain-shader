import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import deer from '../../models/deer.obj'
import glsl from 'glslify'
import vertexShader from '../shaders/grain.vert'
import fragmentShader from '../shaders/grain.frag'
import Sphere from './sphere'
import { degToRad, lerp, randFloat } from 'three/src/math/MathUtils'
import Cylinder from './cylinder'
import { GUI } from 'dat.gui'

// const ASSETS = 'img/'

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
    uLightIntensity: 1,
    uNoiseCoef: 3.3,
    uNoiseMin: 0.76,
    uNoiseMax: 4,
    uAlpha: false,
    light1X: 0.7,
    light2X: 8,
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
    // this.setAxesHelper()
    this.setMaterial()
    // this.setSphere()
    this.setSpheres()
    this.setCylinders()
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
    this.scene.background = new THREE.TextureLoader().load('demo1/img/grey-gradient.jpg')
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
    this.camera.position.y = 1.5
    this.camera.position.x = 4
    this.camera.position.z = 5.5
    // this.camera.lookAt(0, 0, 0)

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

  setContainer() {
    this.container = new THREE.Object3D()
    this.scene.add(this.container)
  }

  /**
   * Axes Helper
   * https://threejs.org/docs/?q=Axesh#api/en/helpers/AxesHelper
   */
  setAxesHelper() {
    const axesHelper = new THREE.AxesHelper(3)
    this.scene.add(axesHelper)
  }

  setGUI() {
    const gui = new GUI()

    const lightsFolder = gui.addFolder('Lights position X')
    lightsFolder
      .add(this.guiController, 'light1X', -10, 10)
      .step(0.1)
      .onChange(this.guiChange)
    lightsFolder
      .add(this.guiController, 'light2X', -10, 10)
      .step(0.1)
      .onChange(this.guiChange)
    lightsFolder.open()

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
      .add(this.guiController, 'uNoiseMax', 0, 5)
      .step(0.1)
      .onChange(this.guiChange)
    grainFolder.open()
  }

  guiChange = () => {
    this.uniforms.uNoiseCoef.value = this.guiController.uNoiseCoef
    this.uniforms.uNoiseMin.value = this.guiController.uNoiseMin
    this.uniforms.uNoiseMax.value = this.guiController.uNoiseMax

    this.uniforms.uLightPos.value[0].x = this.guiController.light1X
    this.uniforms.uLightPos.value[1].x = this.guiController.light2X
  }

  setMaterial() {
    this.currentColor = { r: 116, g: 156, b: 255 }
    this.uniforms = {
      uLightPos: {
        value: [new THREE.Vector3(0, 3, 1), new THREE.Vector3(10, 3, 1), new THREE.Vector3(0, 10, 10)], // array of vec3
      },
      uLightColor: {
        value: [new THREE.Color(0x555555), new THREE.Color(0x555555), new THREE.Color(0x555555)], // color
      },
      uLightIntensity: {
        value: this.guiController.uLightIntensity,
      },
      uNoiseCoef: {
        value: this.guiController.uNoiseCoef,
      },
      uNoiseMin: {
        value: this.guiController.uNoiseMin,
      },
      uNoiseMax: {
        value: this.guiController.uNoiseMax,
      },
      uBgColor: {
        value: new THREE.Color(this.currentColor.r / 255, this.currentColor.g / 255, this.currentColor.b / 255),
      },
      uColor: {
        value: new THREE.Color(0x555555),
      },
      uAlpha: {
        value: this.guiController.uAlpha,
      },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth / 40, window.innerHeight / 40),
      },
    }

    this.customMaterial = new THREE.RawShaderMaterial({
      vertexShader: glsl(vertexShader),
      fragmentShader: glsl(fragmentShader),
      uniforms: this.uniforms,
    })

    this.grainMaterial = this.customMaterial
  }

  setCylinders() {
    const dist = 6

    let angle = 0

    for (let i = 0; i < 5; i++) {
      const position = new THREE.Vector3(Math.cos(angle) * dist, -2, Math.sin(angle) * dist)
      const scale = randFloat(1, 3)
      const object3D = new Cylinder(this.grainMaterial, scale, position)

      angle += degToRad(360 / 5)
      this.container.add(object3D)
    }
  }

  setSpheres() {
    const dist = 3

    this.spheres = []

    let angle = 0

    for (let i = 0; i < 5; i++) {
      const position = new THREE.Vector3(Math.cos(angle) * dist, randFloat(-1, 1), Math.sin(angle) * dist)
      const scale = randFloat(0.3, 0.6)
      const object3D = new Sphere(this.grainMaterial, scale, position)

      angle += degToRad(360 / 5)
      this.scene.add(object3D)
      this.spheres.push(object3D)
    }
  }

  setSphere() {
    const geometry = new THREE.SphereGeometry(1, 32, 32)

    const mesh = new THREE.Mesh(geometry, this.grainMaterial)
    this.scene.add(mesh)
  }

  setModel() {
    const objLoader = new OBJLoader()

    objLoader.load(deer, obj => {
      const { geometry } = obj.children[0]
      const mesh = new THREE.Mesh(geometry, this.grainMaterial)
      const s = 0.0025
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

    // if (this.controls) this.controls.update() // for damping
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
