import React from 'react'
import useStyles from './styles'
import { Box, Input, Typography } from '@mui/material'

interface ITextInput {
  label: string
  className?: string
  value: string
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  multiline?: boolean
  minRows?: number
  maxRows?: number
  error?: boolean
  errorMessage?: string
}

export const TextInput: React.FC<ITextInput> = ({
  label,
  multiline,
  minRows,
  maxRows,
  value,
  handleChange,
  error = false,
  errorMessage = ''
}) => {
  const { classes } = useStyles()
  const capitalizedLabel =
    typeof label === 'string' && label.length > 0
      ? label.charAt(0).toUpperCase() + label.slice(1)
      : ''

  return (
    <Box className={classes.inputWrapper}>
      <h1 className={classes.headerTitle}>{capitalizedLabel}</h1>
      <Input
        placeholder={label}
        className={`${classes.input} ${error ? classes.inputError : ''}`}
        disableUnderline={true}
        multiline={multiline}
        minRows={minRows ?? 1}
        maxRows={maxRows ?? 4}
        value={value}
        onChange={handleChange}
        error={error}
      />
      <Typography className={classes.errorMessage}>{errorMessage}</Typography>
    </Box>
  )
}
