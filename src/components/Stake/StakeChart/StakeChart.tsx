import React, { useState, useEffect } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { Box, Typography, TextField } from '@mui/material';
import { colors } from '@static/theme';
import { useStyles } from './style';

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

        const xPosition = xScale(lastBitzPoint.x);

        const bitzYPosition = yScale(lastBitzPoint.y);
        const sBitzYPosition = yScale(lastSBitzPoint.y);

        return (
            <g>
                <text
                    x={xPosition}
                    y={bitzYPosition - 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                        fontSize: 12,
                        fontWeight: 'bold',
                        fill: colors.invariant.green
                    }}
                >
                    {lastBitzPoint.y.toFixed(2)}
                </text>

                {/* sBITZ value */}
                <text
                    x={xPosition}
                    y={sBitzYPosition - 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                        fontSize: 12,
                        fontWeight: 'bold',
                        fill: colors.invariant.pink
                    }}
                >
                    {lastSBitzPoint.y.toFixed(2)}
                </text>
            </g>
        );
    };

    return (
        <Box className={classes.chartContainer}>
            <Box className={classes.stakeText}>
                <Typography component="span">
                    Staking
                </Typography>
                <TextField
                    value={inputValue}
                    onChange={handleInputChange}
                    variant="outlined"
                    type='number'
                    size="small"
                    inputProps={{
                        className: classes.inputProps
                    }}
                    className={classes.inputField}
                />
                <Typography component="span" sx={{ color: colors.invariant.text }}>
                    with BITZ in the last year would have earned you an extra
                </Typography>
                <Typography component="span" sx={{ color: colors.invariant.green }}>
                    {earnedAmount} SOL (${earnedAmountUsd})
                </Typography>
            </Box>

            <Box className={classes.chartBox}>
                <ResponsiveLine
                    data={data}
                    margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{
                        type: 'linear',
                        min: 'auto',
                        max: 'auto',
                        stacked: false
                    }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: '',
                        legendOffset: 36
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'BITZ',
                        legendOffset: -40
                    }}
                    colors={({ color }) => color}
                    pointSize={0}
                    useMesh={true}
                    enableSlices="x"
                    gridXValues={[]}
                    enableGridX={false}
                    enableGridY={true}
                    lineWidth={1.5}
                    legends={[]}
                    enableArea={true}
                    areaOpacity={0.15}
                    areaBaselineValue={0}
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
                        CustomValueLayer
                    ]}
                    defs={[
                        {
                            id: 'gradientGreen',
                            type: 'linearGradient',
                            colors: [
                                { offset: 0, color: colors.invariant.green, opacity: 0.9 },
                                { offset: 60, color: colors.invariant.green, opacity: 0 }
                            ]
                        },
                        {
                            id: 'gradientPink',
                            type: 'linearGradient',
                            colors: [
                                { offset: 0, color: colors.invariant.pink, opacity: 0.9 },
                                { offset: 60, color: colors.invariant.pink, opacity: 0 }
                            ]
                        }
                    ]}
                    fill={[
                        { match: { id: 'BITZ' }, id: 'gradientGreen' },
                        { match: { id: 'sBITZ' }, id: 'gradientPink' }
                    ]}
                    theme={{
                        grid: {
                            line: {
                                stroke: colors.invariant.light,
                                strokeWidth: 1
                            }
                        },
                        crosshair: {
                            line: {
                                stroke: '#b0b0b0',
                                strokeWidth: 1,
                                strokeOpacity: 0.5
                            }
                        },
                        axis: {
                            ticks: {
                                text: {
                                    fontSize: '12px',
                                    fontFamily: 'inherit',
                                    fill: colors.invariant.textGrey
                                }
                            },
                            legend: {
                                text: {
                                    fontSize: '12px',
                                    fontFamily: 'inherit',
                                    fill: colors.invariant.textGrey
                                }
                            }
                        }
                    }}
                />
            </Box>

            <Box className={classes.legendContainer}>
                <Box className={classes.legendItem}>
                    <Box className={`${classes.legendDot} ${classes.greenDot}`} />
                    <Typography className={classes.greenText}>BITZ</Typography>
                </Box>
                <Box className={classes.legendItem}>
                    <Box className={`${classes.legendDot} ${classes.pinkDot}`} />
                    <Typography className={classes.pinkText}>sBITZ</Typography>
                </Box>
            </Box>
            <Box className={classes.valuesContainer}>
                {bitzData.length > 0 && (
                    <Typography className={classes.bitzValue}>
                        BITZ: {bitzData[bitzData.length - 1].y.toFixed(2)}
                    </Typography>
                )}
                {sBitzData.length > 0 && (
                    <Typography className={classes.sBitzValue}>
                        sBITZ: {sBitzData[sBitzData.length - 1].y.toFixed(2)}
                    </Typography>
                )}
            </Box>
        </Box >
    );
};