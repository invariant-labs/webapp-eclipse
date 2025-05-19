import { Button } from '@mui/material'
import { useStyles } from './style'
import { useLayoutEffect, useState } from 'react'

export interface IPaginationList {
  pages: number
  defaultPage: number
  handleChangePage: (page: number) => void
  variant: string
  squeeze?: boolean
  page?: number
}

export const InputPagination: React.FC<IPaginationList> = ({
  pages,
  defaultPage,
  handleChangePage
}) => {
  const { classes } = useStyles()

  const [currentPage, setCurrentPage] = useState(defaultPage)

  const [inputWidth, setInputWidth] = useState(0)

  const changePage = (page: number) => {
    if (page < 1) {
      setCurrentPage(1)
      handleChangePage(1)
      return
    }

    if (page > pages) {
      setCurrentPage(pages)
      handleChangePage(pages)
      return
    }

    setCurrentPage(page)
    handleChangePage(page)
  }

  useLayoutEffect(() => {
    if (currentPage) {
      setInputWidth(currentPage.toString().length * 12 + 16)
    }
  }, [currentPage])

  return (
    <>
      <div className={classes.pagination}>
        <Button
          className={classes.controlButton}
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}>
          <svg viewBox='0 0 24 24' width='44' height='44'>
            <path d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z'></path>
          </svg>
        </Button>
        Page
        <input
          className={classes.input}
          style={{ width: inputWidth }}
          value={currentPage}
          onChange={e => changePage(+e.target.value)}
          type='number'
        />
        of {pages}
        <Button
          className={classes.controlButton}
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === pages}>
          <svg viewBox='0 0 24 24' width='44' height='44'>
            <path d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z'></path>
          </svg>
        </Button>
      </div>
    </>
  )
}
