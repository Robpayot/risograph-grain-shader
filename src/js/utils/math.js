export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function randomFloat(min, max) {
  return Math.random() * (max - min) + min
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function toRadian(degrees) {
  return degrees * Math.PI / 180
}

export function oscillateBetween(time, min, max, frequence = 1, offset = 0) {
  const amplitude = max - min
  const average = amplitude / 2 + min
  return Math.sin(time * frequence + offset) * amplitude / 2 + average
}
