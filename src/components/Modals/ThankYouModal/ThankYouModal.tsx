import { Box, Button, Typography } from '@material-ui/core'
import useStyles from './style'
import icons from '@static/icons'

export const ThankYouModal: React.FC = () => {
  const classes = useStyles()

  return (
    <>
      <Box className={classes.background}></Box>
      <Box className={classes.container}>
        {/* @ts-expect-error */}
        <Box display='flex' flexDirection='column' alignItems='center' sx={{ gap: 16 }}>
          <Typography className={classes.title}>Thank you</Typography>
          <Typography className={classes.lowerTitle}>
            for using Invariant Faucet on Eclipse!
          </Typography>
        </Box>
        <Typography className={classes.description}>
          We are building much more on Eclipse right now! 👀 <br />
          To stay updated, follow us on our social media.
        </Typography>
        {/* @ts-expect-error */}
        <Box display='flex' flexDirection='column' alignItems='center' sx={{ gap: 16 }}>
          <Typography className={classes.lowerTitle}>Join us here!</Typography>
          {/* @ts-expect-error */}
          <Box display='flex' sx={{ gap: 24 }}>
            <img src={icons.circleDiscord} alt='Discord in circle icon' />
            <img src={icons.circleTelegram} alt='Telegram in circle icon' />
          </Box>
          <Typography className={classes.description}>and don't forget to</Typography>
          <Button className={classes.button}>Follow us on X!</Button>
        </Box>
        <Button className={classes.transparentButton} disableRipple>
          Close
        </Button>
      </Box>
    </>
  )
}
