import { useCallback } from 'react'

export const useAverageLogoColor = () => {
  interface RGBColor {
    r: number
    g: number
    b: number
  }

  interface TokenColorOverride {
    token: string
    color: string
  }

  const tokenColorOverrides: TokenColorOverride[] = [{ token: 'SOL', color: '#9945FF' }]

  const getTokenColor = (
    token: string,
    logoColor: string | undefined,
    overrides: TokenColorOverride[]
  ): string => {
    const override = overrides.find(item => item.token === token)
    return override?.color || logoColor || '#000000'
  }

  const rgbToHex = ({ r, g, b }: RGBColor): string => {
    const componentToHex = (c: number): string => {
      const hex = Math.round(c).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
  }

  const calculateAverageColor = (imageData: Uint8ClampedArray): string => {
    let totalR = 0
    let totalG = 0
    let totalB = 0
    let totalPixels = 0

    for (let i = 0; i < imageData.length; i += 4) {
      const alpha = imageData[i + 3]

      if (alpha === 0) continue

      const alphaMultiplier = alpha / 255
      totalR += imageData[i] * alphaMultiplier
      totalG += imageData[i + 1] * alphaMultiplier
      totalB += imageData[i + 2] * alphaMultiplier
      totalPixels++
    }

    if (totalPixels === 0) return '#000000'

    const averageColor: RGBColor = {
      r: totalR / totalPixels,
      g: totalG / totalPixels,
      b: totalB / totalPixels
    }

    return rgbToHex(averageColor)
  }

  const getAverageColor = useCallback((logoUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img: HTMLImageElement = new Image()
      img.crossOrigin = 'Anonymous'

      img.onload = (): void => {
        const canvas: HTMLCanvasElement = document.createElement('canvas')
        const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        canvas.width = img.width
        canvas.height = img.height

        ctx.drawImage(img, 0, 0)

        const imageData: Uint8ClampedArray = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        ).data

        const averageColor = calculateAverageColor(imageData)
        resolve(averageColor)
      }

      img.onerror = (): void => {
        reject(new Error('Failed to load image'))
      }

      img.src = logoUrl
    })
  }, [])

  return { tokenColorOverrides, getAverageColor, getTokenColor }
}
