const { read, write, position } = require('promise-path')
const cheerio = require('cheerio')

const here = position(__dirname)
const inputpath = here('../mainui/src/models/visual/regions.inkscape.svg')
const outputpath = here('../modpacks/mkv25/official/regions.json')

function sn (num) {
  return Number.parseFloat(num.toFixed(3))
}

async function run () {
  const svg = await read(inputpath)
  const $svg = cheerio.load(svg)
  const rects = $svg('rect').toArray().map(el => {
    const $el = $svg(el)
    return {
      id: $el.attr('id'),
      label: $svg(el, 'title').text().trim(),
      x: Number.parseFloat($el.attr('x')),
      y: Number.parseFloat($el.attr('y')),
      width: Number.parseFloat($el.attr('width')),
      height: Number.parseFloat($el.attr('height')),
      color: $el.attr('fill')
    }
  })
  const left = Math.min(...rects.map(r => r.x))
  const right = Math.max(...rects.map(r => r.x + r.width))
  const top = Math.min(...rects.map(r => r.y))
  const bottom = Math.max(...rects.map(r => r.y + r.height))
  const boundary = {
    x: left,
    y: top,
    width: right,
    height: bottom
  }
  const regions = rects.map(rect => {
    const { x, y, width, height, color, label, id } = rect
    return {
      id,
      label,
      color,
      density: {
        lower: sn(x / boundary.width),
        upper: sn((x + width) / boundary.width)
      },
      mass: {
        lower: sn(y / boundary.height),
        upper: sn((y + height) / boundary.height)
      }
    }
  })
  const info = {
    source: inputpath,
    svg: svg.length + ' bytes',
    boundary,
    rects,
    regions
  }
  await write(outputpath, JSON.stringify(info.regions, null, 2))
}

run()
