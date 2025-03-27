import { Box } from '@mui/material'
import useStyles from './style'
import icons from '@static/icons'
import { useState } from 'react'

type Props = {
  children: React.ReactNode
} & React.ComponentProps<typeof Box>

export const Information = ({ children, ...boxProps }: Props) => {
  const { classes } = useStyles()

  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      {isOpen && (
        <Box className={classes.container} {...boxProps}>
          {children}
          <img
            className={classes.closeIcon}
            src={icons.closeYellow}
            alt='Close'
            onClick={() => setIsOpen(false)}
          />
        </Box>
      )}
    </>
  )
}
