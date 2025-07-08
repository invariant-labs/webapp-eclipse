import { Box, Typography } from '@mui/material'
import useStyles from './style'
import { Button } from '@common/Button/Button'
import download from '@static/svg/download.svg'
import copy from '@static/svg/copy.svg'
import { useRef } from 'react'
import html2canvas from 'html2canvas'
import grayLogo from '@static/png/gray-logo.png'

interface IProps {
  hide: () => void
}

export const ShareComponent: React.FC<IProps> = ({ hide }) => {
  const { classes, cx } = useStyles({ backgroundImage: grayLogo })
  const captureRef = useRef<HTMLDivElement>(null)

  const handleCopy = async () => {
    const element = captureRef.current
    if (!element) {
      return
    }

    const clonedElement = element.cloneNode(true) as HTMLDivElement
    clonedElement.style.width = '480px'
    clonedElement.style.position = 'fixed'
    clonedElement.style.top = '-100%'
    clonedElement.style.left = '-100%'
    clonedElement.style.paddingBottom = '32px'
    clonedElement.style.borderRadius = '0'
    document.body.appendChild(clonedElement)

    const canvas = await html2canvas(clonedElement)
    canvas.toBlob(blob => {
      if (navigator.clipboard && blob) {
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      }
    })
  }

  const handleDownload = async () => {
    const element = captureRef.current
    if (!element) {
      return
    }

    const clonedElement = element.cloneNode(true) as HTMLDivElement
    clonedElement.style.width = '480px'
    clonedElement.style.position = 'fixed'
    clonedElement.style.top = '-100%'
    clonedElement.style.left = '-100%'
    clonedElement.style.paddingBottom = '32px'
    clonedElement.style.borderRadius = '0'
    document.body.appendChild(clonedElement)

    const canvas = await html2canvas(clonedElement)

    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = 'screenshot.png'
    link.click()
  }

  return (
    <>
      <Box className={classes.background} onClick={() => hide()}></Box>
      <Box className={classes.root}>
        <Box className={classes.container}>
          <Box className={classes.titleContainer}>
            <Typography className={cx(classes.title, classes.titleMobile)}>
              Congratulations
            </Typography>
            <Typography className={cx(classes.description, classes.descriptionMobile)}>
              Congrats on joining the Invariant presale!
            </Typography>
          </Box>
          <Box className={classes.allocationContainer}>
            <Box className={cx(classes.allocationWrapper, classes.allocationWrapperMobile)}>
              <Typography className={cx(classes.allocation, classes.allocationMobile)}>
                183,293,233.12 INVT
              </Typography>
            </Box>
          </Box>
          <Box className={classes.buttonsContainer}>
            <Button scheme='pink' width='100%'>
              <div className={classes.buttonContainer} onClick={() => handleDownload()}>
                Download <img src={download} alt='download icon' />
              </div>
            </Button>
            <Button scheme='green' width='100%' onClick={() => handleCopy()}>
              <div className={classes.buttonContainer}>
                Copy <img src={copy} alt='copy icon' />
              </div>
            </Button>
          </Box>
        </Box>
      </Box>
      <Box className={cx(classes.root, classes.rootScreenshot)}>
        <Box className={classes.container} ref={captureRef}>
          <Box className={classes.titleContainer}>
            <Typography className={classes.title}>Congratulations</Typography>
            <Typography className={classes.description}>
              Congrats on joining the Invariant presale!
            </Typography>
          </Box>
          <Box className={classes.allocationContainer}>
            <Box className={classes.allocationWrapper}>
              <Typography className={classes.allocation}>183,293,233.12 INVT</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}
