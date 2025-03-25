import React from 'react'
import { Box, Typography } from '@mui/material'
import { FlowChartGrid } from './FlowChartGrid/FlowChartGrid'

import {
  generateFourHopTemplate,
  generateOneHopTemplate,
  generateThreeHopTemplate,
  generateTwoHopTemplate
} from './FlowChartGrid/utils/generateTemplates'
import TransactionRouteLoader from './FlowChartGrid/components/TransactionRouteLoader/TransactionRouteLoader'
import { FlowChartProps, GridDefinition, RouteTemplateProps } from './FlowChartGrid/types/types'
import useStyles from './style'

const getTemplateForHopCount = (hopCount: number, data: RouteTemplateProps): GridDefinition => {
  switch (hopCount) {
    case 1:
      return generateOneHopTemplate(data)
    case 2:
      return generateTwoHopTemplate(data)
    case 3:
      return generateThreeHopTemplate(data)
    case 4:
      return generateFourHopTemplate(data)
    default:
      return generateOneHopTemplate(data)
  }
}
const TransactionRoute: React.FC<FlowChartProps> = ({
  routeData,
  handleClose,
  showCloseButton = true,
  isLoading = false
}) => {
  const { classes } = useStyles({
    isLoading,
    width: '280px'
  })
  if (!routeData) return null
  const gridDefinition = getTemplateForHopCount(routeData.exchanges.length, routeData)

  return (
    <Box className={classes.container}>
      {showCloseButton ? (
        <button className={classes.closeButton} onClick={handleClose}>
          ×
        </button>
      ) : null}
      <Box className={classes.graphContainer}>
        <Typography className={classes.routeTitle}>Transaction route</Typography>

        <Box>
          {isLoading ? (
            <TransactionRouteLoader />
          ) : (
            <FlowChartGrid gridDefinition={gridDefinition} cellSize={80} />
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default TransactionRoute
