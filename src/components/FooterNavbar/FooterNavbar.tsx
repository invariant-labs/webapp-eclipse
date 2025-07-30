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

interface INavLinks {
  label: string
  icon: string
  width: number
  isLink: boolean
  url?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
}

export const FooterNavbar = () => {
  const typeOfNetwork = useSelector(network)

  // const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  // const [isMorePopupOpen, setIsMorePopupOpen] = useState(false)

  // const moreOptions: INavLinks[] = [
  //   ...(typeOfNetwork === NetworkType.Mainnet
  //     ? [
  //         {
  //           label: 'Stake',
  //           icon: lqStakingIcon,
  //           url: 'stake',
  //           onClick: () => {
  //             setIsMorePopupOpen(false)
  //             setAnchorEl(null)
  //             unblurContent()
  //           },
  //           isLink: true,
  //           width: 25
  //         }
  //       ]
  //     : []),

  //   ...(typeOfNetwork === NetworkType.Testnet
  //     ? [
  //         {
  //           label: 'Creator',
  //           icon: tokenCreatorIcon,
  //           url: 'creator',
  //           width: 25,
  //           isLink: true,
  //           onClick: () => {
  //             setIsMorePopupOpen(false)
  //             setAnchorEl(null)
  //             unblurContent()
  //           }
  //         }
  //       ]
  //     : [
  //         {
  //           label: 'Points',
  //           icon: airdropIcon,
  //           url: 'points',
  //           width: 22,
  //           onClick: () => {
  //             setIsMorePopupOpen(false)
  //             setAnchorEl(null)
  //             unblurContent()
  //           },
  //           isLink: true
  //         }
  //       ]),

  //   {
  //     label: 'Stats',
  //     icon: statsIcon,
  //     url: 'statistics',
  //     width: 20,
  //     onClick: () => {
  //       setIsMorePopupOpen(false)
  //       setAnchorEl(null)
  //       unblurContent()
  //     },
  //     isLink: true
  //   }
  // ]

  const links: INavLinks[] = [
    {
      label: 'Swap',
      icon: swapArrowsIcon,
      url: 'exchange',
      width: 33,
      isLink: true
    },
    {
      label: 'Liquidity',
      icon: liquidityIcon,
      url: 'liquidity',
      width: 20,
      isLink: true
    },
    {
      label: 'Portfolio',
      icon: walletIcon,
      url: 'portfolio',
      width: 26,
      isLink: true
    },

    ...(typeOfNetwork === NetworkType.Mainnet
      ? [
          {
            label: 'Stake',
            icon: lqStakingIcon,
            url: 'stake',

            isLink: true,
            width: 29
          }
        ]
      : []),
    ...(typeOfNetwork === NetworkType.Testnet
      ? [
          {
            label: 'Creator',
            icon: tokenCreatorIcon,
            url: 'creator',
            width: 25,
            isLink: true
          }
        ]
      : [
          {
            label: 'Points',
            icon: airdropIcon,
            url: 'points',
            width: 22,

            isLink: true
          }
        ]),

    {
      label: 'Stats',
      icon: statsIcon,
      url: 'statistics',
      width: 30,
      isLink: true
    }
    // {
    //   label: 'Presale',
    //   icon: saleUnselectedIcon,
    //   url: 'presale',

    //   isLink: true,
    //   width: 34
    // },

    // {
    //   label: 'More',
    //   icon: moreIcon,
    //   width: 25,
    //   isLink: false,
    //   onClick: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    //     setAnchorEl(e.currentTarget as HTMLButtonElement)
    //     setIsMorePopupOpen(true)
    //     blurContent()
    //   }
    // }
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
    sale: [/^presale\/*/],
    portfolio: [/^portfolio\/*/, /^newPosition\/*/, /^position\/*/],

    ...(typeOfNetwork === NetworkType.Mainnet ? { leaderboard: [/^points\/*/] } : {}),
    ...(typeOfNetwork === NetworkType.Testnet ? { creator: [/^creator\/*/] } : {}),
    ...(typeOfNetwork === NetworkType.Mainnet ? { more: [/^stake\/*/] } : {})
  }

  // const isMoreOptionActive = () => {
  //   return moreOptions.some(
  //     option => option.url === activePath || (option.url && activePath.startsWith(option.url))
  //   )
  // }

  const [display, setDisplay] = useState(true)

  useEffect(() => {
    const resizeHandler = () => {
      // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
      setDisplay(window.innerHeight < window.visualViewport!?.height * 1.1)
    }

    window.visualViewport!.addEventListener('resize', resizeHandler)

    return () => window.visualViewport!.removeEventListener('resize', resizeHandler)
  }, [])

  // const handleClosePopup = () => {
  //   setIsMorePopupOpen(false)
  //   setAnchorEl(null)
  //   unblurContent()
  // }

  return (
    <>
      <Box
        component='footer'
        className={classes.navbar}
        style={{ display: display ? 'flex' : 'none' }}>
        {links.map((link, index) => {
          let active = false

          // if (link.label === 'More') {
          //   // active = isMoreOptionActive()
          // } else {
          active =
            link.url === activePath ||
            (!!link.url &&
              !!otherRoutesToHighlight[link.url] &&
              otherRoutesToHighlight[link.url].some(pathRegex => pathRegex.test(activePath)))
          // }

          if (link.isLink && link.url) {
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
                  setActive(link.url!)
                  if (link.onClick) {
                    link.onClick(e)
                  }
                }}>
                {active && <Box className={classes.activeBox} />}
                <img
                  src={
                    // activePath === 'presale' && link.label === 'Presale'
                    //   ? saleSelectedIcon
                    //   :
                    link.icon
                  }
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
          } else {
            return (
              <Box
                key={`button-${index}`}
                component='button'
                className={classes.navbox}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (link.onClick) {
                    link.onClick(e)
                  }
                }}
                style={{
                  background: active ? colors.invariant.light : 'transparent',
                  border: 'none',
                  cursor: 'pointer'
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
              </Box>
            )
          }
        })}
      </Box>

      {/* <Popover
        classes={{ paper: classes.paper }}
        open={isMorePopupOpen}
        anchorEl={anchorEl}
        onClose={handleClosePopup}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}>
        <Box className={classes.root}>
          {moreOptions.map((option, index) => {
            const isOptionActive =
              option.url === activePath || (option.url && activePath.startsWith(option.url))

            return (
              <>
                <Link
                  key={option.url}
                  to={`/${option.url}`}
                  style={{ textDecoration: 'none' }}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    if (option.onClick) {
                      option.onClick(e)
                    }
                  }}>
                  <Box
                    className={classes.moreLink}
                    style={{
                      background: isOptionActive ? colors.invariant.light : 'transparent'
                    }}>
                    <Grid width={25} display='flex'>
                      <img
                        src={option.icon}
                        width={option.width}
                        alt={option.label}
                        style={
                          isOptionActive
                            ? { filter: 'brightness(0) saturate(100%) invert(100%)' }
                            : { filter: 'brightness(0) saturate(100%) invert(100%)' }
                        }
                      />
                    </Grid>
                    <Typography
                      style={{ marginTop: 0 }}
                      sx={
                        isOptionActive
                          ? { color: colors.white.main }
                          : { color: colors.invariant.textGrey }
                      }>
                      {option.label}
                    </Typography>
                  </Box>
                </Link>
                {index + 1 !== moreOptions.length && (
                  <Separator margin='4px' isHorizontal color={colors.invariant.light} />
                )}
              </>
            )
          })}
        </Box>
      </Popover> */}
    </>
  )
}

export default FooterNavbar
