import { Box, Grid, useMediaQuery } from '@mui/material'
import useStyles from './style'
import NewPoolSection from './NewPoolSection/NewPoolSection'
import PoolInfoSection from './PoolInfoSection/PoolInfoSection'
import { ClaimSection } from './ClaimSection/ClaimSection'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { theme } from '@static/theme'
import { useState } from 'react'
import { UserPoints } from '@store/reducers/xInvt'
import { ConvertedPool } from '@containers/LockWrapper/LockWrapper'

export interface IXInvtFarm {
  handleOpenPosition: (pool: ConvertedPool) => void
  switchFavouritePool: (poolAddress: string) => void
  handleClaim: (pool: ConvertedPool) => void
  pools: ConvertedPool[]
  configLoading: boolean
  userEarnLoading: boolean
  claimPointsLoading: boolean
  userPointsState: UserPoints
  walletConnected: boolean
}

const XInvtFarm: React.FC<IXInvtFarm> = ({
  handleOpenPosition,
  switchFavouritePool,
  handleClaim,
  pools,
  configLoading,
  userEarnLoading,
  claimPointsLoading,
  walletConnected,
  userPointsState
}) => {
  const { classes } = useStyles()
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  const [currentPoolIndex, setCurrentPoolIndex] = useState(0)

  return (
    <Grid className={classes.wrapper}>
      <div className={classes.cardsContainer}>
        {pools.length ? (
          <Slider
            dots={pools.length > 1}
            draggable={false}
            touchMove={isMd}
            speed={500}
            slidesToShow={1}
            slidesToScroll={1}
            pauseOnHover={true}
            arrows={false}
            autoplay={true}
            autoplaySpeed={5000}
            className={classes.slider}
            dotsClass={`slick-dots ${classes.dots}`}
            appendDots={dots => <ul>{dots}</ul>}
            rows={1}
            fade={true}
            vertical={!isMd}
            verticalSwiping={!isMd}
            beforeChange={(_current, next) => setCurrentPoolIndex(next)}>
            {pools.map((pool, index) => {
              return (
                <Box key={index}>
                  <Grid className={classes.leftBannerWrapper}>
                    <NewPoolSection
                      handleOpenPosition={handleOpenPosition}
                      pool={pool}
                      isLoading={configLoading}
                    />
                    <PoolInfoSection
                      switchFavouritePool={() => {
                        if (pool === null) return

                        switchFavouritePool(pool.poolAddress)
                      }}
                      pool={pool}
                      configLoading={configLoading}
                      userEarnLoading={userEarnLoading}
                      walletConnected={walletConnected}
                    />
                  </Grid>
                </Box>
              )
            })}
          </Slider>
        ) : (
          <Grid container pt={'1px'} pb={'1px'}>
            <Grid className={classes.leftBannerWrapper}>
              <NewPoolSection
                handleOpenPosition={handleOpenPosition}
                pool={null}
                isLoading={configLoading}
              />
              <PoolInfoSection
                switchFavouritePool={() => {}}
                pool={null}
                configLoading={configLoading}
                userEarnLoading={userEarnLoading}
                walletConnected={walletConnected}
              />
            </Grid>
          </Grid>
        )}
      </div>

      <Grid className={classes.rightBannerWapper}>
        <ClaimSection
          handleClaim={() => handleClaim(pools[currentPoolIndex])}
          userPointsState={userPointsState}
          isLoading={claimPointsLoading}
          walletConnected={walletConnected}
        />
      </Grid>
    </Grid>
  )
}

export default XInvtFarm
