import React from 'react'
import { Grid, Skeleton, Typography, useMediaQuery } from '@mui/material'
import Slider from 'react-slick'
import allDomains from '@static/svg/allDomains.svg'
import turboTap from '@static/svg/turboTap.svg'
import nucleus from '@static/svg/nucleus.svg'
import infoIcon from '@static/svg/info.svg'
import navRight from '@static/svg/navRight.svg'
import navLeft from '@static/svg/navLeft.svg'
import { TooltipGradient } from '@components/TooltipHover/TooltipGradient'
import { ExposureTooltipTitle } from './ExposureTooltipTitle/ExposureTooltipTitle'
import useStyles from './styles'
import { theme, typography } from '@static/theme'
import { ITotalEntry } from '@store/reducers/leaderboard'
import { BN } from '@coral-xyz/anchor'
import { printBN } from '@utils/utils'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'
import check from '@static/svg/checkFill.svg'
import { BlurOverlay } from '../YourProgress/BlurOverlay'

interface EcosystemExposureI {
  isLoading: boolean
  userStats: ITotalEntry | null
  hasTETHPosition: boolean
  totalItems: number
  isConnected: boolean
}

export const EcosystemExposure: React.FC<EcosystemExposureI> = ({
  userStats,
  hasTETHPosition,
  totalItems,
  isConnected,
  isLoading
}) => {
  const currentRanking = userStats?.rank ?? (isConnected ? totalItems + 1 : 0)
  const currentPoints = userStats?.points
    ? Number(printBN(new BN(userStats.points, 'hex'), LEADERBOARD_DECIMAL)).toFixed(2)
    : 0

  const tasks = [
    {
      id: 'AllDomains',
      link: 'https://eclipse.alldomains.id/',
      title: 'Reach TOP2000',
      a: 'AllDomains',
      img: allDomains,
      max: 2000,
      current: currentRanking,
      description:
        'The biggest domain service on Eclipse is here! Join the TOP 2000 and earn AllDomains Points every 2 weeks!',
      footerDescription: '210 AllDomains Points every 2 weeks',
      completed: userStats ? currentRanking <= 2000 : false
    },

    {
      id: 'Turbo Tap',
      link: 'https://tap.eclipse.xyz/',
      title: 'Earn 25,000 points on Invariant',
      img: turboTap,
      max: 25000,
      current: +currentPoints >= 25000 ? 25000 : +currentPoints,
      description: (
        <>
          Earn 25,000 points on Invariant to get a permanent +10% passive grass boost on <br />{' '}
          Turbo Tap!
        </>
      ),
      footerDescription: '+10% Passive Grass permanent',
      completed: +currentPoints >= 25000
    },
    {
      id: 'Nucleus',
      link: 'https://app.nucleusearn.io/dashboard',
      title: 'Keep an active tETH position',
      img: nucleus,
      max: 1,
      current: hasTETHPosition ? 1 : 0,
      description: (
        <Grid
          sx={{
            '& p': {
              ...typography.body2
            }
          }}
          container
          direction='column'>
          <Typography>Every tETH provider earns Nucleus Points!</Typography>
          <Typography>Open your tETH position to start earning!</Typography>
          <Typography>Rewarded pools:</Typography>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>tETH/ETH 0.01%</li>
            <li>tETH/USDC 0.09%</li>
          </ul>
        </Grid>
      ),

      footerDescription: 'Nucleus Points',
      completed: hasTETHPosition
    }
  ]

  const completedCount = tasks.filter(task => task.completed).length
  const exposure = Number(((completedCount / tasks.length) * 100).toFixed(2))

  const { classes } = useStyles({ exposure })
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))

  if (isLoading) {
    return (
      <Grid className={classes.mainWrapper}>
        <Grid className={classes.boxWrapper}>
          <BlurOverlay isConnected={isConnected} />
          <Grid className={classes.header}>
            <Skeleton variant='rounded' animation='wave' sx={{ borderRadius: '8px' }}>
              <Typography>
                Eclipse Ecosystem Exposure <img src={infoIcon} alt='info' />
              </Typography>
            </Skeleton>
          </Grid>

          <Grid className={classes.sliderWrapper} gap='20px' justifyContent='center'>
            {Array.from({ length: 3 }).map(_ => (
              <Skeleton variant='rounded' animation='wave' sx={{ borderRadius: '8px' }}>
                <Grid sx={{ width: 64, height: 64 }} />
              </Skeleton>
            ))}
          </Grid>
          <Grid className={classes.expWrapper}>
            <Skeleton variant='rounded' animation='wave' sx={{ borderRadius: '8px' }}>
              <Typography component='h5'>
                Your Exposure: <Typography component='span'>99.99%</Typography>
              </Typography>
            </Skeleton>
            <Grid className={classes.expLabel}>
              <Skeleton variant='rounded' animation='wave' sx={{ borderRadius: '8px' }}>
                <Typography>100%</Typography>
              </Skeleton>
              <Skeleton variant='rounded' animation='wave' sx={{ borderRadius: '8px' }}>
                <Typography>100%</Typography>
              </Skeleton>
            </Grid>
            <Skeleton
              variant='rounded'
              animation='wave'
              sx={{ borderRadius: '8px', width: '100%', height: '28px' }}
            />
          </Grid>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid className={classes.mainWrapper}>
      <Grid sx={{ position: 'relative' }} className={classes.boxWrapper}>
        <BlurOverlay isConnected={isConnected} />
        <Grid className={classes.header}>
          <Typography>Eclipse Ecosystem Exposure</Typography>
          <TooltipGradient
            top={1}
            title={
              <Grid className={classes.tooltipTitle}>
                <Typography>
                  By providing liquidity on Invariant, you gain exposure to top projects on Eclipse.
                  Complete the challenges, and claim your rewards!
                </Typography>
              </Grid>
            }>
            <img src={infoIcon} alt='info' />
          </TooltipGradient>
        </Grid>

        <Grid className={classes.sliderWrapper}>
          <Slider
            className={classes.slider}
            slidesToShow={isSm ? 3 : 4}
            infinite={false}
            prevArrow={<img src={navLeft} alt='prev' />}
            nextArrow={<img src={navRight} alt='next' />}>
            {tasks.map(task => (
              <TooltipGradient
                key={task.id}
                top={1}
                title={
                  <Grid display='flex' flexDirection='column' gap='10px'>
                    <ExposureTooltipTitle
                      title={task.title}
                      img={task.img}
                      max={task.max}
                      current={task.current}
                      description={task.description}
                      footerDescription={task.footerDescription}
                      completed={task.completed}
                      id={task.id}
                      link={task.link}
                    />
                  </Grid>
                }>
                <Grid sx={{ position: 'relative', width: 64, height: 64 }}>
                  <img
                    style={{
                      opacity: !task.completed ? 0.4 : 1
                    }}
                    src={task.img}
                    alt={task.title}
                  />
                  {task.completed && (
                    <img src={check} alt='check icon' className={classes.checkIcon} />
                  )}
                </Grid>
              </TooltipGradient>
            ))}
          </Slider>
        </Grid>
        <Grid className={classes.expWrapper}>
          <Typography component='h5'>
            Your Exposure: <Typography component='span'>{exposure}%</Typography>
          </Typography>
          <Grid className={classes.expLabel}>
            <Typography>0%</Typography>
            <Typography>100%</Typography>
          </Grid>
          <Grid className={classes.darkBackground}>
            <Grid className={classes.gradientProgress} style={{ width: `${exposure}%` }} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
