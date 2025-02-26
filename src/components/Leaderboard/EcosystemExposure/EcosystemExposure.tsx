import { Grid, Typography, useMediaQuery } from '@mui/material'
import useStyles from './styles'
import infoIcon from '@static/svg/info.svg'
import navRight from '@static/svg/navRight.svg'
import navLeft from '@static/svg/navLeft.svg'
import { TooltipGradient } from '@components/TooltipHover/TooltipGradient'
import Slider from 'react-slick'
import { theme } from '@static/theme'
import { ExposureTooltipTitle } from './ExposureTooltipTitle/ExposureTooltipTitle'
import { mockedData } from './mock'
import React from 'react'
export const EcosystemExposure = () => {
  const exposure = 52.4
  const { classes } = useStyles({ exposure })
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <Grid className={classes.mainWrapper}>
      <Typography>Ecosystem Exposure</Typography>
      <Grid className={classes.boxWrapper}>
        <Grid className={classes.header}>
          <Typography>Eclipse Ecosystem Exposure</Typography>
          <TooltipGradient title='By providing liquidity on Invariant, you gain exposure to top projects on Eclipse. Complete the challenges, and claim your rewards!'>
            <img src={infoIcon} alt='info' />
          </TooltipGradient>
        </Grid>
        <Grid className={classes.sliderWrapper}>
          <Slider
            className={classes.slider}
            slidesToShow={isSm ? 3 : 4}
            infinite={false}
            prevArrow={<img src={navLeft} />}
            nextArrow={<img src={navRight} />}>
            {mockedData.map(projects => (
              <TooltipGradient
                title={
                  <Grid display='flex' flexDirection='column' gap='10px'>
                    {projects.map((project, index) => (
                      <React.Fragment key={index}>
                        <ExposureTooltipTitle
                          title={project.title}
                          img={project.img}
                          max={project.max}
                          current={project.current}
                          description={project.description}
                          footerDescription={project.footerDescription}
                        />
                        {projects.length > 1 && index < projects.length - 1 && (
                          <Grid className={classes.separator} />
                        )}
                      </React.Fragment>
                    ))}
                  </Grid>
                }>
                <img className={classes.sliderItem} src={projects[0].img} alt='logo' />
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
            <Grid className={classes.gradientProgress} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
