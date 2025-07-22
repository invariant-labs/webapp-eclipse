import React from 'react'
import { Box, Skeleton, Typography } from '@mui/material'
import { colors, typography } from '@static/theme'
import useStyles from './style'

export interface IProps {
  isLoadingStats: boolean
  name: string
  value: string | number
  isGreen?: boolean
}

export const InfoItem: React.FC<IProps> = ({ isLoadingStats, name, value, isGreen }) => {
  const { classes, cx } = useStyles()

  return (
    <Box className={cx(classes.container, { [classes.green]: isGreen })}>
      <Box display='flex' alignItems='center' gap={'2px'}>
        <Typography
          style={typography.caption1}
          color={isGreen ? colors.invariant.green : colors.invariant.textGrey}>
          {name}{' '}
        </Typography>
      </Box>
      {isLoadingStats ? (
        <Skeleton
          variant='rounded'
          height={17}
          width={80}
          animation='wave'
          sx={{ borderRadius: '8px' }}
        />
      ) : (
        <Typography style={typography.caption2}>{value}</Typography>
      )}
    </Box>
  )
}

export default InfoItem
