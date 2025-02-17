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

  const tokenColorOverrides: TokenColorOverride[] = [
    { token: 'SOL', color: '#9945FF' },
    { token: 'CELESTIA', color: '#FF8B34' },
    { token: 'STTIA', color: '#FF4B4B' }
  ]

  const defaultTokenColors: Record<string, string> = {
    SOL: '#9945FF',
    CELESTIA: '#FF8B34',
    STTIA: '#FF4B4B',
    DEFAULT: '#7C7C7C'
  }

  const getTokenColor = (
    token: string,
    logoColor: string | undefined,
    overrides: TokenColorOverride[]
  ): string => {
    const override = overrides.find(item => item.token === token)
    if (override) return override.color

    if (logoColor) return logoColor

    return defaultTokenColors[token] || defaultTokenColors.DEFAULT
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

    if (totalPixels === 0) return defaultTokenColors.DEFAULT

    const averageColor: RGBColor = {
      r: totalR / totalPixels,
      g: totalG / totalPixels,
      b: totalB / totalPixels
    }

    return rgbToHex(averageColor)
  }

  const getProxyUrl = (url: string): string => {
    if (url.includes('github.com') && url.includes('/blob/master/')) {
      return url
        .replace('github.com', 'raw.githubusercontent.com')
        .replace('/blob/master/', '/master/')
    }
    return url
  }

  const getAverageColor = useCallback((logoUrl: string, token: string): Promise<string> => {
    return new Promise(resolve => {
      const img: HTMLImageElement = new Image()
      img.crossOrigin = 'Anonymous'

      const timeoutDuration = 5000
      let timeoutId: NodeJS.Timeout | null = null

      const cleanup = () => {
        if (timeoutId != null) {
          clearTimeout(timeoutId)
          img.onload = null
          img.onerror = null
        }
      }

      img.onload = (): void => {
        cleanup()
        try {
          const canvas: HTMLCanvasElement = document.createElement('canvas')
          const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')

          if (!ctx) {
            resolve(getTokenColor(token, undefined, tokenColorOverrides))
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
        } catch (error) {
          console.warn(`Error processing image for ${token}:`, error)
          resolve(getTokenColor(token, undefined, tokenColorOverrides))
        }
      }

      img.onerror = (): void => {
        cleanup()
        console.warn(`Failed to load image for ${token}`)
        resolve(getTokenColor(token, undefined, tokenColorOverrides))
      }

      timeoutId = setTimeout(() => {
        cleanup()
        console.warn(`Timeout loading image for ${token}`)
        resolve(getTokenColor(token, undefined, tokenColorOverrides))
      }, timeoutDuration)

      img.src = getProxyUrl(logoUrl)
    })
  }, [])

  return { tokenColorOverrides, getAverageColor, getTokenColor }
}
