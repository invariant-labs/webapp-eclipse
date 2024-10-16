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
  placeholder?: string
  required?: boolean
}

export const TextInput: React.FC<ITextInput> = ({
  label,
  multiline,
  minRows,
  maxRows,
  value,
  handleChange,
  error = false,
  errorMessage = '',
  placeholder,
  required = false
}) => {
  const { classes } = useStyles()
  const capitalizedLabel =
    typeof label === 'string' && label.length > 0
      ? label.charAt(0).toUpperCase() + label.slice(1)
      : ''

  return (
    <Box className={classes.inputWrapper}>
      <div className={classes.labelContainer}>
        <h1 className={classes.headerTitle}>
          {capitalizedLabel}{' '}
          {required ? <span className={classes.errorIndicator}>&nbsp;*</span> : null}
        </h1>
      </div>
      <Input
        placeholder={placeholder ?? label}
        className={`${classes.input} ${error ? classes.inputError : ''}`}
        disableUnderline={true}
        multiline={multiline}
        minRows={minRows ?? 1}
        maxRows={maxRows ?? 4}
        value={value}
        onChange={handleChange}
        error={error}
        required={required}
      />
      <Typography className={classes.errorMessage}>{errorMessage}</Typography>
    </Box>
  )
}
