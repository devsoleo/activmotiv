import { useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, useTheme } from 'react-native-paper'
import { attitudeAffectiveList, attitudeInstrumentaleList, intentionList } from '@/constants/forms'
import Questionnaire from '@/components/Questionnaire'
import { useRouter } from 'expo-router'
import { enqueueForm } from '@/services/queue/questionnaires'

function getRandomItem<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function QuestionnaireScreen() {
  const router = useRouter()
  const theme = useTheme()

  const list = useMemo(() => shuffleArray([
    getRandomItem(attitudeAffectiveList),
    getRandomItem(attitudeInstrumentaleList),
    getRandomItem(intentionList),
  ]), [])

  return (
    <Questionnaire
      title="Questionnaire"
      list={list}
      onSubmit={async (results) => {
        await enqueueForm('questionnaires', 'daily', { results, timestamp: Date.now() })
        router.replace('/(tabs)')
      }}
    />
  )
}

const styles = StyleSheet.create({
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