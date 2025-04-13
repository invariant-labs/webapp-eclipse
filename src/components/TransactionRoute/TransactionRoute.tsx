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
import TransactionRouteError from './FlowChartGrid/components/TransactionRouteError/TransactionRouteError'

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
  errorMessage,
  showCloseButton = true,
  isLoading = false
}) => {
  const { classes } = useStyles({
    isLoading,
    width: '280px'
  })

  const renderContent = () => {
    if (isLoading) {
      return <TransactionRouteLoader />
    }

    if (errorMessage && (!routeData || !routeData.exchanges || routeData.exchanges.length === 0)) {
      return <TransactionRouteError error={errorMessage} />
    }

    if (routeData && routeData.exchanges && routeData.exchanges.length > 0) {
      return (
        <FlowChartGrid
          gridDefinition={getTemplateForHopCount(routeData.exchanges.length, routeData)}
          cellSize={80}
        />
      )
    }

    return <TransactionRouteError error='No route data available' />
  }

  return (
    <Box className={classes.container}>
      {showCloseButton ? (
        <button className={classes.closeButton} onClick={handleClose}>
          ×
        </button>
      ) : null}
      <Box className={classes.graphContainer}>
        <Typography className={classes.routeTitle}>Transaction route</Typography>

        <Box>{renderContent()}</Box>
      </Box>
    </Box>
  )
}

export default TransactionRoute
