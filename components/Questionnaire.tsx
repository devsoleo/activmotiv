import { useState, useRef, createRef, ReactNode } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Button, Card, RadioButton, useTheme } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import InformationFrame from './InformationFrame'

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
  infos: ReactNode
  onSubmit: (results: Array<{ question: string; answer: any }>) => void
}

export default function Questionnaire({ title, list, infos, onSubmit }: QuestionnaireProps) {
  const theme = useTheme()
  const [hasSubmit, setHasSubmit] = useState(false)

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
      <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onBackground }]}>{ title }</Text>

      <InformationFrame actionName="Commencer le questionnaire" content={infos} />

      <ScrollView ref={scrollViewRef}>
        {list.map((item, index) => {
          return <QuestionCard key={item.uid} question={item} globalIndex={index} globalSize={size} hasSubmit={hasSubmit} sectionRefs={sectionRefs} onUpdate={value => { handleAnswerChange(index, value)}} />;
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
  const [cardAnswers, setCardAnswers] = useState<any[]>(new Array(question.answers.length).fill(null))

  const handleCardAnswerChange = (i: number, v: number) => {
    const u = [...cardAnswers]
    u[i] = v
    setCardAnswers(u)
    onUpdate(u)
  }

  return (
    <Card style={{ margin: 12 }} ref={sectionRefs.current[globalIndex]}>
      <Card.Content style={{ alignItems: 'center' }}>
        <Text variant="titleMedium" style={{ fontWeight: "bold" }}>Question : {globalIndex + 1}/{globalSize}</Text>
        <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 20 }}>{question.content}</Text>

        {question.answers.map((answer, answerIndex) => (
          <View key={question.uid + "_" + answerIndex} style={{ alignItems: 'center' }}>
            <RadioButton.Group onValueChange={value => {handleCardAnswerChange(answerIndex, Number(value))}} value={String(cardAnswers[answerIndex])}>
              <View style={styles.radioGroup}>
                {[...new Array(answer.size)].map((_, radioIndex) => (
                  <View style={[styles.radioItem]} key={question.uid + "_" + answerIndex + "_" + radioIndex}>
                    <Text style={styles.radioLabel}>{ (radioIndex === 0) ? answer.minimum : (radioIndex === answer.size - 1) ? answer.maximum : ""}</Text>
                    <RadioButton value={String(radioIndex + 1)} />
                  </View>
                ))}
              </View>
            </RadioButton.Group>
            <Text style={{ color: 'red', paddingTop: 6 }} variant='titleMedium'>{ (cardAnswers[answerIndex] == null && hasSubmit) && "Réponse manquante !"}</Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', paddingVertical: 12, fontWeight: "bold" },
  text: { paddingBottom: 6, paddingTop: 6 },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radioItem: {
    alignItems: 'center',
    width: 50
  },
  radioLabel: {
    marginBottom: 4,
    textAlign: 'center',
    width: 200,
  },
})
