import React from 'react'
import { Box, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material'
import useStyles from './style'
import { typography } from '@static/theme'

export interface StepItem {
  id: number
  label: string
  name: string
  tokenPart?: string
  pricePart?: string
}

interface SaleStepperProps {
  steps: StepItem[]
  currentStep: number
  isLoading?: boolean
}

export const SaleStepper: React.FC<SaleStepperProps> = ({
  steps,
  currentStep,
  isLoading = false
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

  const connectorHeight = Math.round(720 / steps.length - 60)
  const { classes } = useStyles({ connectorHeight })

  const splitLabel = (label: string) => {
    if (label.includes('INVT =')) {
      const [tokenPart, pricePart] = label.split(' = ')
      return { tokenPart, pricePart }
    } else if (label.includes('$ =')) {
      const [pricePart, tokenPart] = label.split(' = ')
      return { tokenPart, pricePart }
    }
    return { tokenPart: label, pricePart: '' }
  }

  const getVerticalConnectorClass = (
    index: number,
    steps: StepItem[],
    currentStep: number
  ): string => {
    const isLast = index === steps.length - 1
    if (isLast) return ''

    const step = steps[index]
    const nextStep = steps[index + 1]
    const isCompleted = step.id <= currentStep
    const isNextCompleted = nextStep.id <= currentStep
    const hasIntermediateNode = index > 0 && index < steps.length - 2 && steps.length >= 3

    if (hasIntermediateNode && currentStep > 2) {
      return classes.connectorGray
    }

    if (isCompleted && isNextCompleted) {
      return hasIntermediateNode ? classes.connectorGreenGrayPink : classes.connectorGreenPink
    } else if (isCompleted && !isNextCompleted) {
      return classes.connectorGreenGrayPink
    } else {
      return classes.connector
    }
  }

  const getHorizontalConnectorClass = (
    index: number,
    steps: StepItem[],
    currentStep: number
  ): string => {
    const isLast = index === steps.length - 1
    if (isLast) return ''

    const step = steps[index]
    const nextStep = steps[index + 1]
    const isCompleted = step.id <= currentStep
    const isNextCompleted = nextStep.id <= currentStep
    const hasIntermediateNode = index > 0 && index < steps.length - 2 && steps.length >= 3

    if (hasIntermediateNode && currentStep > 2) {
      return classes.horizontalConnectorGray
    }

    if (isCompleted && isNextCompleted) {
      return hasIntermediateNode
        ? classes.horizontalConnectorGreenGrayPink
        : classes.horizontalConnectorGreenPink
    } else if (isCompleted && !isNextCompleted) {
      return classes.horizontalConnectorGreenGrayPink
    } else {
      return classes.horizontalConnector
    }
  }

  const getNodeClass = (index: number, isFirst: boolean): string => {
    let nodeClass = classes.stepCircle

    if (index < currentStep) {
      nodeClass += isFirst ? ` ${classes.startStepNode}` : ` ${classes.middleStepNode}`
    } else if (index === currentStep) {
      nodeClass += ` ${classes.endStepNode}`
    }

    return nodeClass
  }

  const getStepLabelClass = (index: number): { labelClass: string; lowerLabelClass: string } => {
    let labelClass = classes.stepLabel
    let lowerLabelClass = classes.stepLowerLabel

    if (index === currentStep) {
      labelClass += ` ${classes.currentStepLabel}`
      lowerLabelClass += ` ${classes.currentStepLowerLabel}`
    }

    return { labelClass, lowerLabelClass }
  }

  return (
    <Box className={classes.container}>
      {steps.map((step, index) => {
        const isFirst = index === 0
        const isLast = index === steps.length - 1

        const verticalConnectorClass = getVerticalConnectorClass(index, steps, currentStep)
        const horizontalConnectorClass = getHorizontalConnectorClass(index, steps, currentStep)

        const nodeClass = getNodeClass(index, isFirst)
        const { labelClass, lowerLabelClass } = getStepLabelClass(index)

        const { tokenPart, pricePart } = splitLabel(step.label)

        return (
          <Box
            key={step.id}
            className={`${classes.stepContainer} ${!isLast ? classes.stepMargin : ''}`}>
            <Box className={classes.stepContent}>
              <Box className={nodeClass}>
                <Typography
                  sx={{
                    ...typography.body1,
                    lineHeight: isMobile ? '24px' : '32px'
                  }}>
                  {step.id}
                </Typography>
              </Box>

              {isLoading ? (
                <Skeleton variant='text' width={80} height={24} className={classes.labelSkeleton} />
              ) : isMobile ? (
                <Box
                  className={labelClass}
                  sx={{
                    marginTop: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center'
                  }}>
                  <Typography className={classes.labelText}>{tokenPart}</Typography>
                  <Typography className={classes.labelText}>{pricePart}</Typography>
                </Box>
              ) : (
                <Box className={classes.stepLabelContainer}>
                  <Typography className={labelClass}>{step.name}</Typography>
                  <Typography className={lowerLabelClass}>{step.label}</Typography>
                </Box>
              )}
            </Box>

            {!isLast && (
              <>
                <Box className={verticalConnectorClass} />
                <Box className={horizontalConnectorClass} />
              </>
            )}
          </Box>
        )
      })}
    </Box>
  )
}

export default SaleStepper
