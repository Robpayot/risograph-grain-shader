import * as THREE from 'three'
import { randFloat } from 'three/src/math/MathUtils'

const SPHERE_GEO = new THREE.SphereGeometry(1, 32, 32)

export default class Sphere extends THREE.Object3D {
  constructor(material, scale, position) {
    super()

    const mesh = new THREE.Mesh(SPHERE_GEO, material)
    mesh.scale.set(scale, scale, scale)

    this.initY = position.y
    this.initX = position.x
    this.offsetY = randFloat(0, 100)
    this.invSpeed = randFloat(1000, 1500)
    this.coefX = randFloat(0.5, 1)

    this.position.copy(position)
    this.add(mesh)
  }

  render(now, mouse) {
    this.position.y = this.initY + Math.sin(now / this.invSpeed + this.offsetY) * 0.5 + mouse.y * 0.2
    this.position.x = this.initX + mouse.x * this.coefX
  }
}
