import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { Box, useMediaQuery } from '@mui/material'
import { horizontalSwapIcon, newTabBtnIcon, plusIcon } from '@static/icons'
import { NetworkType, USDC_MAIN, USDC_TEST, WETH_MAIN, WETH_TEST } from '@store/consts/static'
import { StrategyConfig, WalletToken } from '@store/types/userOverview'
import { addressToTicker, ROUTES } from '@utils/utils'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStyles } from './styles'
import { useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { actions } from '@store/reducers/navigation'
import { theme } from '@static/theme'

interface IActionButtons {
  pool: WalletToken
  strategy: StrategyConfig
  currentNetwork: NetworkType
}

export const ActionButtons = ({ pool, strategy, currentNetwork }: IActionButtons) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const { classes } = useStyles()
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  const networkUrl = useMemo(() => {
    switch (currentNetwork) {
      case NetworkType.Mainnet:
        return ''
      case NetworkType.Testnet:
        return '?cluster=testnet'
      case NetworkType.Devnet:
        return '?cluster=devnet'
      default:
        return '?cluster=testnet'
    }
  }, [currentNetwork])

  return (
    <>
      <TooltipHover title='Add Position'>
        <Box
          className={classes.actionIcon}
          onClick={() => {
            const sourceToken = addressToTicker(currentNetwork, strategy.tokenAddressA)
            const targetToken = strategy.tokenAddressB
              ? strategy.tokenAddressB
              : sourceToken === 'ETH'
                ? currentNetwork === NetworkType.Mainnet
                  ? USDC_MAIN.address
                  : USDC_TEST.address
                : currentNetwork === NetworkType.Mainnet
                  ? WETH_MAIN.address
                  : WETH_TEST.address

            dispatch(actions.setNavigation({ address: location.pathname }))
            navigate(
              ROUTES.getNewPositionRoute(
                sourceToken,
                addressToTicker(currentNetwork, targetToken.toString()),
                strategy.feeTier
              ),
              {
                state: { referer: 'portfolio' }
              }
            )
          }}>
          <img src={plusIcon} height={isMd ? 30 : 24} width={isMd ? 30 : 24} alt='Add' />
        </Box>
      </TooltipHover>
      <TooltipHover title='Exchange'>
        <Box
          className={classes.actionIcon}
          onClick={() => {
            const sourceToken = addressToTicker(currentNetwork, pool.id.toString())
            const targetToken =
              sourceToken === 'ETH'
                ? currentNetwork === NetworkType.Mainnet
                  ? USDC_MAIN.address
                  : USDC_TEST.address
                : currentNetwork === NetworkType.Mainnet
                  ? WETH_MAIN.address
                  : WETH_TEST.address
            navigate(
              ROUTES.getExchangeRoute(
                sourceToken,
                addressToTicker(currentNetwork, targetToken.toString())
              ),

              {
                state: { referer: 'portfolio' }
              }
            )
          }}>
          <img src={horizontalSwapIcon} height={isMd ? 30 : 24} width={isMd ? 30 : 24} alt='Add' />
        </Box>
      </TooltipHover>
      <TooltipHover title='Open in explorer'>
        <Box
          className={classes.actionIcon}
          onClick={() => {
            window.open(
              `https://eclipsescan.xyz/token/${pool.id.toString()}/${networkUrl}`,
              '_blank',
              'noopener,noreferrer'
            )
          }}>
          <img
            height={isMd ? 30 : 24}
            width={isMd ? 30 : 24}
            src={newTabBtnIcon}
            alt={'Exchange'}
          />
        </Box>
      </TooltipHover>
    </>
  )
}
