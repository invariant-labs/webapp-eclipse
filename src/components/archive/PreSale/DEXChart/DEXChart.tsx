// import GradientBorder from '@common/GradientBorder/GradientBorder'
// import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
// import { ResponsiveBar } from '@nivo/bar'
// import { linearGradientDef } from '@nivo/core'
// import { colors } from '@static/theme'
// import OrcaLogo from '@static/png/presale/dexes-chart/orca.png'
// import InvariantLogo from '@static/png/presale/dexes-chart/invariant.png'
// import UmbraLogo from '@static/png/presale/dexes-chart/umbra.png'
// import SolarLogo from '@static/png/presale/dexes-chart/solar.png'
// import EclipseLogo from '@static/png/presale/dexes-chart/eclipse.png'
// import { useState } from 'react'
// import useStyles from './style'

// const volumeTvlData = [
//   {
//     log: 'Log1',
//     value: 0.5615,
//     label: 'Invariant',
//     color: 'gradient-invariant',
//     logo: InvariantLogo
//   },
//   {
//     log: 'Log2',
//     value: 0.1313,
//     label: 'Orca',
//     color: '#FFD15C',
//     logo: OrcaLogo
//   },
//   {
//     log: 'Log3',
//     value: 0.1147,
//     label: 'Umbra',
//     color: 'gradient-umbra',
//     logo: UmbraLogo
//   },
//   {
//     log: 'Log4',
//     value: 0.0828,
//     label: 'Solar DEX',
//     color: '#FBFBFB',
//     logo: SolarLogo
//   }
// ]

// const feeTvlData = [
//   {
//     log: 'Log1',
//     value: 0.000492,
//     label: 'Invariant',
//     color: 'gradient-invariant',
//     logo: InvariantLogo
//   },
//   {
//     log: 'Log2',
//     value: 0.000184,
//     label: 'Orca',
//     color: colors.invariant.goldenYellow,
//     logo: OrcaLogo
//   },
//   {
//     log: 'Log3',
//     value: 0.000123,
//     label: 'Umbra',
//     color: 'gradient-umbra',
//     logo: UmbraLogo
//   },
//   {
//     log: 'Log4',
//     value: 0.000119,
//     label: 'Solar DEX',
//     color: colors.invariant.offWhite,
//     logo: SolarLogo
//   }
// ]

// const availableGradients = ['gradient-invariant', 'gradient-umbra']
// export enum SwitcherAlignment {
//   VOLUME_TVL = 'volume/tvl',
//   FEE_TVL = 'fee/tvl'
// }
// export const DEXChart = () => {
//   const [alignment, setAlignment] = useState<SwitcherAlignment>(SwitcherAlignment.FEE_TVL)
//   const { classes } = useStyles({ alignment })

//   const handleSwitchPools = (
//     _: React.MouseEvent<HTMLElement>,
//     newAlignment: SwitcherAlignment | null
//   ) => {
//     if (newAlignment !== null) {
//       setAlignment(newAlignment)
//     }
//   }

//   const chartData = alignment === SwitcherAlignment.VOLUME_TVL ? volumeTvlData : feeTvlData
//   const maxValue =
//     alignment === SwitcherAlignment.VOLUME_TVL ? volumeTvlData[0].value : feeTvlData[0].value
//   const formatValue = (value: number) => `${(value * 100).toFixed(2)}%`

//   return (
//     <GradientBorder
//       borderWidth={2}
//       borderRadius={24}
//       backgroundColor={`${colors.invariant.dark}ff`}
//       opacity={1}>
//       <Box className={classes.container}>
//         <Box className={classes.headerContainer}>
//           <Box className={classes.leftSection}>
//             <Typography className={classes.higherText}>Higher = Better</Typography>
//             <Box className={classes.switchWrapper}>
//               <Box className={classes.switchPoolsContainer}>
//                 <Box className={classes.switchPoolsMarker} />
//                 <ToggleButtonGroup
//                   value={alignment}
//                   exclusive
//                   onChange={handleSwitchPools}
//                   className={classes.switchPoolsButtonsGroup}>
//                   <ToggleButton
//                     value={SwitcherAlignment.FEE_TVL}
//                     disableRipple
//                     className={classes.switchPoolsButton}
//                     style={{ fontWeight: alignment === SwitcherAlignment.FEE_TVL ? 700 : 400 }}>
//                     Fee/TVL
//                   </ToggleButton>
//                   <ToggleButton
//                     value={SwitcherAlignment.VOLUME_TVL}
//                     disableRipple
//                     className={classes.switchPoolsButton}
//                     style={{ fontWeight: alignment === SwitcherAlignment.VOLUME_TVL ? 700 : 400 }}>
//                     Volume/TVL
//                   </ToggleButton>
//                 </ToggleButtonGroup>
//               </Box>
//             </Box>
//           </Box>

