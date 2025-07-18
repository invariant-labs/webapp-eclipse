import React, { useMemo } from 'react'
import { Box, Skeleton, Typography } from '@mui/material'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import { horizontalSwapIcon, plusIcon } from '@static/icons'
import { colors, typography } from '@static/theme'
import { NetworkType, promotedTiers } from '@store/consts/static'
import { NewTabIcon } from '@static/componentIcon/NewTabIcon'
import { CopyIcon } from '@static/componentIcon/CopyIcon'
import { ReverseTokensIcon } from '@static/componentIcon/ReverseTokensIcon'
import { SwapToken } from '@store/selectors/solanaWallet'
import useStyles from './style'
import { VariantType } from 'notistack'
import { FeeSelector } from './FeeSelector/FeeSelector'

export interface IProps {
  poolAddress: string
  copyAddressHandler: (message: string, variant: VariantType) => void
  network: NetworkType
  tokenX: SwapToken | null
  tokenY: SwapToken | null
  handleOpenSwap: () => void
  handleOpenPosition: () => void
  isPoolDataLoading: boolean
  selectFeeTier: (value: number) => void
  feeTiers: number[]
  feeTierIndex: number
  feeTiersWithTvl: Record<number, number>
  totalTvl: number
}

export const ChartUpperSection: React.FC<IProps> = ({
  poolAddress,
  copyAddressHandler,
  network,
  tokenX,
  tokenY,
  handleOpenSwap,
  handleOpenPosition,
  isPoolDataLoading,
  selectFeeTier,
  feeTiers,
  feeTierIndex,
  feeTiersWithTvl,
  totalTvl
}) => {
  const { classes } = useStyles()

  const networkUrl = useMemo(() => {
    switch (network) {
      case NetworkType.Mainnet:
        return ''
      case NetworkType.Testnet:
        return '?cluster=testnet'
      case NetworkType.Devnet:
        return '?cluster=devnet'
      default:
        return '?cluster=testnet'
    }
  }, [network])

  const copyToClipboard = () => {
    if (!poolAddress || !copyAddressHandler) {
      return
    }
    navigator.clipboard
      .writeText(poolAddress)
      .then(() => {
        copyAddressHandler('Token address copied to Clipboard', 'success')
      })
      .catch(() => {
        copyAddressHandler('Failed to copy token address to Clipboard', 'error')
      })
  }

  const promotedPoolTierIndex = useMemo(() => {
    const tierIndex =
      tokenX === null || tokenY === null
        ? undefined
        : (promotedTiers.find(
            tier =>
              (tier.tokenX.equals(tokenX.assetAddress) &&
                tier.tokenY.equals(tokenY.assetAddress)) ||
              (tier.tokenX.equals(tokenY.assetAddress) && tier.tokenY.equals(tokenX.assetAddress))
          )?.index ?? undefined)

    return tierIndex
  }, [tokenX, tokenY])

  return (
    <Box display='flex' justifyContent='space-between' alignItems='center' minHeight='71px'>
      <Box display='flex' alignItems='center' gap='12px'>
        <Box>
          <Box display='flex' alignItems='center' gap={'6px'} minHeight={'27px'}>
            <Typography sx={{ ...typography.body2, color: colors.invariant.textGrey }}>
              Pool address
            </Typography>
            {isPoolDataLoading ? (
              <Skeleton
                variant='rounded'
                height={27}
                width={100}
                animation='wave'
                sx={{ borderRadius: '8px' }}
              />
            ) : (
              <>
                <TooltipHover title='Copy'>
                  <Box
                    display='flex'
                    alignItems='center'
                    gap='3px'
                    className={classes.addressIcon}
                    onClick={copyToClipboard}>
                    <Typography
                      style={(typography.body1, { textDecoration: 'underline' })}
                      color={colors.invariant.text}>
                      {poolAddress.slice(0, 4)}...
                      {poolAddress.slice(poolAddress.length - 4, poolAddress.length)}{' '}
                    </Typography>

                    <Box>
                      <CopyIcon color={colors.invariant.text} height={10} />
                    </Box>
                  </Box>
                </TooltipHover>
                <TooltipHover title='Open pool in explorer'>
                  <a
                    href={`https://eclipsescan.xyz/account/${poolAddress}${networkUrl}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={event => {
                      event.stopPropagation()
                    }}
                    className={classes.addressIcon}>
                    <NewTabIcon color={colors.invariant.text} height={10} />
                  </a>
                </TooltipHover>
              </>
            )}
          </Box>

          {tokenX && tokenY && (
            <Box display='flex' alignItems='center' gap='8px' mt={1}>
              <Box className={classes.iconContainer}>
                <img className={classes.icon} src={tokenX.logoURI} alt={tokenX.symbol} />
                <TooltipHover title='Reverse tokens'>
                  <ReverseTokensIcon className={classes.reverseTokensIcon} />
                </TooltipHover>
                <img className={classes.icon} src={tokenY.logoURI} alt={tokenY.symbol} />
              </Box>

              <Typography className={classes.tickerContainer}>
                {tokenX.symbol} - {tokenY.symbol}
              </Typography>
            </Box>
          )}
        </Box>
        <FeeSelector
          onSelect={selectFeeTier}
          feeTiers={feeTiers}
          currentFeeIndex={feeTierIndex}
          promotedPoolTierIndex={promotedPoolTierIndex}
          feeTiersWithTvl={feeTiersWithTvl}
          totalTvl={totalTvl}
        />
      </Box>
      <Box display='flex' flexDirection='column' justifyContent='flex-end'>
        <Typography color={colors.invariant.textGrey} style={typography.body2} textAlign='right'>
          Action
        </Typography>
        <Box display='flex' alignItems='center' gap='8px' mt={'12px'}>
          <button className={classes.actionButton} onClick={handleOpenPosition}>
            <img width={32} src={plusIcon} alt={'Open'} />
          </button>
          <button className={classes.actionButton} onClick={handleOpenSwap}>
            <img width={32} src={horizontalSwapIcon} alt={'Exchange'} />
          </button>
        </Box>
      </Box>
    </Box>
  )
}

export default ChartUpperSection
