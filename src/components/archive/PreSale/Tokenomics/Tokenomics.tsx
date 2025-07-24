// import { Box, Grid, Typography } from '@mui/material'
// import { colors, typography } from '@static/theme'
// import { TokenomicsArc } from '../TokenomicsArc/TokenomicsArc'
// import TokenomicsChart from '@static/png/presale/tokenomic_overlay_chart.png'
// import useStyles from './style'

// interface TokenomicsItem {
//   title: string
//   percentage: number
//   color: string
// }

// export const Tokenomics = () => {
//   const { classes } = useStyles()

//   const tokenomicsItemsLeft: TokenomicsItem[] = [
//     {
//       title: 'Community',
//       percentage: 40,
//       color: colors.invariant.green
//     },

//     {
//       title: 'Contributors & Grants',
//       percentage: 15,
//       color: colors.invariant.textGrey
//     },
//     {
//       title: 'Community Sale',
//       percentage: 10,
//       color: colors.invariant.yellow
//     }
//   ]
//   const tokenomicsItemsRight: TokenomicsItem[] = [
//     {
//       title: 'Strategic Reserve',
//       percentage: 25,
//       color: colors.invariant.pink
//     },
//     {
//       title: 'Liquidity',
//       percentage: 10,
//       color: colors.invariant.light
//     }
//   ]
//   const tokenomicsItems = [tokenomicsItemsLeft, tokenomicsItemsRight]

//   return (
//     <Box className={classes.container}>
//       <Grid className={classes.legendWrapper}>
//         {tokenomicsItems.map(tokenomicsSection => {
//           return (
//             <Grid className={classes.gridContainer}>
//               {tokenomicsSection.map((item, index) => (
//                 <Box key={index} className={classes.arcContainer}>
//                   <TokenomicsArc color={item.color} width={65} height={98} glowColor={item.color} />
//                   <Box sx={{ color: colors.invariant.text }}>
//                     <Typography sx={{ ...typography.heading3 }}>{item.title}</Typography>
//                     <Typography sx={{ ...typography.heading4, color: item.color }}>
//                       ({item.percentage}%)
//                     </Typography>
//                   </Box>
//                 </Box>
//               ))}
//             </Grid>
//           )
//         })}
//       </Grid>
//       <img src={TokenomicsChart} alt='Tokenomics Chart' className={classes.chartImage} />
//     </Box>
//   )
// }
