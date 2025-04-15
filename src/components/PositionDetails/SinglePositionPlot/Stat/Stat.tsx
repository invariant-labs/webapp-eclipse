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
        <Skeleton
          sx={{ alignSelf: 'center', margin: 'auto' }}
          variant='rounded'
          width={100}
          height={27}
        />
      ) : (
        <Box className={classes.value}>{value}</Box>
      )}
    </Box>
  )
}
