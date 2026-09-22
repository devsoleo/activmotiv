import { useState, useRef, createRef, ReactNode } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Button, Card, RadioButton, useTheme, IconButton, Portal, Dialog } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'

export interface QuestionnaireItem {
  uid: string
  content: string
  answers: Array<{
    minimum: string
    maximum: string
    size: number
  }>
}

export interface QuestionnaireProps {
  title: string
  list: QuestionnaireItem[]
  onSubmit: (results: Array<{ question: string; answer: any }>) => void
}

export default function Questionnaire({ title, list, onSubmit }: QuestionnaireProps) {
  const theme = useTheme()
  const [hasSubmit, setHasSubmit] = useState(false)
  const [infoModalVisible, setInfoModalVisible] = useState(true)

  const size = list.length

  const [answers, setAnswers] = useState<any[]>(new Array(list.length).fill(null))

  const handleAnswerChange = (i: number, v: any) => {
    const u = [...answers]
    u[i] = v
    setAnswers(u)
  }

  const scrollViewRef = useRef<ScrollView | null>(null)
  const sectionRefs = useRef<React.RefObject<any>[]>(list.map(() => createRef()))

  const scrollToSection = (index: number) => {
    const ref = sectionRefs.current[index]
    if (ref && ref.current && scrollViewRef.current) {
      ref.current.measureLayout(
        scrollViewRef.current,
        (x: number, y: number) => {
          scrollViewRef.current?.scrollTo({ y: y, animated: true })
        },
        () => {}
      )
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.headerContainer}>
        <View style={styles.headerSide} />
        <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onBackground }]}>{title}</Text>
        <View style={styles.headerSide}>
          <IconButton
            icon="information-outline"
            size={24}
            iconColor={theme.colors.primary}
            onPress={() => setInfoModalVisible(true)}
          />
        </View>
      </View>

      <ScrollView ref={scrollViewRef}>
        {list.map((item, index) => {
          return (
            <QuestionCard
              key={item.uid}
              question={item}
              globalIndex={index}
              globalSize={size}
              hasSubmit={hasSubmit}
              sectionRefs={sectionRefs}
              onUpdate={value => { handleAnswerChange(index, value) }}
            />
          )
        })}
      </ScrollView>

      <View style={{ marginVertical: 12, alignSelf: 'center' }}>
        <Button mode="outlined" onPress={() => {
          setHasSubmit(true)

          function findFirstNullIndex(arr: any[]): number {
            for (let i = 0; i < arr.length; i++) {
              const el = arr[i];

              if (el === null) {
                return i
              }

              if (Array.isArray(el)) {
                if (el.some(sub => sub === null || (Array.isArray(sub) && findFirstNullIndex(sub) !== -1))) {
                  return i
                }
              }
            }

            return -1
          }

          const missingAnswer = findFirstNullIndex(answers)

          if (missingAnswer !== -1) return scrollToSection(missingAnswer)

          const formattedResults = list.map((item, index) => {
            const cardAns = answers[index]
            const val = (Array.isArray(cardAns) && cardAns.length === 1) ? cardAns[0] : cardAns
            return {
              question: item.content,
              answer: val
            }
          })

          onSubmit(formattedResults)
        }}>Valider mes réponses</Button>
      </View>

      <Portal>
        <Dialog visible={infoModalVisible} onDismiss={() => setInfoModalVisible(false)}>
          <Dialog.Title style={{ textAlign: 'center' }}>Informations</Dialog.Title>
          <Dialog.ScrollArea style={{ paddingHorizontal: 24, maxHeight: 400 }}>
            <ScrollView contentContainerStyle={{ paddingVertical: 8, gap: 12 }}>
              <Text variant="bodyMedium">
                Ce questionnaire évalue vos perceptions et vos intentions relatives à l'activité physique :
              </Text>
              <Text variant="bodyMedium">
                • <Text style={{ fontWeight: 'bold' }}>Instructions</Text> : Lisez chaque proposition attentivement et sélectionnez une valeur sur l'échelle numérique.
              </Text>
              <Text variant="bodyMedium">
                • <Text style={{ fontWeight: 'bold' }}>Échelle de réponse</Text> : Les termes à chaque extrémité indiquent le niveau minimum (1) et maximum (7) d'accord ou de ressenti.
              </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  Lisez attentivement chaque phrase et répondez sur l'échelle située en dessous en sélectionnant un nombre correspondant le mieux à ce que vous pensez.
                </Text>
      
                <View
                  style={[
                    styles.quoteContainer,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderLeftColor: theme.colors.primary
                    }
                  ]}
                >
                  <Text variant="bodyMedium" style={[styles.quoteText, { color: theme.colors.onSurfaceVariant }]}>
                    « L’activité physique se réfère à tout mouvement corporel produit par les muscles squelettiques qui requiert une dépense d’énergie. L’activité physique désigne tous les mouvements que l’on effectue notamment dans le cadre des loisirs, pour se déplacer d’un endroit à l’autre, sur le lieu de travail ou lors des tâches ménagères. »
                  </Text>
                  <Text variant="labelMedium" style={[styles.quoteSource, { color: theme.colors.primary }]}>
                    — OMS, 2024
                  </Text>
                </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setInfoModalVisible(false)}>Compris</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  )
}

