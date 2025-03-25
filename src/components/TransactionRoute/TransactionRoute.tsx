import React from 'react'
import { Box, Typography } from '@mui/material'
import { FlowChartGrid } from './FlowChartGrid/FlowChartGrid'

import {
  generateFourHopTemplate,
  generateOneHopTemplate,
  generateThreeHopTemplate,
  generateTwoHopTemplate
} from './FlowChartGrid/utils/generateTemplates'
import { BN } from '@coral-xyz/anchor'
import TransactionRouteLoader from './FlowChartGrid/components/TransactionRouteLoader/TransactionRouteLoader'
import { CornerPosition, Direction, FlowChartProps } from './FlowChartGrid/types/types'
import useStyles from './style'

export interface DexInfo {
  logo: string
  fee: number
  link: string
  name: string
}

export interface Connector {
  direction: Direction
  withArrow?: boolean
  longerConnector?: boolean
}

export interface NodeDefinition {
  type: 'node'
  shape?: 'circle' | 'rect' | 'corner'
  bigNode?: boolean
  arrowDirection?: 'up' | 'down' | 'left' | 'right'
  cornerPosition?: CornerPosition
  showTriangleArrow?: boolean
  labelPos?: 'bottom' | 'right'
  textA?: string
  textB?: string
  label?: boolean
  connectors?: Connector[]
  logoImg?: string
  dexInfo?: DexInfo
}

export interface FlowChartTokenNode {
  symbol: string
  logoUrl: string
  amount: BN
}

export type GridCell = NodeDefinition | null
export type GridDefinition = GridCell[][]

export interface RouteTemplateProps {
  sourceToken: FlowChartTokenNode
  exchanges: Array<{
    name: string
    logoUrl: string
    fee: number
    toToken?: FlowChartTokenNode
  }>
  destinationToken: FlowChartTokenNode
}

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
      <Box className={classes.graphContainer}>
        <Typography className={classes.routeTitle}>
          Transaction{routeData.exchanges.length > 2 ? `'s` : ''} route
        </Typography>
        {showCloseButton ? (
          <button className={classes.closeButton} onClick={handleClose}>
            ×
          </button>
        ) : null}
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
