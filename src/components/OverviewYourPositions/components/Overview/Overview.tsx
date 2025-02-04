import React, { useCallback, useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { UnclaimedFeeList } from '../UnclaimedFeeList/UnclaimedFeeList'
import { HeaderSection } from '../HeaderSection/HeaderSection'
import { UnclaimedSection } from '../UnclaimedSection/UnclaimedSection'
import { useStyles } from './styles'
import { ProcessedPool } from '@store/types/userOverview'
import { useSelector } from 'react-redux'
import { overviewSelectors } from '@store/selectors/overview'
import { colors, typography } from '@static/theme'

interface OverviewProps {
  poolAssets: ProcessedPool[]
  isLoading?: boolean
}
export const Overview: React.FC<OverviewProps> = () => {
  const { classes } = useStyles()
  const totalAssets = useSelector(overviewSelectors.totalAssets)
  const totalUnclaimedFee = useSelector(overviewSelectors.totalUnclaimedFee)
  const positions = useSelector(overviewSelectors.positions)
  const [logoColors, setLogoColors] = useState<Record<string, string>>({})

  // Move color detection logic outside of render
  interface ColorFrequency {
    [key: string]: number
  }

  interface RGBColor {
    r: number
    g: number
    b: number
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

  // Effect to load colors for logos
  useEffect(() => {
    positions.forEach(position => {
      if (position.logo && !logoColors[position.logo]) {
        getDominantColor(position.logo)
          .then(color => {
            setLogoColors(prev => ({
              ...prev,
              [position.logo ?? 0]: color
            }))
          })
          .catch(error => {
            console.error('Error getting color for logo:', error)
          })
      }
    })
  }, [positions, getDominantColor, logoColors])

  return (
    <Box className={classes.container}>
      <HeaderSection totalValue={totalAssets} />
      <UnclaimedSection unclaimedTotal={totalUnclaimedFee} />

      <Box sx={{ marginTop: 2 }}>
        {positions.map(position => {
          const textColor = logoColors[position.logo ?? 0] || colors.invariant.text

          return (
            <Box
              key={position.token}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px'
              }}>
              <Typography
                style={{
                  ...typography.heading4,
                  color: textColor,
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                <img
                  src={position.logo}
                  alt={'Token logo'}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '100%',
                    marginRight: '8px'
                  }}
                />
                {position.token}:
              </Typography>
              <Typography style={{ ...typography.heading4, color: colors.invariant.text }}>
                ${position.value.toFixed(9)}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
