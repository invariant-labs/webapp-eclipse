import { Input } from '@material-ui/core'
import useStyles from './styles'
import React, { useRef, useState } from 'react'

interface INumericInput {
  label: string
  value: string
  onChange: (value: string) => void
  decimalsLimit?: number
  error?: boolean
  errorMessage?: string
}

const getScaleFromString = (value: string): number => {
  const parts = value.split('.')
  return parts.length > 1 ? parts[1].length : 0
}

export const NumericInput: React.FC<INumericInput> = ({
  label,
  value,
  onChange,
  decimalsLimit = 2,
  error = false,
  errorMessage = ''
}) => {
  const classes = useStyles()
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState(value)
  const capitalizedLabel =
    typeof label === 'string' && label.length > 0
      ? label.charAt(0).toUpperCase() + label.slice(1)
      : ''

  const allowOnlyDigitsAndTrimUnnecessaryZeros: React.ChangeEventHandler<HTMLInputElement> = e => {
    const regex = /^\d*\.?\d*$/
    if (e.target.value === '' || regex.test(e.target.value)) {
      const startValue = e.target.value
      const caretPosition = e.target.selectionStart

      let parsed = e.target.value
      const zerosRegex = /^0+\d+\.?\d*$/
      if (zerosRegex.test(parsed)) {
        parsed = parsed.replace(/^0+/, '')
      }

      const dotRegex = /^\.\d*$/
      if (dotRegex.test(parsed)) {
        parsed = `0${parsed}`
      }

      if (getScaleFromString(parsed) > decimalsLimit) {
        const parts = parsed.split('.')
        parsed = parts[0] + '.' + parts[1].slice(0, decimalsLimit)
      }

      const diff = startValue.length - parsed.length

      setInputValue(parsed)
      onChange(parsed)
      if (caretPosition !== null && parsed !== startValue) {
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = Math.max(caretPosition - diff, 0)
            inputRef.current.selectionEnd = Math.max(caretPosition - diff, 0)
          }
        }, 0)
      }
    } else if (!regex.test(e.target.value)) {
      setInputValue('')
      onChange('')
    }
  }

  return (
    <div className={classes.inputWrapper}>
      <h1 className={classes.headerTitle}>{capitalizedLabel}</h1>
      <Input
        inputRef={inputRef}
        type='text'
        placeholder={label}
        className={`${classes.input} ${error ? classes.inputError : ''}`}
        disableUnderline={true}
        value={inputValue}
        onChange={allowOnlyDigitsAndTrimUnnecessaryZeros}
        error={error}
      />
      {error && errorMessage && <p className={classes.errorMessage}>{errorMessage}</p>}
    </div>
  )
}
