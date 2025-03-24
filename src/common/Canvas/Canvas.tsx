import { randomNumberFromRange } from '@utils/utils'
import React, { useEffect, useRef } from 'react'

export interface IProps {
  numbers?: number[]
}

const WIDTH = 310
const HEIGHT = 60
const FONT_SIZE = 32

export const Canvas: React.FC<IProps> = ({ numbers = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return
    }

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    ctx.font = `${FONT_SIZE}px sans-serif`
    ctx.fillStyle = 'black'

    for (const number of numbers) {
      const x = randomNumberFromRange(-1, 276) // full visibility range: -1 - 276
      const y = randomNumberFromRange(22, 60) // full visibility range: 22 - 60
      ctx.fillText(number.toString(), x, y)
    }
  }, [numbers])

  return <canvas ref={canvasRef} width={310} height={60} />
}
