import { Box } from '@mui/material'
import { PieChart } from '@mui/x-charts'
import { makeStyles } from 'tss-react/mui'
import { colors } from '@static/theme'

const ResponsivePieChart = ({ data, chartColors, isLoading = false }) => {
  const total = data?.reduce((sum, item) => sum + item.value, 0) || 0

  const useStyles = makeStyles()(() => ({
    dark_background: {
      backgroundColor: `${colors.invariant.componentDark} !important`,
      color: '#FFFFFF !important',
      borderRadius: '8px !important',
      display: 'flex !important',
      flexDirection: 'column',
      padding: '8px !important',
      minWidth: '150px !important',
      boxShadow: '27px 39px 75px -30px #000'
    },
    dark_paper: {
      backgroundColor: `${colors.invariant.componentDark} !important`,
      color: '#FFFFFF !important',
      boxShadow: 'none !important'
    },
    dark_table: {
      color: '#FFFFFF !important',
      display: 'flex !important',
      flexDirection: 'column',
      gap: '4px'
    },
    dark_cell: {
      color: '#FFFFFF !important',
      padding: '2px 0 !important'
    },
    dark_mark: {
      display: 'none !important'
    },
    dark_row: {
      color: '#FFFFFF !important',
      display: 'flex !important',
      flexDirection: 'column',
      '& > *': {
        marginBottom: '4px !important'
      },
      '& > *:first-of-type': {
        color: 'inherit !important'
      }
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

  const getPathStyles = index => ({
    stroke: 'transparent',
    outline: 'none',
    filter: `drop-shadow(0px 0px 2px ${isLoading ? loadingColors[0] : chartColors[index]})`
  })

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
            },
            faded: { innerRadius: 90, additionalRadius: -10 }
          }
        ]}
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