interface QuestionCardProps {
  question: QuestionnaireItem
  globalIndex: number
  globalSize: number
  hasSubmit: boolean
  sectionRefs: React.MutableRefObject<React.RefObject<any>[]>
  onUpdate: (value: any) => void
}

const QuestionCard = ({ question, globalIndex, globalSize, hasSubmit, sectionRefs, onUpdate }: QuestionCardProps) => {
  const theme = useTheme()
  const [cardAnswers, setCardAnswers] = useState<any[]>(new Array(question.answers.length).fill(null))

  const handleCardAnswerChange = (i: number, v: number) => {
    const u = [...cardAnswers]
    u[i] = v
    setCardAnswers(u)
    onUpdate(u)
  }

  return (
    <Card style={{ margin: 12, borderRadius: 12 }} ref={sectionRefs.current[globalIndex]}>
      <Card.Content style={{ alignItems: 'center' }}>
        <Text variant="titleMedium" style={{ fontWeight: "bold", color: theme.colors.primary, marginBottom: 4 }}>
          Question {globalIndex + 1} / {globalSize}
        </Text>
        <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 20, color: theme.colors.onSurface }}>
          {question.content}
        </Text>

        {question.answers.map((answer, answerIndex) => (
          <View key={question.uid + "_" + answerIndex} style={styles.answersContainer}>
            <RadioButton.Group
              onValueChange={value => { handleCardAnswerChange(answerIndex, Number(value)) }}
              value={cardAnswers[answerIndex] != null ? String(cardAnswers[answerIndex]) : ''}
            >
              <View style={styles.labelsRow}>
                <Text variant="bodyMedium" style={[styles.minLabel, { color: theme.colors.onSurfaceVariant }]}>
                  {answer.minimum}
                </Text>
                <Text variant="bodyMedium" style={[styles.maxLabel, { color: theme.colors.onSurfaceVariant }]}>
                  {answer.maximum}
                </Text>
              </View>

              <View style={styles.radioRow}>
                {[...new Array(answer.size)].map((_, radioIndex) => (
                  <View style={styles.radioItem} key={question.uid + "_" + answerIndex + "_" + radioIndex}>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                      {radioIndex + 1}
                    </Text>
                    <RadioButton value={String(radioIndex + 1)} />
                  </View>
                ))}
              </View>
            </RadioButton.Group>

            {cardAnswers[answerIndex] == null && hasSubmit && (
              <Text style={{ color: theme.colors.error, paddingTop: 8, textAlign: 'center' }} variant="bodyMedium">
                Réponse manquante !
              </Text>
            )}
          </View>
        ))}
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  headerSide: {
    width: 48,
    alignItems: 'center',
  },
  title: { flex: 1, textAlign: 'center', paddingVertical: 12, fontWeight: "bold" },
  answersContainer: {
    width: '100%',
    paddingHorizontal: 4,
    marginTop: 8
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    marginBottom: 8
  },
  minLabel: {
    flex: 1,
    textAlign: 'left',
    paddingRight: 8,
    fontWeight: '600'
  },
  maxLabel: {
    flex: 1,
    textAlign: 'right',
    paddingLeft: 8,
    fontWeight: '600'
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  radioItem: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  quoteContainer: {
    padding: 14,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginVertical: 4
  },
  quoteText: {
    fontStyle: 'italic',
    lineHeight: 20
  },
  quoteSource: {
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 8
  }
})