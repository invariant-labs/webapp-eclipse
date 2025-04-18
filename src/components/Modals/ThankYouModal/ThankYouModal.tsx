import { Box, Button, Typography } from '@mui/material'
import useStyles from './style'
import { circleDiscordIcon, circleTelegramIcon, eclipseIcon } from '@static/icons'
import { social } from '@static/links'

interface Props {
  hideModal: () => void
}

export const ThankYouModal: React.FC<Props> = ({ hideModal }) => {
  const { classes } = useStyles()
  return (
    <>
      <Box className={classes.background}></Box>
      <Box className={classes.container}>
        <Box className={classes.gradient}>
          <img className={classes.eclipseIcon} src={eclipseIcon} alt='Eclipse icon' />

          <Box className={classes.subheaderWrapper}>
            <Typography className={classes.title}>Thank you</Typography>
            <Typography className={classes.lowerTitle}>
              for using Invariant Faucet on Eclipse!
            </Typography>
          </Box>
          <Typography className={classes.description}>
            We are building much more on Eclipse right now! 👀 <br />
            To stay updated, follow us on our social media.
          </Typography>

          <Box className={classes.subheaderWrapper}>
            <Typography className={classes.lowerTitle}>Join us here!</Typography>

            <Box display='flex' sx={{ gap: 3 }}>
              <a href={social.discord} target='_blank'>
                <img src={circleDiscordIcon} alt='Discord in circle icon' />
              </a>
              <a href={social.telegram} target='_blank'>
                <img src={circleTelegramIcon} alt='Telegram in circle icon' />
              </a>
            </Box>
            <Typography className={classes.description}>and don't forget to</Typography>
            <Button className={classes.button} onClick={() => window.open(social.x, '_blank')}>
              Follow us on X!
            </Button>
          </Box>
          <Button className={classes.transparentButton} disableRipple onClick={hideModal}>
            Close
          </Button>
        </Box>
      </Box>
    </>
  )
}
