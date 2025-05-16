import { Box, Skeleton } from '@mui/material'
import { useStyles } from './style'

type Props = {
  name?: React.ReactNode
  value: React.ReactNode
  isHorizontal?: boolean
  isLoading?: boolean
}

export const Stat = ({ isLoading = false, name, value, isHorizontal = false }: Props) => {
  const { classes } = useStyles({ isHorizontal })

  return (
    <Box className={classes.container}>
      {name && <Box className={classes.name}>{name}</Box>}
      {isLoading ? (
        <Box height={40} display='flex' alignItems='center' margin={'auto'}>
          <Skeleton className={classes.skeleton} variant='rounded' />
        </Box>
      ) : (
        <Box className={classes.value}>{value}</Box>
      )}
    </Box>
  )
}
