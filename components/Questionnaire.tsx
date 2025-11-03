import { useState, useRef, createRef } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Button, Card, RadioButton } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import InformationFrame from './InformationFrame'

export default function Questionnaire({ title, list, infos, onSubmit }) {
  const [hasSubmit, setHasSubmit] = useState(false)

  const listHeaders = list.map(item => item.uid)
  const size = list.length

  const [answers, setAnswers] =  useState(new Array(list.length).fill(null))

  const handleAnswerChange = (i, v) => {
    const u = [...answers]
    u[i] = v
    setAnswers(u)
  }

  const scrollViewRef = useRef(null)
  const sectionRefs = useRef(list.map(() => createRef()))

  const scrollToSection = (index) => {
    const ref = sectionRefs.current[index]
    ref.current?.measureLayout(
      scrollViewRef.current,
      (x, y) => {
        scrollViewRef.current.scrollTo({ y: y, animated: true })
      }
    )
  }

  return (
    <SafeAreaView style={{ flex: 1}}>
      <Text variant="headlineLarge" style={styles.title}>{ title }</Text>

      <InformationFrame actionName="Commencer le questionnaire" content={infos} />

      <ScrollView ref={scrollViewRef}>
        {list.map((item, index) => {
          return <QuestionCard key={item.uid} question={item} globalIndex={index} globalSize={size} hasSubmit={hasSubmit} sectionRefs={sectionRefs} onUpdate={value => { handleAnswerChange(index, value)}} />;
        })}
      </ScrollView>

      <View style={{ marginVertical: 12, alignSelf: 'center' }}>
        <Button mode="outlined" onPress={() => {
          setHasSubmit(true)

          function findFirstNullIndex(arr) {
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

          if (missingAnswer != -1) return scrollToSection(missingAnswer)

          console.log(listHeaders, answers)

          onSubmit(listHeaders, answers)
        }}>Valider mes réponses</Button>
      </View>
    </SafeAreaView>
  )
}

const QuestionCard = ({ question, globalIndex, globalSize, hasSubmit, sectionRefs, onUpdate }) => {
  const [cardAnswers, setCardAnswers] =  useState(new Array(question.answers.length).fill(null))

  const handleCardAnswerChange = (i, v) => {
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
            <RadioButton.Group  onValueChange={value => {handleCardAnswerChange(answerIndex, Number(value))}} value={String(cardAnswers[answerIndex])}>
              <View style={styles.radioGroup}>
                {[...new Array(answer.size)].map((_, radioIndex) => (
                  <View style={[styles.radioItem]} key={question.uid + "_" + answerIndex + "_" + radioIndex}>
                    <Text style={styles.radioLabel}>{ (radioIndex == 0) ? answer.minimum : (radioIndex == answer.size - 1) ? answer.maximum : ""}</Text>
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