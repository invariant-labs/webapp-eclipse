import { Box, Typography } from '@mui/material'
import useStyles from './style'
import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import icons from '@static/icons'
import { NetworkType } from '@store/consts/static'
import { useSelector } from 'react-redux'
import { network } from '@store/selectors/solanaConnection'
import { colors } from '@static/theme'

export const FooterNavbar = () => {
  const typeOfNetwork = useSelector(network)

  const links = [
    {
      label: 'Swap',
      icon: icons.swapArrows,
      url: 'exchange',
      width: 33
    },
    {
      label: 'Liquidity',
      icon: icons.liquidityIcon,
      url: 'liquidity',
      width: 20
    },
    {
      label: 'Portfolio',
      icon: icons.walletIcon,
      url: 'portfolio',
      width: 26
    },

    typeOfNetwork === NetworkType.Testnet
      ? {
          label: 'Creator',
          icon: icons.tokenCreator,
          url: 'creator',
          width: 33
        }
      : {
          label: 'Points',
          icon: icons.airdrop,
          url: 'points',
          width: 26
        },
    {
      label: 'Stats',
      icon: icons.statsIcon,
      url: 'statistics',
      width: 30
    }
  ]

  const location = useLocation()
  const landing = location.pathname.substring(1)

  const { classes } = useStyles()
  const [activePath, setActive] = useState('exchange')

  useEffect(() => {
    setActive(landing)
  }, [landing])

  const otherRoutesToHighlight: Record<string, RegExp[]> = {
    liquidity: [/^liquidity\/*/],
    exchange: [/^exchange\/*/],
    portfolio: [/^portfolio\/*/, /^newPosition\/*/, /^position\/*/],

    ...(typeOfNetwork === NetworkType.Mainnet ? { leaderboard: [/^points\/*/] } : {}),
    ...(typeOfNetwork === NetworkType.Testnet ? { creator: [/^creator\/*/] } : {})
  }

  return (
    <Box component='footer' className={classes.navbar}>
      {links.map(link => {
        const active =
          link.url === activePath ||
          (!!otherRoutesToHighlight[link.url] &&
            otherRoutesToHighlight[link.url].some(pathRegex => pathRegex.test(activePath)))

        return (
          <Link
            key={`path-${link.url}`}
            to={`/${link.url}`}
            className={classes.navbox}
            style={{
              background: active ? colors.invariant.light : ''
            }}
            onClick={e => {
              if (link.url === 'exchange' && activePath.startsWith('exchange')) {
                e.preventDefault()
                return
              }
              setActive(link.url)
            }}>
            {active && <Box className={classes.activeBox} />}
            <img
              src={link.icon}
              width={link.width}
              style={
                active
                  ? { filter: 'brightness(0) saturate(100%) invert(100%)' }
                  : { filter: 'brightness(0) saturate(100%) invert(45%)' }
              }
              className={classes.navImg}
              alt={link.label}
            />
            <Typography
              sx={active ? { color: colors.white.main } : { color: colors.invariant.textGrey }}>
              {link.label}
            </Typography>
          </Link>
        )
      })}
    </Box>
  )
}

export default FooterNavbar
