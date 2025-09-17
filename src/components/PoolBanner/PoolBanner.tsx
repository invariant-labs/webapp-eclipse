import { Box, Grid, useMediaQuery } from '@mui/material'
import useStyles from './style'
import NewPoolSection from './NewPoolSection/NewPoolSection'
import PoolInfoSection from './PoolInfoSection/PoolInfoSection'
import { ClaimSection } from './ClaimSection/ClaimSection'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { PoolBannerItem } from '@store/consts/types'
import { theme } from '@static/theme'

export interface IPoolBanner {
  handleOpenPosition: () => void
  toggleAddToFavourites: () => void
  handleClaim: () => void
  pools: PoolBannerItem[]
  isLoading: boolean
}

const PoolBanner: React.FC<IPoolBanner> = ({
  handleOpenPosition,
  toggleAddToFavourites,
  handleClaim,
  pools,
  isLoading
}) => {
  const { classes } = useStyles()
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Grid className={classes.wrapper}>
      <div className={classes.cardsContainer}>
        <Slider
          dots={true}
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
          verticalSwiping={!isMd}>
          {pools.map((pool, index) => {
            return (
              (isLoading || !isLoading) && (
                <Box key={index}>
                  <Grid className={classes.leftBannerWrapper}>
                    <NewPoolSection handleOpenPosition={handleOpenPosition} pool={pool} />
                    <PoolInfoSection
                      poolDistribute={pool.poolDistribute}
                      toggleAddToFavourites={toggleAddToFavourites}
                      userEarn={pool.userEarn}
                      isFavourite={pool.isFavourite}
                    />
                  </Grid>
                </Box>
              )
            )
          })}
        </Slider>
      </div>

      <Grid className={classes.rightBannerWapper}>
        <ClaimSection handleClaim={handleClaim} />
      </Grid>
    </Grid>
  )
}

export default PoolBanner
