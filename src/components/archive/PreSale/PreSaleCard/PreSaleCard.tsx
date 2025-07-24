// import { Box, Typography } from '@mui/material'
// import React from 'react'
// import useStyles from './style'
// import { colors } from '@static/theme'
// import GradientBorder from '@common/GradientBorder/GradientBorder'

// export interface PreSaleCardProps {
//   title: string
//   subtitle: string
//   gradientDirection?: 'to right' | 'to left' | 'to top' | 'to bottom'
//   gradientPrimaryColor?: string
// }
// export const PreSaleCard: React.FC<PreSaleCardProps> = ({
//   title,
//   subtitle,
//   gradientDirection = 'to top',
//   gradientPrimaryColor = `${colors.invariant.pink}`
// }) => {
//   const { classes } = useStyles({ gradientDirection, gradientPrimaryColor })

//   return (
//     <GradientBorder
//       borderRadius={24}
//       opacity={0.9}
//       borderWidth={2}
//       borderColor={`linear-gradient(${gradientDirection} ,#A9B6BF26, ${gradientPrimaryColor})`}
//       backgroundColor={`linear-gradient(${gradientDirection}, #ef84f500 0%, ${gradientPrimaryColor}40 100%), #202946`}
//       innerClassName={classes.container}>
//       <Box className={classes.contentContainer}>
//         <Typography className={`${classes.title}`}>{title}</Typography>
//         <Typography className={`${classes.subtitle}`}>{subtitle}</Typography>
//       </Box>
//     </GradientBorder>
//   )
// }
