import React from 'react'
import { Grid, Typography, useMediaQuery } from '@mui/material'
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
import { theme } from '@static/theme'
import { ITotalEntry } from '@store/reducers/leaderboard'
import { BN } from '@coral-xyz/anchor'
import { printBN } from '@utils/utils'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'

interface EcosystemExposureI {
  userStats: ITotalEntry | null
  hasTETHPosition: boolean
}

export const EcosystemExposure: React.FC<EcosystemExposureI> = ({ userStats, hasTETHPosition }) => {
  const currentRanking = userStats?.rank ?? Infinity
  const currentPoints = userStats?.points
    ? Number(printBN(new BN(userStats.points, 'hex'), LEADERBOARD_DECIMAL)).toFixed(2)
    : 0

  const tasks = [
    {
      id: 'alldomains',
      title: 'Reach TOP2000',
      img: allDomains,
      max: 2000,
      current: currentRanking,
      description:
        'The biggest domain service on Eclipse is here! Join the TOP 2000 and earn AllDomains Points every 2 weeks!',
      footerDescription: '210 AllDomains Points every 2 weeks',
      completed: userStats ? currentRanking <= 2000 : false
    },
    {
      id: 'turboTap',
      title: 'Earn 25,000 points on Invariant',
      img: turboTap,
      max: 25000,
      current: +currentPoints >= 25000 ? 25000 : +currentPoints,
      description:
        'Earn 25,000 points on Invariant to get a permanent +10% passive grass boost on Turbo Tap!',
      footerDescription: '+10% Passive Grass permanent',
      completed: +currentPoints >= 25000
    },
    {
      id: 'nucleus',
      title: 'Keep an active tETH position',
      img: nucleus,
      max: 1,
      current: hasTETHPosition ? 1 : 0,
      description:
        'Every tETH provider earns Nucleus Points! Open your tETH position to start earning!',
      footerDescription: 'Nucleus Points',
      completed: hasTETHPosition
    }
  ]

  const completedCount = tasks.filter(task => task.completed).length
  const exposure = Number(((completedCount / tasks.length) * 100).toFixed(2))

  const { classes } = useStyles({ exposure })
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Grid className={classes.mainWrapper}>
      <Typography>Ecosystem Exposure</Typography>
      <Grid className={classes.boxWrapper}>
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
                    />
                  </Grid>
                }>
                <img className={classes.sliderItem} src={task.img} alt={task.title} />
              </TooltipGradient>
            ))}
          </Slider>
        </Grid>
        <Grid className={classes.expWrapper}>
          <Grid className={classes.expLabel}>
            <Typography>Your Exposure</Typography>
            <Typography>{exposure}%</Typography>
          </Grid>
          <Grid className={classes.darkBackground}>
            <Grid className={classes.gradientProgress} style={{ width: `${exposure}%` }} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
