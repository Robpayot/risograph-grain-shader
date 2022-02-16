import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import deer from '../../models/deer.obj'
import glsl from 'glslify'
import vertexShaderPhong from '~shaders/lightgrain.vert'
import fragmentShaderPhong from '~shaders/lightgrain.frag'
import vertexShader from '~shaders/grain.vert'
import fragmentShader from '~shaders/grain.frag'
import Sphere from './sphere'
import { degToRad, lerp, randFloat } from 'three/src/math/MathUtils'

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
    uLightIntensity: 1.2,
    uNoiseCoef: 3.3,
    uNoiseMin: 0.76,
    uNoiseMax: 22.09,
    uAlpha: false,
    uFract: 2.0,
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
    // this.setAxesHelper()
    this.setMaterial()
    this.setLight()
    // this.setSphere()
    this.setSpheres()
    this.setModel()

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
    this.camera.position.x = 0
    this.camera.position.z = 7
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

  /**
   * Axes Helper
   * https://threejs.org/docs/?q=Axesh#api/en/helpers/AxesHelper
   */
  setAxesHelper() {
    const axesHelper = new THREE.AxesHelper(3)
    this.scene.add(axesHelper)
  }

  setMaterial() {
    this.currentColor = { r: 116, g: 156, b: 255 }
    this.uniforms = {
      uLightPos: {
        value: [new THREE.Vector3(0, 5, 1), new THREE.Vector3(10, 5, 1), new THREE.Vector3(0, 10, 5)], // array of vec3
      },
      uLightColor: {
        value: [new THREE.Color(0xffffff), new THREE.Color(0xffffff), new THREE.Color(0xffffff)], // color
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

    // const customUniforms = THREE.UniformsUtils.merge([THREE.ShaderLib.phong.uniforms])
    const customUniforms = THREE.UniformsUtils.merge([
      THREE.ShaderLib.phong.uniforms,
      { diffuse: { value: new THREE.Color(0xff0000) } },
      { time: { value: 0.0 } },
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
        uResolution: {
          value: new THREE.Vector2(window.innerWidth / 40, window.innerHeight / 40),
        },
      },
    ])

    this.customPhongMaterial = new THREE.ShaderMaterial({
      vertexShader: glsl(vertexShaderPhong),
      fragmentShader: glsl(fragmentShaderPhong),
      uniforms: customUniforms,
      lights: true,
      // name: 'custom-material',
    })

    this.customMaterial = new THREE.RawShaderMaterial({
      vertexShader: glsl(vertexShader),
      fragmentShader: glsl(fragmentShader),
      uniforms: this.uniforms,
    })
    // this.grainMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff })
    // this.grainMaterial.onBeforeCompile = shader => {
    //   console.log(shader.vertexShader)

    //   // shader.fragmentShader.replace()
    // }

    this.grainMaterial = this.customMaterial
  }

  setLight() {
    const spotLight = new THREE.SpotLight(0xff0000)
    spotLight.position.set(10, 10, 10)
    spotLight.intensity = 2
    this.scene.add(spotLight)
  }

  setSpheres() {
    const dist = 3
    const positions = [
      new THREE.Vector3(-dist, randFloat(0, 2), dist),
      new THREE.Vector3(dist, randFloat(0, 2), dist),
      new THREE.Vector3(-dist, randFloat(0, 2), -dist),
      new THREE.Vector3(dist, randFloat(0, 2), -dist),
    ]
    this.spheres = []

    for (let i = 0; i < 4; i++) {
      const scale = randFloat(0.3, 0.6)
      const object3D = new Sphere(this.grainMaterial, scale, positions[i])
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
      this.scene.add(mesh)

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

    if (this.model) {
      this.model.rotation.y = degToRad(-90 + 20 * this.mouse.x)
    }

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
