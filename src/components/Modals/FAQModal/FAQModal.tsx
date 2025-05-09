import React, { useState } from 'react'
import { Grid, Popover, Typography, Box, Fade } from '@mui/material'
import useStyles from './styles'
import { arrowLeftIcon, arrowRightIcon, sliderIcon } from '@static/icons'

export interface IFAQModal {
  open: boolean
  handleClose: () => void
}

export const FAQModal: React.FC<IFAQModal> = ({ open, handleClose }) => {
  const { classes } = useStyles()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  const faqArray = [
    {
      title: 'Concentration Slider',
      content: (
        <Grid className={classes.contentWrapper}>
          <Typography className={classes.text}>
            The rule is simple - the more concentrated your position is, the more points you earn.
            <br />
            To simplify the process of concentrating your position, we’ve created a feature called
            the "Concentration Slider." Its functionality is straightforward: the higher the
            multiplier, the more concentrated your liquidity becomes within a narrower range.
          </Typography>
          <Grid container justifyContent='center'>
            <img src={sliderIcon} alt='slider' />
          </Grid>
          <Typography className={classes.text}>
            To help you use it effectively, let us explain how it works👉
          </Typography>
        </Grid>
      )
    },
    {
      title: 'What is Concentration?',
      content: (
        <Grid className={classes.contentWrapper}>
          <Typography className={classes.text} mt={3}>
            Concentration refers to focusing liquidity within a specific price range.
          </Typography>
          <Typography className={classes.text}>
            Unlike full-range liquidity (classic AMMs), where liquidity is spread across an infinite
            range (from 0 to ∞), concentrated liquidity narrows this range, making it more efficient
            and effective.
          </Typography>
          <Typography className={classes.text} mb={3}>
            The narrower the range, the higher the concentration and the more impactful your
            liquidity becomes.
          </Typography>
        </Grid>
      )
    },
    {
      title: 'How Does Concentration Impact Points?',
      content: (
        <Grid className={classes.contentWrapper}>
          <Typography className={classes.text}>
            Concentration can significantly boost the points you earn. The scoring system rewards
            efficient positions, and higher concentration means your liquidity works more
            effectively within a tighter range.
          </Typography>
          <Typography className={classes.text}>Example:</Typography>
          <ul>
            <li className={classes.text}>
              <Typography className={classes.text}>
                A $100 position with 2x concentration earns 10 points per day.
              </Typography>
            </li>
            <li className={classes.text}>
              <Typography className={classes.text}>
                The same $100 position with 2000x concentration earns 10,000 points per day.
              </Typography>
            </li>
          </ul>
          <Typography className={classes.text}>
            That’s 1,000x more points in the same timeframe, simply because of higher concentration.
          </Typography>
          <Typography className={classes.text}>
            Think of the multiplier in the Concentration Slider as a guide to how much more your
            position can earn in points.
          </Typography>
        </Grid>
      )
    },
    {
      title: 'How to Use Concentration',
      content: (
        <Grid className={classes.contentWrapper} justifyContent='start'>
          <ol className={classes.olWrapper}>
            <li className={classes.text}>
              <Typography className={classes.text}>
                Start Small: Experiment by setting narrower ranges for your liquidity around the
                current market price.
              </Typography>
            </li>
            <li className={classes.text}>
              <Typography className={classes.text}>
                Monitor Price Movement: Keep an eye on price changes. If the price moves out of your
                range, your position stops earning points and fees. To resume, you&#39;ll need to
                rebalance within the new price range.
              </Typography>
            </li>
            <li className={classes.text}>
              <Typography className={classes.text}>
                Practice Makes Perfect: The most skilled users open and close hundreds of positions
                to refine their strategies.
              </Typography>
            </li>
          </ol>

          <Typography className={classes.text} mt={3}>
            For detailed guides and tips, check out our{' '}
            <a
              className={classes.link}
              href='https://docs.invariant.app/docs/'
              target='_blank'
              rel='noopener noreferrer'>
              docs
            </a>{' '}
            and join the{' '}
            <a
              className={classes.link}
              href='https://discord.gg/w6hTeWTJvG'
              target='_blank'
              rel='noopener noreferrer'>
              Discord
            </a>{' '}
            for support.
          </Typography>
        </Grid>
      )
    }
  ]

  const handleNext = () => {
    setFadeIn(false)
    setTimeout(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % faqArray.length)
      setFadeIn(true)
    }, 200)
  }

  const handlePrevious = () => {
    setFadeIn(false)
    setTimeout(() => {
      setCurrentIndex(prevIndex => (prevIndex - 1 + faqArray.length) % faqArray.length)
      setFadeIn(true)
    }, 200)
  }

  return (
    <div className={classes.modalContainer}>
      <Popover
        open={open}
        marginThreshold={0}
        classes={{
          root: classes.popoverRoot,
          paper: classes.paper
        }}
        onClose={handleClose}>
        <Box className={classes.root}>
          <Grid container justifyContent='space-between' alignItems='center'>
            <div style={{ width: '16px', height: '16px' }} />
            <Typography className={classes.subTitle}>How to make more Points?</Typography>
            <Grid className={classes.topCloseButton} onClick={handleClose}>
              {'\u2715'}
            </Grid>
          </Grid>

          <Grid className={classes.titleContainer}>
            <button className={classes.arrowBtn} onClick={handlePrevious}>
              <img src={arrowLeftIcon} alt='arrow back' />
            </button>
            <Typography className={classes.title}>{faqArray[currentIndex].title}</Typography>
            <button className={classes.arrowBtn} onClick={handleNext}>
              <img src={arrowRightIcon} alt='arrow forward' />
            </button>
          </Grid>

          <Fade in={fadeIn} timeout={200}>
            <div>{faqArray[currentIndex].content}</div>
          </Fade>
        </Box>
      </Popover>
    </div>
  )
}

export default FAQModal
