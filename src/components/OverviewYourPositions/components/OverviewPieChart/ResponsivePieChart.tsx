import { Box } from '@mui/material'
import { PieChart } from '@mui/x-charts'
import { colors } from '@static/theme'
import { useState } from 'react'
import { useStyles } from './style'

const ResponsivePieChart = ({ data, chartColors, isLoading = false }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const total = data?.reduce((sum, item) => sum + item.value, 0) || 0

  const { classes } = useStyles({
    chartColors,
    hoveredColor: hoveredIndex !== null ? chartColors[hoveredIndex] : null
  })

  const loadingData = [
    {
      value: 100,
      label: 'Loading...'
    }
  ]

  const loadingColors = [colors.invariant.light]

  const getPathStyles = index => ({
    stroke: 'transparent',
    outline: 'none',
    filter: `drop-shadow(0px 0px ${hoveredIndex === index ? '4px' : '2px'} ${
      isLoading ? loadingColors[0] : chartColors[index]
    })`,
    transition: 'all 0.2s ease-in-out'
  })

  return (
    <Box className={classes.pieChartContainer}>
      <PieChart
        skipAnimation
        series={[
          {
            data: isLoading ? loadingData : data,
            outerRadius: '50%',
            innerRadius: '90%',
            startAngle: -45,
            endAngle: 315,
            cx: '80%',
            cy: '50%',
            valueFormatter: item => {
              if (isLoading) return 'Loading...'
              const percentage = ((item.value / total) * 100).toFixed(1)
              return `$${item.value.toLocaleString()} (${percentage}%)`
            }
          }
        ]}
        onHighlightChange={item => {
          setHoveredIndex(item?.dataIndex ?? null)
        }}
        sx={{
          '& path': {
            '&:nth-of-type(1)': getPathStyles(0),
            '&:nth-of-type(2)': getPathStyles(1),
            '&:nth-of-type(3)': getPathStyles(2),
            '&:nth-of-type(4)': getPathStyles(3),
            '&:nth-of-type(5)': getPathStyles(4),
            '&:nth-of-type(6)': getPathStyles(5),
            '&:nth-of-type(7)': getPathStyles(6),
            '&:nth-of-type(8)': getPathStyles(7),
            '&:nth-of-type(9)': getPathStyles(8),
            '&:nth-of-type(10)': getPathStyles(9)
          }
        }}
        colors={isLoading ? loadingColors : chartColors}
        tooltip={{
          trigger: isLoading ? 'none' : 'item',
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
          legend: {
            hidden: true
          }
        }}
        width={300}
        height={200}
      />
    </Box>
  )
}

export default ResponsivePieChart
