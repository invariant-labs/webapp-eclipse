import { Box, Grid, Typography } from '@mui/material'
import useStyles from './styles'
import GradientBorder from '@common/GradientBorder/GradientBorder'
import { airdropRainbowIcon, checkIcon, newTabIcon } from '@static/icons'
import React from 'react'
interface task {
  footerDescription: string
  description: React.ReactNode | string
  completed: boolean
  current: number
  title: string
  max: number
}

interface ExposureTooltipTitleProps {
  link?: string
  img: string
  id: string
  tasks: task[]
}

export const ExposureTooltipTitle: React.FC<ExposureTooltipTitleProps> = ({
  tasks,
  link,
  img,
  id
}) => {
  const { classes } = useStyles()

  return (
    <Grid className={classes.tooltipWrapper}>
      {tasks.map((task, index) => {
        return (
          <React.Fragment key={index}>
            <Grid className={classes.header}>
              <img height={50} src={img} alt='project logo' />
              <Grid className={classes.title}>
                <Typography>{task.title}</Typography>
                {index === 0 && (
                  <>
                    <Typography
                      component='a'
                      className={classes.link}
                      href={link}
                      target='_blank'
                      rel='noopener noreferrer'>
                      {id}
                    </Typography>
                    <img src={newTabIcon} className={classes.newTabIcon} />
                  </>
                )}
                <Grid className={classes.progressWrapper}>
                  <img
                    style={{
                      filter: !task.completed ? 'grayscale(100%)' : 'none',
                      opacity: !task.completed ? 0.2 : 1
                    }}
                    src={checkIcon}
                    alt='check icon'
                  />
                  <Typography>
                    {`${task.current === Infinity || task.current == null ? '- ' : task.current}/${task.max}`}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Box className={classes.description}>{task.description}</Box>
            <Grid width='fit-content'>
              <GradientBorder borderWidth={1} borderRadius={8}>
                <Grid className={classes.footer}>
                  <img src={airdropRainbowIcon} alt='airdrop icon' />
                  <Typography>{task.footerDescription}</Typography>
                </Grid>
              </GradientBorder>
            </Grid>

            {tasks.length > 1 && index < tasks.length - 1 && <Grid className={classes.separator} />}
          </React.Fragment>
        )
      })}
    </Grid>
  )
}
