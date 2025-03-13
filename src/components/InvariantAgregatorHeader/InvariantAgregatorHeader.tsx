import useStyles from './style'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import HeaderLogo from '@static/png/InvariantAggregator/header-logo.png'
import SolarLogo from '@static/png/InvariantAggregator/solar.png'
import LifinityLogo from '@static/png/InvariantAggregator/lifinity.png'
import OrcaLogo from '@static/png/InvariantAggregator/Orca.png'
import UmbraLogo from '@static/png/InvariantAggregator/umbra.png'
import InvariantLogo from '@static/png/InvariantAggregator/Invariant.png'

const InvariantAgregatorHeader = () => {
  const { classes } = useStyles()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const logos = [
    { src: SolarLogo, alt: 'Solar' },
    { src: LifinityLogo, alt: 'Lifinity' },
    { src: OrcaLogo, alt: 'Orca' },
    { src: UmbraLogo, alt: 'Umbra' },
    { src: InvariantLogo, alt: 'Invariant' }
  ]

  return (
    <Box className={classes.container}>
      <Box className={classes.header_logo_wrapper}>
        <img src={HeaderLogo} alt='Header Logo' style={{ maxHeight: isMobile ? '24px' : '32px' }} />
      </Box>
      <Box className={classes.item_wrapper}>
        {logos.map((logo, index) => (
          <Box key={index} className={classes.item}>
            <img src={logo.src} alt={logo.alt} />
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default InvariantAgregatorHeader
