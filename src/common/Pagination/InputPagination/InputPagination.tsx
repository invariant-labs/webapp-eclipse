import { Box, Pagination, Typography, useMediaQuery } from '@mui/material'
import { useStyles } from './style'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { theme } from '@static/theme'

export interface IPaginationList {
  pages: number
  defaultPage: number
  handleChangePage: (page: number) => void
  variant: string
  squeeze?: boolean
  page?: number
  borderTop?: boolean
  pagesNumeration?: {
    lowerBound: number
    totalItems: number
    upperBound: number
  }
  activeInput?: boolean
}

export const InputPagination: React.FC<IPaginationList> = ({
  pages,
  defaultPage,
  handleChangePage,
  borderTop = false,
  squeeze = false,
  pagesNumeration,
  variant,
  activeInput = true,
  page
}) => {
  const isSm = useMediaQuery(theme.breakpoints.down('sm'))
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  const matches = useMediaQuery(theme.breakpoints.down('lg'))

  const { classes } = useStyles({ borderTop, isMobile })
  const initialPage = page || defaultPage

  const [currentPage, setCurrentPage] = useState<number | string>(initialPage)
  const [inputValue, setInputValue] = useState<string>(initialPage.toString())
  const [inputWidth, setInputWidth] = useState<number | string>(0)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (page && page !== currentPage) {
      setCurrentPage(page)
      setInputValue(page.toString())
    }
  }, [page])

  const handleInputChange = (value: string) => {
    if (value === '') {
      setInputValue('')
      return
    }

    if (!/^\d+$/.test(value)) {
      return
    }

    const numericValue = Number(value)

    if (numericValue > pages) {
      setInputValue(String(pages))
      return
    }

    setInputValue(value)
  }

  const changePageImmediate = (value: string) => {
    const num = parseInt(value)

    if (isNaN(num) || num < 1) {
      setCurrentPage(1)
      handleChangePage(1)
      return
    }

    if (num > pages) {
      setCurrentPage(pages)
      handleChangePage(pages)
      return
    }

    setCurrentPage(num)
    handleChangePage(num)
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      changePageImmediate(inputValue)
    }, 500)

    return () => clearTimeout(timeout)
  }, [inputValue])

  useLayoutEffect(() => {
    if (inputValue) {
      setInputWidth(inputValue.length * 12 + 16)
    } else {
      setInputWidth(1 * 12 + 16)
    }
  }, [inputValue])

  return (
    <Box className={classes.pagination}>
      {!isMobile && activeInput && (
        <Box display='flex' alignItems='center' justifyContent='flex-start' gap={1} width={240}>
          <Typography className={classes.labelText}> Go to</Typography>
          <input
            className={classes.input}
            style={{ width: inputWidth }}
            value={inputValue}
            onChange={e => handleInputChange(e.target.value)}
            type='text'
            inputMode='numeric'
            onBlur={() => {
              if (inputValue === '' || parseInt(inputValue) < 1) {
                setInputValue('1')
              } else if (parseInt(inputValue) > pages) {
                setInputValue(String(pages))
              }
            }}
          />
          <Typography className={classes.labelText}> page</Typography>
        </Box>
      )}

      <Pagination
        style={{ justifyContent: isSm ? 'center' : `${variant}` }}
        className={classes.root}
        count={pages}
        shape='rounded'
        siblingCount={squeeze ? 0 : matches ? 0 : 1}
        page={typeof currentPage === 'number' ? currentPage : 1}
        onChange={(_e, newPage) => {
          setCurrentPage(newPage)
          setInputValue(newPage.toString())
          handleChangePage(newPage)
        }}
      />

      {isMobile && activeInput && (
        <Box display='flex' alignItems='center' justifyContent='center' gap={1} width={240}>
          <Typography className={classes.labelText}> Go to</Typography>
          <input
            enterKeyHint='done'
            ref={inputRef}
            className={classes.input}
            style={{ width: inputWidth }}
            value={inputValue}
            onChange={e => handleInputChange(e.target.value)}
            type='text'
            inputMode='numeric'
            onBlur={() => {
              if (inputValue === '' || parseInt(inputValue) < 1) {
                setInputValue('1')
              } else if (parseInt(inputValue) > pages) {
                setInputValue(String(pages))
              }
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                inputRef.current?.blur()

                handleInputChange(e.currentTarget.value)
                ;(document.activeElement as HTMLElement)?.blur()
              }
            }}
          />
          <Typography className={classes.labelText}> page</Typography>
        </Box>
      )}

      {pagesNumeration ? (
        <Typography className={classes.labelText} width={240}>
          Showing {pagesNumeration.lowerBound}-{pagesNumeration.upperBound} of{' '}
          {pagesNumeration.totalItems}
        </Typography>
      ) : (
        <Box width={240} />
      )}
    </Box>
  )
}
