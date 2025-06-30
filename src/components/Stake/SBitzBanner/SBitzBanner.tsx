import { Box, Typography, IconButton, Button } from '@mui/material'
import { arrowRightIcon, closeIcon } from '@static/icons'
import { sBITZ_MAIN, WETH_MAIN } from '@store/consts/static'
import sBITZ from '@static/png/sBitz.png'
import useStyles from './style'
import { useState, useLayoutEffect, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@utils/utils'
import sBITZBannerBackground from '@static/png/sbitzbanner2.png'

export const SBitzBanner = () => {
    const { classes, cx } = useStyles()
    const [isVisible, setIsVisible] = useState(true)
    const [isRendered, setIsRendered] = useState(true)
    const navigate = useNavigate()

    useLayoutEffect(() => {
        const bannerClosed = localStorage.getItem('SBITZ_BANNER_CLOSED')
        if (bannerClosed === 'true') {
            setIsVisible(false)
            setIsRendered(false)
        }
    }, [])

    useEffect(() => {
        if (!isVisible) {
            const timer = setTimeout(() => {
                setIsRendered(false)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isVisible])

    const handleClose = () => {
        setIsVisible(false)
        localStorage.setItem('SBITZ_BANNER_CLOSED', 'true')
    }

    if (!isRendered) {
        return null
    }

    return (
        <Box className={cx(classes.bannerContainer, !isVisible && classes.bannerHidden)}>
            <IconButton className={classes.closeButton} onClick={handleClose}>
                <img src={closeIcon} alt="Close" width={16} height={16} />
            </IconButton>
            <Box className={classes.bannerContent}>
                <Box className={classes.bannerTextContent}>
                    <Typography className={classes.title}>
                        sBITZ is live!
                    </Typography>

                    <Typography className={classes.description}>
                        Earn extra yield while staking BITZ
                    </Typography>

                    <Button className={classes.actionButton} onClick={() => navigate(ROUTES.getNewPositionRoute(sBITZ_MAIN.symbol, WETH_MAIN.symbol, '1_00'))}>
                        <Box className={classes.buttonContent}>
                            <img src={sBITZ} width={16} height={16} className={classes.iconLeft} />
                            sBITZ -
                            <img src={WETH_MAIN.logoURI} width={16} height={16} className={classes.iconMiddle} />
                            ETH Pool
                            <img src={arrowRightIcon} className={classes.iconRight} />
                        </Box>
                    </Button>
                </Box>
                <Box className={classes.bannerImageContainer}>
                    <img src={sBITZBannerBackground} alt="sBITZ Banner Background" />
                </Box>
            </Box>
        </Box>
    )
}
