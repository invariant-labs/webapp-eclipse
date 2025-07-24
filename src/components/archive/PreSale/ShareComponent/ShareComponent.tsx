// import { Box, Popover, Typography } from '@mui/material'
// import useStyles from './style'
// import { Button } from '@common/Button/Button'
// import download from '@static/svg/download.svg'
// import copy from '@static/svg/copy.svg'
// import { useRef } from 'react'
// import html2canvas from 'html2canvas'
// import grayLogo from '@static/png/gray-logo.png'
// import { formatNumberWithoutSuffix, printBN } from '@utils/utils'
// import { closeSmallIcon } from '@static/icons'

// interface IProps {
//   open: boolean
//   allocation: number
//   mintDecimals: number
//   onClose: () => void
//   addDownloadSnackbar: () => void
//   addCopySnackbar: () => void
// }

// export const ShareComponent: React.FC<IProps> = ({
//   open,
//   allocation,
//   mintDecimals,
//   onClose,
//   addDownloadSnackbar,
//   addCopySnackbar
// }) => {
//   const { classes, cx } = useStyles({ backgroundImage: grayLogo })
//   const captureRef = useRef<HTMLDivElement>(null)

//   const handleDownload = async () => {
//     const element = captureRef.current
//     if (!element) {
//       return
//     }

//     const canvas = await html2canvas(element)
//     const dataUrl = canvas.toDataURL('image/png')
//     const link = document.createElement('a')
//     link.href = dataUrl
//     link.download = 'screenshot.png'
//     link.click()

//     addDownloadSnackbar()
//   }

//   const handleCopy = async () => {
//     const element = captureRef.current
//     if (!element) {
//       return
//     }

//     const canvas = await html2canvas(element)
//     canvas.toBlob(blob => {
//       if (navigator.clipboard && blob) {
//         navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
//       }
//     })

//     addCopySnackbar()
//   }

//   return (
//     <>
//       <Popover
//         open={open}
//         onClose={() => onClose()}
//         anchorReference='none'
//         classes={{
//           root: classes.popoverRoot,
//           paper: cx(classes.container, classes.containerDisplay)
//         }}
//         transformOrigin={{ vertical: 'center', horizontal: 'center' }}>
//         <img onClick={onClose} className={classes.closeButton} src={closeSmallIcon} />
//         <Box className={classes.titleContainer}>
//           <Typography className={cx(classes.title, classes.titleDisplay)}>
//             Congratulations
//           </Typography>
//           <Typography className={cx(classes.description, classes.descriptionDisplay)}>
//             Congrats on joining the Invariant presale!
//           </Typography>
//         </Box>
//         <Box className={classes.allocationContainer}>
//           <Box className={cx(classes.allocationWrapper, classes.allocationWrapperDisplay)}>
//             <Typography className={cx(classes.allocation, classes.allocationDisplay)}>
//               {formatNumberWithoutSuffix(printBN(allocation, mintDecimals))} INVT
//             </Typography>
//           </Box>
//         </Box>
//         <Box className={classes.buttonsContainer}>
//           <Button scheme='pink' width='100%' onClick={() => handleDownload()}>
//             <div className={classes.buttonContainer}>
//               Download <img src={download} alt='download icon' />
//             </div>
//           </Button>
//           <Button scheme='green' width='100%' onClick={() => handleCopy()}>
//             <div className={classes.buttonContainer}>
//               Copy <img src={copy} alt='copy icon' />
//             </div>
//           </Button>
//         </Box>
//       </Popover>
//       <Box className={cx(classes.root, classes.rootScreenshot)}>
//         <Box className={classes.container} ref={captureRef}>
//           <Box className={classes.titleContainer}>
//             <Typography className={classes.title}>Congratulations</Typography>
//             <Typography className={classes.description}>
//               Congrats on joining the Invariant presale!
//             </Typography>
//           </Box>
//           <Box className={classes.allocationContainer}>
//             <Box className={classes.allocationWrapper}>
//               <Typography className={classes.allocation}>
//                 {formatNumberWithoutSuffix(printBN(allocation, mintDecimals))} INVT
//               </Typography>
//             </Box>
//           </Box>
//         </Box>
//       </Box>
//     </>
//   )
// }
