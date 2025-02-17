import { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { PieChart } from '@mui/x-charts'
import { colors } from '@static/theme'
import { useStyles } from './style'

const ResponsivePieChart = ({ data, chartColors, isLoading = true }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [showRealData, setShowRealData] = useState(!isLoading)

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowRealData(true)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      setShowRealData(false)
    }
  }, [isLoading])

  const total = data?.reduce((sum, item) => sum + item.value, 0) || 0

  const loadingData = [{ value: 1, label: '' }]

  const getPathStyles = (index, isLoadingChart) => ({
    stroke: 'transparent',
    outline: 'none',
    opacity: isLoadingChart ? (showRealData ? 0 : 1) : showRealData ? 1 : 0,
    filter: `drop-shadow(0px 0px ${hoveredIndex === index ? '4px' : '2px'} ${
      isLoadingChart ? colors.invariant.light : chartColors[index]
    })`,
    transition: 'all 0.3s ease-in-out'
  })

  const commonChartProps = {
    outerRadius: '50%',
    innerRadius: '90%',
    startAngle: -45,
    endAngle: 315,
    cx: '80%',
    cy: '50%'
  }
  const { classes } = useStyles({
    chartColors,
    hoveredColor: hoveredIndex !== null ? chartColors[hoveredIndex] : null
  })
  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0 }}>
        <PieChart
          skipAnimation
          series={[
            {
              data: loadingData,
              ...commonChartProps,
              valueFormatter: () => ''
            }
          ]}
          sx={{
            '& path': {
              '&:nth-of-type(1)': getPathStyles(0, true)
            }
          }}
          colors={[colors.invariant.light]}
          tooltip={{ trigger: 'none' }}
          slotProps={{ legend: { hidden: true } }}
          width={300}
          height={200}
        />
      </Box>

      <Box sx={{ position: 'absolute', top: 0, left: 0 }}>
        <PieChart
          skipAnimation
          series={[
            {
              data: data.length > 0 ? data : loadingData,
              ...commonChartProps,
              valueFormatter: item => {
                if (!data) return ''
                const percentage = ((item.value / total) * 100).toFixed(1)
                return `$${item.value.toLocaleString()} (${percentage}%)`
              }
            }
          ]}
          onHighlightChange={item => {
            if (showRealData) {
              setHoveredIndex(item?.dataIndex ?? null)
            }
          }}
          sx={{
            '& path': {
              '&:nth-of-type(1)': getPathStyles(0, false),
              '&:nth-of-type(2)': getPathStyles(1, false),
              '&:nth-of-type(3)': getPathStyles(2, false),
              '&:nth-of-type(4)': getPathStyles(3, false),
              '&:nth-of-type(5)': getPathStyles(4, false),
              '&:nth-of-type(6)': getPathStyles(5, false),
              '&:nth-of-type(7)': getPathStyles(6, false),
              '&:nth-of-type(8)': getPathStyles(7, false),
              '&:nth-of-type(9)': getPathStyles(8, false),
              '&:nth-of-type(10)': getPathStyles(9, false)
            }
          }}
          colors={chartColors}
          tooltip={{
            trigger: showRealData ? 'item' : 'none',
            classes: {
              root: classes.dark_background,
              valueCell: classes.value_cell,
              labelCell: classes.label_cell,
              paper: classes.dark_paper,
              table: classes.dark_table,
              cell: classes.dark_cell,
              mark: classes.dark_mark,
              row: classes.dark_row
            }
          }}
          slotProps={{
            legend: { hidden: true }
          }}
          width={300}
          height={200}
        />
      </Box>
    </Box>
  )
}

export default ResponsivePieChart
