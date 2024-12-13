import { defaultImages } from '@store/consts/static'

export async function getFileFromInput(inputString: string) {
  function isStaticFile(str: string) {
    return defaultImages.includes(str)
  }

  if (isStaticFile(inputString)) {
    const response = await fetch(inputString)
    const blob = await response.blob()

    const fileName = inputString.split('/').pop()
    const file = new File([blob], fileName || 'logo', { type: blob.type })

    return file
  }

  return stringToFile(inputString)
}

export const stringToFile = (dataUrl: string) => {
  const base64Data = dataUrl.split(',')[1]
  const typeArr = dataUrl.split(',')[0].match(/:(.*?);/)
  const fileType = typeArr?.[1] ?? 'image/png'
  const fileName = `logo.${fileType.split('/')[1]}`
  const byteString = atob(base64Data)
  const byteArray = Uint8Array.from(Array.from(byteString, char => char.charCodeAt(0)))
  const blob = new Blob([byteArray], { type: fileType })
  const file = new File([blob], fileName, { type: fileType })
  return file
}
