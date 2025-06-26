import { Box, Typography } from '@mui/material'
import useStyles from './style'
import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  airdropIcon,
  liquidityIcon,
  lqStakingIcon,
  statsIcon,
  swapArrowsIcon,
  tokenCreatorIcon,
  walletIcon
} from '@static/icons'
import { NetworkType } from '@store/consts/static'
import { useSelector } from 'react-redux'
import { network } from '@store/selectors/solanaConnection'
import { colors } from '@static/theme'

export const FooterNavbar = () => {
  const typeOfNetwork = useSelector(network)

  const links = [
    {
      label: 'Swap',
      icon: swapArrowsIcon,
      url: 'exchange',
      width: 33
    },
    {
      label: 'Liquidity',
      icon: liquidityIcon,
      url: 'liquidity',
      width: 20
    },
    {
      label: 'Portfolio',
      icon: walletIcon,
      url: 'portfolio',
      width: 26
    },

    ...(typeOfNetwork === NetworkType.Testnet
      ? [
          {
            label: 'Creator',
            icon: tokenCreatorIcon,
            url: 'creator',
            width: 33
          }
        ]
      : [
          {
            label: 'Points',
            icon: airdropIcon,
            url: 'points',
            width: 26
          },
          {
            label: 'Stake',
            icon: lqStakingIcon,
            url: 'stake',
            width: 30,
            margin: 1
          }
        ]),
    {
      label: 'Stats',
      icon: statsIcon,
      url: 'statistics',
      width: 30,
      margin: 3
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
    ...(typeOfNetwork === NetworkType.Testnet ? { creator: [/^creator\/*/] } : {}),
    ...(typeOfNetwork === NetworkType.Mainnet ? { stake: [/^stake\/*/] } : {})
  }

  const [display, setDisplay] = useState(true)

  useEffect(() => {
    const resizeHandler = () => {
      // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
      setDisplay(window.innerHeight < window.visualViewport!?.height * 1.1)
    }

    window.visualViewport!.addEventListener('resize', resizeHandler)

    return () => window.visualViewport!.addEventListener('resize', resizeHandler)
  }, [])

  return (
    <Box
      component='footer'
      className={classes.navbar}
      style={{ display: display ? 'flex' : 'none' }}>
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
                  ? {
                      filter: 'brightness(0) saturate(100%) invert(100%)',
                      marginTop: link?.margin ? link.margin : 0
                    }
                  : {
                      filter: 'brightness(0) saturate(100%) invert(45%)',
                      marginTop: link?.margin ? link.margin : 0
                    }
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
