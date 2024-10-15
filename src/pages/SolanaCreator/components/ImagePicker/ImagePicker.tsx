import Logo1 from '@static/svg/SolanaCreator/Logo.svg'
import Logo2 from '@static/svg/SolanaCreator/Logo2.svg'
import Cat1 from '@static/svg/SolanaCreator/Cat1.svg'
import Cat2 from '@static/svg/SolanaCreator/Cat2.svg'
import { Controller } from 'react-hook-form'
import { ChangeEvent } from 'react'
import UploadIcon from '@mui/icons-material/CloudUpload'
import useStyles from './styles'
import { Box, Button } from '@mui/material'

interface ImagePickerProps {
  control: any
}

const defaultImages: string[] = [Logo1, Logo2, Cat1, Cat2]
export const ImagePicker: React.FC<ImagePickerProps> = ({ control }) => {
  const { classes } = useStyles()

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
              <Button className={`${classes.imageButton} selected`} onClick={() => onChange(value)}>
                <img src={value} alt='Uploaded' className={classes.uploadedImage} />
              </Button>
            )}
            <Button component='label' className={classes.imageButton} aria-label='upload image'>
              <input
                accept='image/*'
                className={classes.hiddenInput}
                id='contained-button-file'
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
              <UploadIcon className={classes.uploadIcon} />
            </Button>
          </Box>
        </Box>
      )}
    />
  )
}
