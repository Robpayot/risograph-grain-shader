import * as THREE from 'three'

const BOX_GEO = new THREE.BoxGeometry(1, 1, 1)
BOX_GEO.translate(0, 0.5, 0)

export default class Cylinder extends THREE.Object3D {
  constructor(material, scale, position) {
    super()

    const mesh = new THREE.Mesh(BOX_GEO, material)
    mesh.scale.set(1, scale, 1)

    this.position.copy(position)
    this.add(mesh)
  }
}
