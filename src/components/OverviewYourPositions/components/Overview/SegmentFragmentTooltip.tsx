import { Tooltip, Box, Typography } from '@mui/material'
import { formatNumberWithoutSuffix } from '@utils/utils'
import React, { useMemo, useEffect } from 'react'
import { ChartSegment } from './MobileOverview'
import { typography } from '@static/theme'

interface Colors {
  invariant: {
    textGrey: string
  }
}

interface TooltipClasses {
  tooltip: string
}

interface SegmentFragmentTooltipProps {
  segment: ChartSegment
  index: number
  selectedSegment: number | null
  setSelectedSegment: (index: number | null) => void
  tooltipClasses: TooltipClasses
  colors: Colors
}

const SegmentFragmentTooltip: React.FC<SegmentFragmentTooltipProps> = ({
  segment,
  index,
  selectedSegment,
  setSelectedSegment,
  tooltipClasses,
  colors
}) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.chart-container')) {
        setSelectedSegment(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [setSelectedSegment])

  const getSegmentStyle = (segment: ChartSegment, isSelected: boolean) => ({
    backgroundColor: segment.color,
    opacity: isSelected ? 1 : 0.8,
    width: `${segment.width}%`,
    height: '100%',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease-in-out'
  })

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedSegment(selectedSegment === index ? null : index)
  }

  const segmentFragmentTooltip = useMemo(
    () => (
      <Tooltip
        key={index}
        open={selectedSegment === index}
        enterTouchDelay={0}
        leaveTouchDelay={0}
        disableTouchListener={true}
        disableHoverListener={true}
        disableFocusListener={true}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        onClose={() => setSelectedSegment(null)}
        title={
          <Box sx={{ p: 1 }}>
            <Typography
              sx={{ color: segment.color, ...typography.body2, fontWeight: '600', mb: 0.5 }}>
              {segment.token}
            </Typography>
            <Typography sx={{ mb: 0.5, ...typography.body2 }}>
              ${formatNumberWithoutSuffix(segment.value, { twoDecimals: true })} (
              {segment.percentage}%)
            </Typography>
          </Box>
        }
        placement='top'
        classes={{
          tooltip: tooltipClasses.tooltip
        }}>
        <Box
          onClick={handleClick}
          className='chart-container'
          sx={getSegmentStyle(segment, selectedSegment === index)}
        />
      </Tooltip>
    ),
    [segment, index, selectedSegment, setSelectedSegment, colors, tooltipClasses]
  )

  return segmentFragmentTooltip
}

export default SegmentFragmentTooltip
