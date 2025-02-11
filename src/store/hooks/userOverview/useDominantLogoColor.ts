import { useCallback } from 'react'

export const useDominantLogoColor = () => {
  interface ColorFrequency {
    [key: string]: number
  }

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
      const hex = c.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
  }

  const findMostFrequentColor = (colorFrequency: ColorFrequency): string => {
    return Object.entries(colorFrequency).reduce(
      (dominant, [color, frequency]) =>
        frequency > dominant.frequency ? { color, frequency } : dominant,
      { color: '#000000', frequency: 0 }
    ).color
  }

  const getDominantColor = useCallback((logoUrl: string): Promise<string> => {
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
        const colorFrequency: ColorFrequency = {}

        for (let i = 0; i < imageData.length; i += 4) {
          const color: RGBColor = {
            r: imageData[i],
            g: imageData[i + 1],
            b: imageData[i + 2]
          }
          const alpha: number = imageData[i + 3]

          if (alpha === 0) continue

          const hex: string = rgbToHex(color)
          colorFrequency[hex] = (colorFrequency[hex] || 0) + 1
        }

        const dominantColor = findMostFrequentColor(colorFrequency)
        resolve(dominantColor)
      }

      img.onerror = (): void => {
        reject(new Error('Failed to load image'))
      }

      img.src = logoUrl
    })
  }, [])
  return { tokenColorOverrides, getDominantColor, getTokenColor }
}
