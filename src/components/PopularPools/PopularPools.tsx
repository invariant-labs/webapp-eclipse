import { Grid, Typography } from '@mui/material'
import { useStyles } from './style'
import { PopularPoolData } from '@containers/PopularPoolsWrapper/PopularPoolsWrapper'
import Card from './Card/Card'
import { NetworkType } from '@store/consts/static'
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { useCallback, useState } from 'react'
import classNames from 'classnames'
import backIcon from '@static/svg/back-arrow-3.svg'

export interface IPopularPools {
  pools: PopularPoolData[]
  isLoading: boolean
  network: NetworkType
  showAPY: boolean
}

const PopularPools: React.FC<IPopularPools> = ({ pools, isLoading, network, showAPY }) => {
  const { classes } = useStyles()

  const [swiperRef, setSwiperRef] = useState<SwiperClass>()

  const handlePrevious = useCallback(() => {
    swiperRef?.slidePrev()
  }, [swiperRef])

  const handleNext = useCallback(() => {
    swiperRef?.slideNext()
  }, [swiperRef])

  return (
    <Grid container mb={6} className={classes.container}>
      <Typography className={classes.title} mb={3}>
        Popular pools
      </Typography>
      <div className={classes.swiperContainer}>
        <Swiper
          slidesPerView='auto'
          spaceBetween={24}
          pagination={{
            clickable: true,
            type: 'bullets',
            el: '.pagination',
            bulletClass: classes.bullet,
            bulletActiveClass: classes.bulletActive,
            horizontalClass: classes.horizontal
          }}
          navigation={{
            nextEl: '.swiper-button-next-unique',
            prevEl: '.swiper-button-prev-unique'
          }}
          modules={[Pagination]}
          className={classes.swiper}
          onSwiper={setSwiperRef}>
          {pools.map(pool => (
            <SwiperSlide className={classes.slide}>
              <Card
                addressFrom={pool.addressFrom}
                addressTo={pool.addressTo}
                iconFrom={pool.iconFrom}
                iconTo={pool.iconTo}
                volume={pool.volume}
                TVL={pool.TVL}
                fee={pool.fee}
                symbolFrom={pool.symbolFrom}
                symbolTo={pool.symbolTo}
                apy={pool.apy}
                apyData={pool.apyData}
                isUnknownFrom={pool.isUnknownFrom}
                isUnknownTo={pool.isUnknownTo}
                isLoading={isLoading}
                network={network}
                showAPY={showAPY}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className={classes.pagination}>
          <div className='pagination'></div>
        </div>
        <div
          className={classNames(
            'swiper-button-next-unique',
            classes.controlButton,
            classes.controlButtonPrev
          )}
          onClick={handlePrevious}>
          <img src={backIcon} alt='Arrow image' />
        </div>
        <div
          className={classNames(
            'swiper-button-next-unique',
            classes.controlButton,
            classes.controlButtonNext
          )}
          onClick={handleNext}>
          <img className={classes.controlButtonNextImage} src={backIcon} alt='Arrow image' />
        </div>
      </div>
    </Grid>
  )
}

export default PopularPools