//           <Box className={classes.rightSection}>
//             <Typography className={classes.sourceText}>
//               As of July 11, source: DefiLlama, Eclipsescan
//             </Typography>
//             <div className={classes.divider} />
//             <img src={EclipseLogo} alt='Eclipse Logo' className={classes.eclipseLogo} />
//           </Box>
//         </Box>
//         <Box className={classes.chartContainer}>
//           <ResponsiveBar
//             margin={{ top: 30, bottom: 60, left: 60, right: 60 }}
//             data={chartData}
//             key={alignment}
//             keys={['value']}
//             isInteractive={false}
//             animate={true}
//             motionConfig={'gentle'}
//             indexBy='log'
//             maxValue={maxValue}
//             axisBottom={{
//               tickSize: 0,
//               tickPadding: 10,
//               tickRotation: 0,
//               renderTick: ({ x, y, value }) => {
//                 const item = chartData.find(item => item.log === value)
//                 return (
//                   <g transform={`translate(${x},${y})`}>
//                     <text className={classes.axisTickText} transform='translate(0,30)'>
//                       {item?.label || ''}
//                     </text>
//                     <image href={item?.logo} x='-10' y='40' height='20' width='20' />
//                   </g>
//                 )
//               }
//             }}
//             layers={[
//               'grid',
//               'axes',
//               'bars',
//               'markers',
//               'legends',
//               'annotations',
//               props => {
//                 const { bars } = props
//                 return (
//                   <g>
//                     {bars.map(bar => (
//                       <text
//                         key={bar.key}
//                         x={bar.x + bar.width / 2}
//                         y={bar.y - 12}
//                         textAnchor='middle'
//                         dominantBaseline='middle'
//                         className={classes.barValueText}>
//                         {formatValue(bar.data.value ?? 0)}
//                       </text>
//                     ))}
//                   </g>
//                 )
//               }
//             ]}
//             axisLeft={{
//               tickSize: 0,
//               tickPadding: 2,
//               tickRotation: 0,
//               tickValues: 5,
//               renderTick: ({ x, y, value }) => (
//                 <g transform={`translate(${x - 30},${y + 4})`}>
//                   <text
//                     className={classes.leftAxisTickText}
//                     textAnchor='start'
//                     dominantBaseline='center'>
//                     {`${(value * 100).toFixed(2)}%`}
//                   </text>
//                 </g>
//               )
//             }}
//             gridYValues={5}
//             theme={{
//               grid: {
//                 line: {
//                   stroke: colors.invariant.newDark,
//                   strokeWidth: 1
//                 }
//               },
//               axis: {
//                 ticks: {
//                   text: {
//                     fill: colors.invariant.textGrey
//                   }
//                 }
//               }
//             }}
//             defs={[
//               linearGradientDef('gradient-umbra', [
//                 { offset: 0, color: '#F26B5F' },
//                 { offset: 100, color: '#9DF09C', opacity: 0.7 }
//               ]),
//               linearGradientDef('gradient-invariant', [
//                 { offset: 0, color: '#EF84F5' },
//                 { offset: 100, color: '#2EE09A', opacity: 0.7 }
//               ])
//             ]}
//             groupMode='grouped'
//             enableLabel={false}
//             enableGridY={true}
//             innerPadding={8}
//             padding={0.5}
//             indexScale={{ type: 'band', round: true }}
//             fill={[
//               {
//                 match: d => {
//                   return d.data.data.color === 'gradient-invariant'
//                 },
//                 id: 'gradient-invariant'
//               },
//               {
//                 match: d => {
//                   return d.data.data.color === 'gradient-umbra'
//                 },
//                 id: 'gradient-umbra'
//               }
//             ]}
//             colors={bar =>
//               availableGradients.includes(bar.data.color) ? 'rgba(0,0,0,0)' : bar.data.color
//             }
//           />
//         </Box>
//       </Box>

//       <Box className={classes.footerContainer}>
//         <Typography className={classes.footerText}>
//           Volume-to-TVL and Fee-to-TVL show how efficiently a DEX uses its liquidity. A higher ratio
//           means the protocol generates more trading activity relative to its TVL, indicating greater
//           capital efficiency and better utilization of user funds, ultimately making it more
//           profitable for users. Invariant achieves these numbers thanks to expertly leveraged Solana
//           technology and its own well-designed architecture
//         </Typography>
//       </Box>
//     </GradientBorder>
//   )
// }
