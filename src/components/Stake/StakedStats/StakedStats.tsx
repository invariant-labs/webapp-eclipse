import { Box, Typography } from '@mui/material'
import { TokenArc } from '../TokenArc/TokenArc'
import useStyles from './style'
import ResponsivePieChart from '@components/Portfolio/Overview/OverviewPieChart/ResponsivePieChart'

export const StakedStats = () => {
    const { classes } = useStyles()
    return (
        <>
            <Box className={classes.statsContainer}>
                <Typography className={classes.heading}>BITZ staked</Typography>

                <Box className={classes.statsBox}>
                    <Box>
                        <Box>
                            <Typography className={classes.statsLabel}>
                                BITZ staked
                            </Typography>
                            <Typography className={classes.statsValue}>
                                0.00
                            </Typography>
                        </Box>

                        <Box>
                            <Box className={classes.flexBoxWithGap}>
                                <Box className={classes.arcContainer}>
                                    <TokenArc
                                        color={'#00D9FF'}
                                        width={65}
                                        height={98}
                                    />
                                    <Box className={`${classes.textContainer} ${classes.tokenTextContainer}`}>
                                        <Typography className={classes.tokenName}>
                                            sBITZ
                                        </Typography>
                                        <Typography className={classes.tokenPercentageBlue}>
                                            61%
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box className={classes.arcContainer}>
                                    <TokenArc
                                        color={'#32EC51'}
                                        width={65}
                                        height={98}
                                    />
                                    <Box className={`${classes.textContainer} ${classes.tokenTextContainer}`}>
                                        <Typography className={classes.tokenName}>
                                            BITZ
                                        </Typography>
                                        <Typography className={classes.tokenPercentageGreen}>
                                            39%
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box>
                                <Typography className={classes.statsLabel}>
                                    BITZ supply
                                </Typography>
                                <Typography className={classes.statsValue}>
                                    0.00
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box className={classes.pieChartSection}>
                        <ResponsivePieChart isLoading={false} data={[{ label: 'sBITZ', value: 61 }, { label: 'BITZ', value: 39 }]} chartColors={['#00D9FF', '#32EC51']} />
                    </Box>
                </Box>
            </Box>
        </>
    )
}
