import React from 'react'
import { Box } from '@mui/material'
import { PieChart } from '@mui/x-charts'
import { makeStyles } from 'tss-react/mui'
import { colors } from '@static/theme'

const ResponsivePieChart = ({ data, chartColors, isLoading = false }) => {
  const total = data?.reduce((sum, item) => sum + item.value, 0) || 0

  const useStyles = makeStyles()(() => ({
    dark_background: {
      backgroundColor: '#1E1E1E !important',
      color: '#FFFFFF !important',
      borderRadius: '8px !important'
    },
    dark_paper: {
      backgroundColor: '#1E1E1E !important',
      color: '#FFFFFF !important'
    },
    dark_table: {
      color: '#FFFFFF !important'
    },
    dark_cell: {
      color: '#FFFFFF !important'
    },
    dark_mark: {
      color: '#FFFFFF !important'
    },
    dark_row: {
      color: '#FFFFFF !important'
    }
  }))

  const { classes } = useStyles()

  const loadingData = [
    {
      value: 100,
      label: 'Loading...'
    }
  ]

  const loadingColors = [colors.invariant.light]

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        maxHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      <PieChart
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
        sx={{
          path: {
            stroke: 'transparent',
            outline: 'none'
          }
        }}
        colors={isLoading ? loadingColors : chartColors}
        tooltip={{
          trigger: 'item',
          classes: {
            root: classes.dark_background,
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
