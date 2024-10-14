import React, { ChangeEvent } from 'react'
import { Controller } from 'react-hook-form'
import { Box, Button } from '@material-ui/core'
import { CloudUpload as UploadIcon } from '@material-ui/icons'
import useStyles from './styles'

import Logo1 from '@static/svg/SolanaCreator/Logo.svg'
import Logo2 from '@static/svg/SolanaCreator/Logo2.svg'
import Cat1 from '@static/svg/SolanaCreator/Cat1.svg'
import Cat2 from '@static/svg/SolanaCreator/Cat2.svg'
interface ImagePickerProps {
  control: any
}

const defaultImages: string[] = [Logo1, Logo2, Cat1, Cat2]

export const ImagePicker: React.FC<ImagePickerProps> = ({ control }) => {
  const classes = useStyles()

  return (
    <Controller
      name='image'
      control={control}
      defaultValue=''
      render={({ field: { onChange, value } }) => (
        <Box className={classes.root}>
          <Box className={classes.imageContainer}>
            {defaultImages.map((image, index) => (
              <Button
                key={index}
                className={`${classes.imageButton} ${value === image ? 'selected' : ''}`}
                onClick={() => onChange(image)}>
                <img src={image} alt={`Default ${index + 1}`} />
              </Button>
            ))}
            {value && !defaultImages.includes(value) && (
              <Button className={`${classes.imageButton} selected`} disabled>
                <img src={value} alt='Uploaded' className={classes.uploadedImage} />
              </Button>
            )}
          </Box>
          <Button component='label' className={classes.uploadButton} disableRipple>
            <UploadIcon className={classes.uploadIcon} />
            <input
              accept='image/*'
              className={classes.hiddenInput}
              id='contained-button-file-full-width'
              type='file'
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (e: ProgressEvent<FileReader>) => {
                    if (e.target?.result) {
                      onChange(e.target.result as string)
                    }
                  }
                  reader.readAsDataURL(file)
                }
              }}
            />
          </Button>
        </Box>
      )}
    />
  )
}

export default ImagePicker
