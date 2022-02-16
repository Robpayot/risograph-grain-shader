import * as THREE from 'three'

const CYLINDER_GEO = new THREE.CylinderGeometry(0.2, 0.2, 1, 32)
CYLINDER_GEO.translate(0, 0.5, 0)

export default class Cylinder extends THREE.Object3D {
  constructor(material, scale, position) {
    super()

    const mesh = new THREE.Mesh(CYLINDER_GEO, material)
    mesh.scale.set(1, scale, 1)

    this.position.copy(position)
    this.add(mesh)
  }
}
