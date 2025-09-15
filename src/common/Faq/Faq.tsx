import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useStyles } from './styles'
import { colors } from '@static/theme'

import React from 'react'

interface FaqProps {
  faqData: {
    question: string
    answer: string | React.ReactNode
  }[]
}

export const Faq: React.FC<FaqProps> = ({ faqData }) => {
  const { classes } = useStyles()

  return (
    <div className={classes.container}>
      {faqData.map((item, index) => (
        <React.Fragment key={index}>
          <Accordion disableGutters key={index} className={classes.accordion}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: colors.invariant.text }} />}
              className={classes.summary}>
              <Typography
                sx={{
                  zIndex: 5
                }}>
                {item.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.item}>
              {typeof item.answer === 'string' ? (
                <Typography
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                  sx={{ zIndex: 5, position: 'relative' }}
                />
              ) : (
                item.answer
              )}
            </AccordionDetails>
          </Accordion>
          {index !== faqData.length - 1 && <div className={classes.separator} />}
        </React.Fragment>
      ))}
    </div>
  )
}
