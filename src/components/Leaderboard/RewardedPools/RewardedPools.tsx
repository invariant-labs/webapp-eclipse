import { Box, Skeleton, Typography, useMediaQuery } from '@mui/material'
import useStyles from './styles'
import React, { useMemo } from 'react'
import PoolList from './PoolList/PoolList'
import { NetworkType } from '@store/consts/static'
import { VariantType } from 'notistack'
import icons from '@static/icons'
import { ExtendedPoolStatsData } from '@store/selectors/stats'
import { colors, theme, typography } from '@static/theme'
import infoIcon from '@static/svg/info.svg'
import { TooltipGradient } from '@common/TooltipHover/TooltipGradient'

export interface ExtendedPoolStatsDataWithPoints extends ExtendedPoolStatsData {
  pointsPerSecond: string
}
interface IProps {
  network: NetworkType
  copyAddressHandler: (message: string, variant: VariantType) => void
  rewardedPoolsData: ExtendedPoolStatsDataWithPoints[]
}

export const RewardedPools: React.FC<IProps> = ({
  network,
  copyAddressHandler,
  rewardedPoolsData
}: IProps) => {
  const { classes } = useStyles()
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  const data = useMemo(
    () =>
      rewardedPoolsData.map(poolData => {
        return {
          symbolFrom: poolData.tokenXDetails?.symbol ?? poolData.tokenX.toString(),
          symbolTo: poolData.tokenYDetails?.symbol ?? poolData.tokenY.toString(),
          iconFrom: poolData.tokenXDetails?.logoURI ?? icons.unknownToken,
          iconTo: poolData.tokenYDetails?.logoURI ?? icons.unknownToken,
          volume: poolData.volume24,
          TVL: poolData.tvl,
          fee: poolData.fee,
          lockedX: poolData.lockedX,
          lockedY: poolData.lockedY,
          liquidityX: poolData.liquidityX,
          liquidityY: poolData.liquidityY,
          addressFrom: poolData.tokenX.toString(),
          addressTo: poolData.tokenY.toString(),
          apy: poolData.apy,

          apyData: {
            fees: poolData.apy,
            accumulatedFarmsSingleTick: 0,
            accumulatedFarmsAvg: 0
          },
          isUnknownFrom: poolData.tokenXDetails?.isUnknown ?? false,
          isUnknownTo: poolData.tokenYDetails?.isUnknown ?? false,
          poolAddress: poolData.poolAddress.toString(),
          pointsPerSecond: poolData.pointsPerSecond
        }
      }),
    [rewardedPoolsData]
  )
  const mobileStyle = {
    ...(isMd && {
      backgroundColor: `${colors.invariant.component}`,
      borderRadius: '14px',
      padding: '24px 0px 0px'
    })
  }
  return (
    <>
      <Typography className={classes.leaderboardHeaderSectionTitle}>Rewarded Pools</Typography>
      {data.length === 0 ? (
        <Skeleton variant='rounded' animation='wave' className={classes.skeleton} />
      ) : (
        <Box className={classes.sectionContent} width={'100%'} style={mobileStyle}>
          {isMd && (
            <Box
              style={{
                width: '100%',

                borderBottom: `1px solid ${colors.invariant.light}`
              }}>
              <Typography
                style={{
                  paddingLeft: '42px',
                  marginBottom: '16px',
                  ...typography.heading4,
                  color: colors.invariant.textGrey,
                  justifySelf: 'self-start'
                }}>
                Pools Distributing Points
                <TooltipGradient
                  title={
                    <div style={{ maxWidth: 250 }} onClick={e => e.stopPropagation()}>
                      List of pools currently distributing points. Updates on new pools will be
                      announced on our{' '}
                      <a
                        href='https://x.com/invariant_labs'
                        target='_blank'
                        rel='noopener noreferrer'
                        style={{
                          color: 'inherit',
                          textDecoration: 'underline',
                          pointerEvents: 'auto'
                        }}>
                        X
                      </a>
                      .
                    </div>
                  }
                  placement='bottom'
                  top={1}>
                  <img src={infoIcon} alt='i' width={14} style={{ marginLeft: '8px' }} />
                </TooltipGradient>
              </Typography>
            </Box>
          )}

          <PoolList
            disableBackground={isMd}
            data={data}
            network={network}
            copyAddressHandler={copyAddressHandler}
            isLoading={false}
            showAPY={true}
          />
        </Box>
      )}
    </>
  )
}
