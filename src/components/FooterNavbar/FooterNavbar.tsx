import { BottomNavigation, BottomNavigationAction, Box, Paper, Typography } from '@mui/material'
import useStyles from './style'
import icons from '@static/icons'

export const FooterNavbar = () => {
  const links = [
    {
      label: 'Swap',
      icon: icons.swapArrows,
      url: '/exchange'
    },
    {
      label: 'Liquidity',
      icon: icons.liquidityIcon,
      url: '/liquidity'
    },
    {
      label: 'Portfolio',
      icon: icons.walletIcon,
      url: '/portfolio'
    },
    {
      label: 'Stats',
      icon: icons.statsIcon,
      url: '/statistics'
    },
    {
      label: 'Points',
      icon: icons.airdrop,
      url: '/points'
    }
  ]
  const { classes } = useStyles()

  return (
    <Box component='footer' className={classes.navbar}>
      {links.map(link => {
        return (
          <Box className={classes.navbox}>
            <img alt={link.label} src={link.icon} className={classes.navImg} />
            <Typography>{link.label}</Typography>
          </Box>
        )
      })}
    </Box>
  )
}

export default FooterNavbar
