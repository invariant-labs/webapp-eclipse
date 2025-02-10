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
            outerRadius: '60%',
            innerRadius: '90%',
            startAngle: -45,
            endAngle: 315,
            cx: '80%',
            cy: '50%'
          }
        ]}
        colors={chartColors}
        slotProps={{
          legend: { hidden: true }
        }}
        width={300}
        height={200}
      />
    </Box>
  )
}

export default ResponsivePieChart
