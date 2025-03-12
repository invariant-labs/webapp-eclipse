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

import SolarLogo from '@static/png/InvariantAggregator/solar.png'
import LifinityLogo from '@static/png/InvariantAggregator/lifinity.png'
import FrameLogo from '@static/png/InvariantAggregator/Frame.png'
import UmbraLogo from '@static/png/InvariantAggregator/umbra.png'
import InvariantLogo from '@static/png/InvariantAggregator/Invariant.png'

const TransactionRoute = () => {
  const { classes } = useStyles()
  const gridDefinition = [
    [
      {
        type: 'node',
        shape: 'circle',
        color: '#2196F3',
        bigNode: true,
        textA: 'ETH',
        textB: '1 ETH',
        connectors: [{ direction: 'right' }],
        logoImg:
          'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png'
      },
      {
        type: 'node',
        shape: 'rectangle',
        color: '#2196F3',
        dexInfo: {
          logo: SolarLogo,
          fee: 0.01,
          link: 'http://foo.bar',
          name: 'Solar'
        },
        label: 'A',
        connectors: [{ direction: 'right' }, { direction: 'left' }]
      },
      {
        type: 'node',
        shape: 'circle',
        color: '#2196F3',
        labelPos: 'right',
        textA: 'ETH',
        textB: '1 ETH',
        logoImg:
          'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png'
      }
    ],
    [
      null,
      null,
      {
        type: 'node',
        shape: 'rectangle',
        dexInfo: {
          logo: UmbraLogo,
          fee: 0.05,
          link: 'http://foo.bar',
          name: 'Umbra'
        },
        color: '#2196F3',
        label: 'A',

        connectors: [{ direction: 'up' }, { direction: 'down' }]
      }
    ],
    [
      null,
      null,
      {
        type: 'node',
        shape: 'circle',
        textA: 'ETH',
        textB: '1 ETH',
        logoImg:
          'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png',
        labelPos: 'right'
      }
    ],
    [
      null,
      null,
      {
        type: 'node',
        shape: 'rectangle',
        label: 'A',
        dexInfo: {
          logo: InvariantLogo,
          fee: 0.05,
          link: 'http://foo.bar',
          name: 'Invariant'
        },

        color: '#2196F3',
        connectors: [{ direction: 'up' }, { direction: 'down' }]
      }
    ],
    [
      {
        type: 'node',
        shape: 'circle',
        textA: 'ETH',
        bigNode: true,

        textB: '1 ETH',
        logoImg:
          'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk/logo.png'
      },
      {
        type: 'node',
        shape: 'rectangle',
        label: 'A',
        dexInfo: {
          logo: LifinityLogo,
          fee: 0.01,
          link: 'http://foo.bar',
          name: 'Lifinity'
        },

        color: '#2196F3',
        connectors: [{ direction: 'right' }, { direction: 'left', withArrow: true }]
      },
      {
        type: 'node',
        shape: 'circle',
        textA: 'MOON',
        textB: '1 MOON',

        labelPos: 'right',
        logoImg: 'https://raw.githubusercontent.com/moon-meme/assets/main/Moon.png'
      }
    ]
  ]
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
