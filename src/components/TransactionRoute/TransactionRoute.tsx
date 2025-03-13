import React from 'react'
import { makeStyles } from 'tss-react/mui'
import { Box, Typography } from '@mui/material'
import { FlowChartGrid } from './FlowChartGrid/FlowChartGrid'
import { colors } from '@static/theme'
const useStyles = makeStyles()(theme => {
  return {
    container: {
      width: 280,
      padding: theme.spacing(3),
      position: 'relative',
      height: '445px',
      backgroundColor: colors.invariant.component,
      borderRadius: theme.spacing(2),
      color: 'white',
      marginLeft: '20px',
      transition: 'width .1s ease-in-out'
    },
    routeTitle: {
      marginBottom: theme.spacing(2),
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '0.875rem'
    },
    graphContainer: {
      display: 'flex',
      height: '90%',
      position: 'relative'
    },
    tokenNode: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'absolute',
      zIndex: 2
    },
    tokenIcon: {
      width: 50,
      height: 50,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing(1),
      backgroundColor: '#2a3154'
    },
    tokenSymbol: {
      fontWeight: 'bold',
      fontSize: '0.875rem'
    },
    tokenAmount: {
      fontSize: '0.75rem',
      opacity: 0.7
    },
    line: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      position: 'absolute',
      zIndex: 0
    },
    exchangeLabel: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      padding: theme.spacing(0.5, 1.5),
      fontSize: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      position: 'absolute',
      zIndex: 2
    },
    exchangeIcon: {
      width: 16,
      height: 16,
      marginRight: theme.spacing(0.5),
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    exchangePercentage: {
      marginRight: theme.spacing(0.5)
    },
    closeButton: {
      position: 'absolute',
      top: theme.spacing(2),
      right: theme.spacing(2),
      backgroundColor: 'transparent',
      color: 'rgba(255, 255, 255, 0.5)',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.5rem',
      zIndex: 10
    },
    arrowHead: {
      position: 'absolute',
      width: 0,
      height: 0,
      borderTop: '6px solid transparent',
      borderBottom: '6px solid transparent',
      borderLeft: '8px solid rgba(255, 255, 255, 0.2)',
      zIndex: 1
    }
  }
})

import {
  generateFourHopTemplate,
  generateOneHopTemplate,
  generateThreeHopTemplate,
  generateTwoHopTemplate
} from './FlowChartGrid/utils/generateTemplates'
import { BN } from '@coral-xyz/anchor'

export interface DexInfo {
  logo: string
  fee: number
  link: string
  name: string
}

export interface Connector {
  direction: 'up' | 'down' | 'left' | 'right'
  withArrow?: boolean
  longerConnector?: boolean
}

export interface NodeDefinition {
  type: 'node'
  shape: 'circle' | 'rectangle'
  bigNode?: boolean
  labelPos?: 'bottom' | 'right'
  textA?: string
  textB?: string
  label?: string
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

interface FlowChartProps {
  routeData: RouteTemplateProps
  hopCount: number
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
const TransactionRoute: React.FC<FlowChartProps> = ({ hopCount, routeData }) => {
  const { classes } = useStyles()

  const gridDefinition = getTemplateForHopCount(hopCount, routeData)

  return (
    <Box className={classes.container}>
      <Typography className={classes.routeTitle}>Transaction route</Typography>
      <button className={classes.closeButton}>×</button>

      <Box className={classes.graphContainer}>
        <Box>
          <FlowChartGrid gridDefinition={gridDefinition} cellSize={80} />
        </Box>
      </Box>
    </Box>
  )
}

export default TransactionRoute
