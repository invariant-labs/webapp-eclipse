import React from 'react'
import { Box } from '@mui/material'
import { PieChart } from '@mui/x-charts'

const ResponsivePieChart = ({ data, chartColors }) => {
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
            data: data,
            outerRadius: '90%', // Use percentage instead of fixed value
            startAngle: -45,
            endAngle: 315,
            cx: '75%', // Center horizontally
            cy: '50%' // Center vertically
          }
        ]}
        colors={chartColors}
        slotProps={{
          legend: { hidden: true }
        }}
        width={300}
        height={180}
      />
    </Box>
  )
}

export default ResponsivePieChart
