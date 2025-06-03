import React from 'react'
import { Grid, Skeleton, Typography, useMediaQuery } from '@mui/material'
import Slider from 'react-slick'
import { ExposureTooltipTitle } from './ExposureTooltipTitle/ExposureTooltipTitle'
import useStyles from './styles'
import { theme, typography } from '@static/theme'
import { ITotalEntry } from '@store/reducers/leaderboard'
import { BN } from '@coral-xyz/anchor'
import { printBN } from '@utils/utils'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'
import { BlurOverlay } from '../YourProgress/BlurOverlay'
import { checkIcon, infoIcon, navLeftIcon, navRightIcon } from '@static/icons'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import cryptara from '@static/png/exposure/cryptara.webp'
import celestialMammothIcon from '@static/png/exposure/celestialMammoth.webp'
import edasIcon from '@static/png/exposure/edas.webp'
import turboTapIcon from '@static/png/exposure/turboTap.webp'
import ensofiIcon from '@static/png/exposure/ensofi.webp'
import allDomainsIcon from '@static/png/exposure/allDomains.webp'
import nucleusIcon from '@static/png/exposure/nucleus.webp'

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

  const EDAS_TASKS = [
    {
      title: 'Reach TOP 1000',
      max: 1000,
      current: currentRanking,
      description: (
        <Grid
          sx={{
            '& p': {
              ...typography.body2
            }
          }}
          container
          direction='column'>
          <Typography>
            DeFAI agents have arrived! Climb into the TOP 1000 and start earning points in the EDAS
            Points Program every two weeks!
          </Typography>
        </Grid>
      ),

      footerDescription: 'EDAS Points every 2 weeks',
      completed: userStats ? currentRanking <= 1000 : false
    }
  ]

  const ENSOFI_TASKS = [
    {
      title: 'Reach TOP 1000',
      max: 1000,
      current: currentRanking,
      description: (
        <Grid
          sx={{
            '& p': {
              ...typography.body2
            }
          }}
          container
          direction='column'>
          <Typography>
            Make it to the TOP 1000 and enjoy rewards in the EnsoFi Points Program every two weeks.
          </Typography>
        </Grid>
      ),

      footerDescription: 'EnsoFi Points every 2 weeks',
      completed: userStats ? currentRanking <= 1000 : false
    }
  ]

  const ALLDOMAINS_TASKS = [
    {
      title: 'Reach TOP 2000',
      max: 2000,
      current: currentRanking,
      description:
        'The biggest domain service on Eclipse is here! Join the TOP 2000 and earn AllDomains Points every 2 weeks!',
      footerDescription: '210 AllDomains Points every 2 weeks',
      completed: userStats ? currentRanking <= 2000 : false
    }
  ]
  const TURBOTAP_TASKS = [
    {
      title: 'Earn 25,000 points on Invariant',
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
    }
  ]
  const NUCLEUS_TASKS = [
    {
      title: 'Keep an active tETH position',
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
  const CELESTIAL_TASKS = [
    {
      title: 'Reach TOP 3000',
      max: 3000,
      current: currentRanking,
      description: (
        <Grid
          sx={{
            '& p': {
              ...typography.body2
            }
          }}
          container
          direction='column'>
          <Typography>
            Will you unfreeze your mammoth? Reach the TOP 3000 and earn passive ICE daily in the
            Frost Mammoth game!
          </Typography>
        </Grid>
      ),

      footerDescription: '150 ICE every 24h',
      completed: userStats ? currentRanking <= 3000 : false
    }
  ]
  const CRYPTARA_TASKS = [
    {
      title: 'Reach TOP 1000',
      max: 1000,
      current: currentRanking,
      description:
        'Survived the dungeon? Reach the TOP 1000 to unlock legendary boosts in Cryptara Conquest!',
      footerDescription: '10% discount, 10% speed boosts \n and 10% health boosts',
      completed: userStats ? currentRanking <= 1000 : false
    },
    {
      title: 'Reach TOP 3000',
      max: 3000,
      current: currentRanking,
      description:
        'Enter the Dungeons! Reach the TOP 3000 to unlock master-level boosts in Cryptara Conquest!',
      footerDescription: '6.9% discount, 6.9% speed boosts and 6.9% health boosts',
      completed: userStats ? currentRanking <= 3000 : false
    }
  ]
  const projects = [
    {
      id: 'EDAS_official',
      link: 'https://www.edas.ensofi.xyz/',
      img: edasIcon,
      tasks: EDAS_TASKS,
      completedAll: EDAS_TASKS.every(task => task.completed)
    },

    {
      id: 'EnsoFi',
      link: 'https://app.ensofi.xyz/',
      img: ensofiIcon,
      tasks: ENSOFI_TASKS,
      completedAll: ENSOFI_TASKS.every(task => task.completed)
    },

    {
      id: 'AllDomains',
      link: 'https://eclipse.alldomains.id/',
      img: allDomainsIcon,
      tasks: ALLDOMAINS_TASKS,
      completedAll: ALLDOMAINS_TASKS.every(task => task.completed)
    },

    {
      id: 'Turbo Tap',
      link: 'https://tap.eclipse.xyz/',
      img: turboTapIcon,
      tasks: TURBOTAP_TASKS,
      completedAll: TURBOTAP_TASKS.every(task => task.completed)
    },
    {
      id: 'Nucleus',
      link: 'https://app.nucleusearn.io/dashboard',
      img: nucleusIcon,
      tasks: NUCLEUS_TASKS,
      completedAll: NUCLEUS_TASKS.every(task => task.completed)
    },
    {
      id: 'CelestialMammoth',
      link: 'https://linktr.ee/celestialmmammoth',
      img: celestialMammothIcon,
      tasks: CELESTIAL_TASKS,
      completedAll: CELESTIAL_TASKS.every(task => task.completed)
    },
    {
      id: 'Cryptara Conquest',
      link: 'https://x.com/CryptaraConq',
      img: cryptara,
      tasks: CRYPTARA_TASKS,
      completedAll: CRYPTARA_TASKS.every(task => task.completed)
    }
  ]

  const totalTasks = projects.reduce((acc, project) => acc + project.tasks.length, 0)
  const completedTasks = projects.reduce((acc, project) => {
    return acc + project.tasks.filter(task => task.completed).length
  }, 0)

  const exposure = (completedTasks / totalTasks) * 100

  const { classes } = useStyles({ exposure })
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))

  if (isLoading && isConnected) {
    return (
      <Grid className={classes.mainWrapper}>
        <Grid className={classes.boxWrapper}>
          <Grid className={classes.header}>
            <Typography>
              Eclipse Ecosystem Exposure <img src={infoIcon} alt='info' />
            </Typography>
          </Grid>

          <Grid className={classes.sliderWrapper} gap='20px' justifyContent='center'>
            {Array.from({ length: isSm ? 3 : 4 }).map((_, index) => (
              <Skeleton key={index} variant='rounded' animation='wave' sx={{ borderRadius: '8px' }}>
                <Grid sx={{ width: 64, height: 64 }} />
              </Skeleton>
            ))}
          </Grid>
          <Grid className={classes.expWrapper}>
            <Grid className={classes.skeletonExp}>
              <Typography component='h5'>Your Exposure:</Typography>
              <Skeleton variant='rounded' height={20} animation='wave' sx={{ borderRadius: '8px' }}>
                <Typography component='span'>1/5 (99.99%)</Typography>
              </Skeleton>
            </Grid>

            <Grid className={classes.expLabel}>
              <Typography>0%</Typography>
              <Typography>100%</Typography>
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

  const PrevArrow = ({ className, style, onClick }: any) => (
    <div className={className} style={style} onClick={onClick}>
      <img src={navLeftIcon} alt='prev' />
    </div>
  )

  const NextArrow = ({ className, style, onClick }: any) => (
    <div className={className} style={style} onClick={onClick}>
      <img src={navRightIcon} alt='next' />
    </div>
  )

  return (
    <Grid className={classes.mainWrapper}>
      <Grid sx={{ position: 'relative' }} className={classes.boxWrapper}>
        <BlurOverlay isConnected={isConnected} />
        <Grid className={classes.header}>
          <Typography>Eclipse Ecosystem Exposure</Typography>
          <TooltipHover
            title={
              <Grid className={classes.tooltipTitle}>
                <Typography>
                  By providing liquidity on Invariant, you gain exposure to top projects on Eclipse.
                  Complete the challenges, and claim your rewards!
                </Typography>
              </Grid>
            }
            gradient
            increasePadding
            placement='bottom'>
            <img src={infoIcon} alt='info' />
          </TooltipHover>
        </Grid>

        <Grid className={classes.sliderWrapper}>
          <Slider
            className={classes.slider}
            slidesToShow={isSm ? 3 : 4}
            infinite={false}
            prevArrow={<PrevArrow />}
            nextArrow={<NextArrow />}>
            {projects.map(tasks => (
              <React.Fragment key={tasks.id}>
                <TooltipHover
                  key={tasks.id}
                  placement='bottom'
                  title={
                    <Grid className={classes.exposureWrapper}>
                      <ExposureTooltipTitle
                        img={tasks.img}
                        tasks={tasks.tasks}
                        id={tasks.id}
                        link={tasks.link}
                      />
                    </Grid>
                  }
                  gradient
                  increasePadding>
                  <Grid
                    sx={{
                      position: 'relative',
                      width: 64,
                      height: 64
                    }}>
                    <img
                      style={{
                        opacity: !tasks.completedAll ? 0.4 : 1,
                        width: 64,
                        height: 64,
                        borderRadius: '6px'
                      }}
                      src={tasks.img}
                      alt={tasks.id}
                    />
                    {tasks.completedAll && (
                      <img src={checkIcon} alt='check icon' className={classes.checkIcon} />
                    )}
                  </Grid>
                </TooltipHover>
              </React.Fragment>
            ))}
          </Slider>
        </Grid>
        <Grid className={classes.expWrapper}>
          <Typography component='h5'>
            Your Exposure:{' '}
            <Typography component='span'>{` ${completedTasks}/${totalTasks} (${exposure}%)`}</Typography>
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
