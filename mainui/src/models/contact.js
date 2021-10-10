import createGalaxy from './galaxy'

function createDefault () {
  const lastUpdated = new Date()
  return {
    lastUpdated,
    name: 'Unknown Contact',
    galaxy: createGalaxy()
  }
}

function create (source) {
  return Object.assign(createDefault(), source || {})
}

export default create
