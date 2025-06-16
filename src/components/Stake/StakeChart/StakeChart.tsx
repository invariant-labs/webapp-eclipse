import React, { useState, useEffect, useCallback } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { Box, Typography, TextField, Grid, useMediaQuery } from '@mui/material';
import { colors, theme } from '@static/theme';
import { useStyles } from './style';
import { linearGradientDef } from '@nivo/core';
import BITZ from '@static/png/BITZ.png'
import sBITZ from '@static/png/sBITZ.png'
type PointData = {
    x: string;
    y: number;
};


interface StakeChartProps {
    stakedAmount: number;
    earnedAmount: number;
    earnedAmountUsd: number;
    bitzData: PointData[];
    sBitzData: PointData[];
    onStakedAmountChange?: (amount: number) => void;
}

export const StakeChart: React.FC<StakeChartProps> = ({
    stakedAmount,
    earnedAmount,
    earnedAmountUsd,
    bitzData,
    sBitzData,
    onStakedAmountChange,
}) => {
    const { classes } = useStyles();
    const [inputValue, setInputValue] = useState(stakedAmount.toString());

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setInputValue(value);

            const numValue = parseFloat(value) || 0;
            if (onStakedAmountChange) {
                onStakedAmountChange(numValue);
            }
        }
    };

    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const getTickFrequency = useCallback(() => {
        if (isMobile) return 8;
        if (isTablet) return 4;
        return 2;
    }, [isMobile, isTablet]);

    useEffect(() => {
        setInputValue(stakedAmount.toString());
    }, [stakedAmount]);

    const data = [
        {
            id: 'BITZ',
            color: colors.invariant.green,
            data: bitzData
        },
        {
            id: 'sBITZ',
            color: colors.invariant.pink,
            data: sBitzData
        }
    ];



    const CustomValueLayer = ({ xScale, yScale }) => {
        if (!bitzData.length || !sBitzData.length) return null;

        const lastBitzPoint = bitzData[bitzData.length - 1];
        const lastSBitzPoint = sBitzData[sBitzData.length - 1];

        const pointValues = [
            {
                y: lastBitzPoint.y,
                yPosition: yScale(lastBitzPoint.y),
                color: colors.invariant.green
            },
            {
                y: lastSBitzPoint.y,
                yPosition: yScale(lastSBitzPoint.y),
                color: colors.invariant.pink
            }
        ];

        const xPosition = isMobile
            ? xScale.range()[1] - 5
            : xScale(lastBitzPoint.x);

        const textAnchor = isMobile ? "end" : "middle";

        return (
            <g>
                {pointValues.map((point, index) => (
                    <text
                        key={index}
                        x={xPosition + (isMobile ? 5 : 0)}
                        y={point.yPosition - (index === 0 || !isMobile ? 10 : 0)}
                        textAnchor={textAnchor}
                        dominantBaseline="middle"
                        style={{
                            fontSize: 12,
                            fontWeight: 'bold',
                            fill: point.color,
                            filter: isMobile ? 'drop-shadow(0px 0px 2px rgba(0,0,0,0.5))' : 'none'
                        }}
                    >
                        {point.y.toFixed(2)}
                    </text>
                ))}
            </g>
        );
    };

    return (
        <Box className={classes.chartContainer}>
            <Box className={classes.stakeText}>

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexDirection: isMobile ? 'column' : 'row',
                    textAlign: isMobile ? 'center' : 'left'
                }}>
                    <Typography>
                        Staking
                    </Typography>
                    <TextField
                        value={inputValue}
                        onChange={handleInputChange}
                        variant="outlined"
                        type='number'
                        size="small"
                        InputProps={{
                            className: classes.inputProps,
                            startAdornment: (
                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', marginRight: 2, paddingLeft: '4px' }}>
                                    <img src={BITZ} alt="BITZ" style={{ height: '16px', minWidth: '16px' }} />
                                </Box>
                            ),
                        }}
                        className={classes.inputField}
                    />
                    <Typography sx={{ color: colors.invariant.text }}>
                        with BITZ in the last year would have
                    </Typography>
                </Box>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexDirection: isMobile ? 'column' : 'row',
                    textAlign: isMobile ? 'center' : 'left'
                }}>
                    <Typography sx={{ color: colors.invariant.text }}>
                        earned you an extra
                    </Typography>
                    <Typography sx={{ color: colors.invariant.green }}>
                        {earnedAmount} BITZ  (${earnedAmountUsd})
                    </Typography>
                </Box>
            </Box>

            <Box className={classes.chartBox}>
                <ResponsiveLine
                    data={data}

                    margin={{
                        top: 20,
                        right: isMobile ? 10 : 20,
                        bottom: 50,
                        left: isMobile ? 40 : 60
                    }}
                    xScale={{ type: 'point' }}
                    yScale={{
                        type: 'linear',
                        min: 0,
                        max: 'auto',
                        stacked: false
                    }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: isMobile ? -45 : 0,
                        legend: '',
                        legendOffset: 36,
                        tickValues: bitzData.filter((_, i) => i % getTickFrequency() === 0).map(d => d.x)

                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: isMobile ? '' : 'BITZ',
                        legendOffset: -40,
                        tickValues: 6,
                    }}
                    colors={({ color }) => color}
                    pointSize={0}
                    useMesh={true}
                    enableSlices="x"
                    enableArea={true}
                    isInteractive
                    areaBlendMode="normal"
                    areaBaselineValue={0}
                    gridXValues={[]}
                    enableGridX={false}
                    enableGridY={true}
                    enableCrosshair
                    lineWidth={1}
                    gridYValues={6}
                    areaOpacity={0.4}
                    legends={[]}
                    layers={[
                        'grid',
                        'markers',
                        'axes',
                        'areas',
                        'lines',
                        'points',
                        'slices',
                        'mesh',
                        'legends',
                        'crosshair',
                        CustomValueLayer
                    ]}
                    defs={[
                        linearGradientDef('gradientPink', [
                            { offset: 0, color: colors.invariant.pink },
                            { offset: 100, color: colors.invariant.pink, opacity: 0 }
                        ]),
                        linearGradientDef('gradientGreen', [
                            { offset: 0, color: colors.invariant.green },
                            { offset: 100, color: colors.invariant.green, opacity: 0 }
                        ])

                    ]}

                    fill={[
                        { match: { id: 'BITZ' }, id: 'gradientGreen' },
                        { match: { id: 'sBITZ' }, id: 'gradientPink' }
                    ]}
                    theme={{

                        axis: {
                            ticks: {
                                line: { stroke: colors.invariant.component },
                                text: { fill: '#A9B6BF' }
                            },
                            legend: {
                                text: {
                                    fontSize: '12px',
                                    fontFamily: 'inherit',
                                    fill: colors.invariant.textGrey
                                }
                            }
                        },
                        crosshair: {
                            line: {
                                stroke: colors.invariant.lightGrey,
                                strokeWidth: 1,
                                strokeDasharray: 'solid'
                            }
                        },
                        grid: { line: { stroke: colors.invariant.light } }
                    }}
                    sliceTooltip={({ slice }) => {
                        return (
                            <Grid className={classes.tooltip}>
                                {slice.points.length > 0 && (
                                    <>
                                        <Typography className={classes.tooltipDate}>
                                            {slice.points[0].data.xFormatted}
                                        </Typography>
                                        {slice.points.map(point => (
                                            <Typography
                                                key={point.id}
                                                className={classes.tooltipValue}
                                                sx={{ color: `${point.serieColor}` }}
                                            >
                                                {point.data.yFormatted} {point.serieId}
                                            </Typography>
                                        ))}
                                    </>
                                )}
                            </Grid>
                        );
                    }}

                />
            </Box>

            <Box className={classes.valuesContainer} sx={{
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 1 : 4
            }}>
                {bitzData.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={BITZ} alt="BITZ Logo" />
                        <Typography className={classes.bitzValue}>
                            Staked BITZ: {bitzData[bitzData.length - 1].y.toFixed(2)}
                        </Typography>
                    </Box>
                )}
                {sBitzData.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={sBITZ} alt="sBITZ Logo" />
                        <Typography className={classes.sBitzValue}>
                            Holding sBITZ: {sBitzData[sBitzData.length - 1].y.toFixed(2)}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box >
    );
};