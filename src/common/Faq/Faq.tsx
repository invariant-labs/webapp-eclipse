import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useStyles } from './styles'
import { colors } from '@static/theme'

import React from 'react'

interface FaqProps {
  faqData: {
    question: string
    answer: string
  }[]
}


export const Faq: React.FC<FaqProps> = ({ faqData }) => {
  const { classes } = useStyles()



  return (
    <div className={classes.container}>
      {faqData.map((item, index) => (
        <Accordion disableGutters key={index} className={classes.accordion}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: colors.invariant.text }} />}
            className={classes.summary}>
            <Typography sx={{
              zIndex: 5, padding: '16px'
            }}>{item.question}</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              padding: '16px'
            }}
            className={classes.item}>
            <Typography dangerouslySetInnerHTML={{ __html: item.answer }} sx={{ zIndex: 5, position: 'relative' }} />
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  )
}
