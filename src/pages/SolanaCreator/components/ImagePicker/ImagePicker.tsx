import Logo1 from '@static/svg/SolanaCreator/Logo.svg'
import Logo2 from '@static/svg/SolanaCreator/Logo2.svg'
import Cat1 from '@static/svg/SolanaCreator/Cat1.svg'
import Cat2 from '@static/svg/SolanaCreator/Cat2.svg'
import useStyle from './styles'
import { Controller } from 'react-hook-form'
import { ChangeEvent } from 'react'
import { Button } from '@material-ui/core'
import { CloudUpload as UploadIcon } from '@material-ui/icons'
const defaultImages: string[] = [Logo1, Logo2, Cat1, Cat2]

export const ImagePicker: React.FC<{ control: any }> = ({ control }) => {
  const classes = useStyle()

  return (
    <Controller
      name='image'
      control={control}
      defaultValue=''
      render={({ field: { onChange, value } }) => (
        <div className={classes.root}>
          <div className={classes.imageContainer}>
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
            <label htmlFor='contained-button-file' className={classes.uploadButton}>
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
            </label>
          </div>
        </div>
      )}
    />
  )
}
