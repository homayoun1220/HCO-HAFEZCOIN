/** Client-side demo challenges for practice mode (not recorded). */

function canvasToB64(canvas) {
  return canvas.toDataURL('image/png').split(',')[1]
}

function drawShape(ctx, seed) {
  const colors = ['#00d4aa', '#ff6b6b', '#6b9fff', '#ffaa00', '#cc66ff']
  ctx.fillStyle = '#12121a'
  ctx.fillRect(0, 0, 200, 200)

  for (let i = 0; i < 4; i++) {
    const color = colors[(seed + i) % colors.length]
    ctx.fillStyle = color
    const x = 30 + ((seed * 17 + i * 41) % 120)
    const y = 30 + ((seed * 23 + i * 37) % 120)
    const size = 25 + ((seed + i * 13) % 40)
    if (i % 3 === 0) {
      ctx.beginPath()
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
      ctx.fill()
    } else if (i % 3 === 1) {
      ctx.fillRect(x, y, size, size * 0.7)
    } else {
      ctx.beginPath()
      ctx.moveTo(x + size / 2, y)
      ctx.lineTo(x, y + size)
      ctx.lineTo(x + size, y + size)
      ctx.closePath()
      ctx.fill()
    }
  }
}

function makeImage(seed, noise = 0) {
  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 200
  const ctx = canvas.getContext('2d')
  drawShape(ctx, seed + noise)
  return canvasToB64(canvas)
}

export function practiceChallenge(family) {
  switch (family) {
    case 'perceptual': {
      const seed = Math.floor(Math.random() * 50)
      const correctIdx = Math.floor(Math.random() * 4)
      const options = Array.from({ length: 4 }, (_, i) =>
        i === correctIdx ? makeImage(seed, 0) : makeImage(seed + i + 1, 5),
      )
      return {
        original_b64: makeImage(seed, 0),
        options,
        correct_index: correctIdx,
        delta_resp: 60,
      }
    }
    case 'reasoning':
      return { sequence: [2, 4, 8, 16], correct_answer: 32, delta_resp: 60 }
    case 'attention':
      return {
        waypoints: [
          { x: 50, y: 200, t: 0 },
          { x: 200, y: 80, t: 2 },
          { x: 350, y: 200, t: 4 },
          { x: 200, y: 320, t: 6 },
        ],
        stop_time: 4,
        canvas_size: { w: 400, h: 400 },
        delta_resp: 60,
      }
    case 'biometric':
      return { phrase: 'blue tree seven', delta_resp: 60 }
    default:
      return {}
  }
}
