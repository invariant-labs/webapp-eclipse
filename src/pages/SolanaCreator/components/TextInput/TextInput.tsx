import React from 'react'
import { Box, Input, Typography } from '@material-ui/core'
import useStyles from './styles'

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
  const classes = useStyles()
  const capitalizedLabel =
    typeof label === 'string' && label.length > 0
      ? label.charAt(0).toUpperCase() + label.slice(1)
      : ''

  return (
    <Box className={classes.inputWrapper}>
      <div className={classes.labelContainer}>
        <h1 className={classes.headerTitle}>{capitalizedLabel}</h1>
        {!error && required && <span className={classes.requiredDot} />}
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
