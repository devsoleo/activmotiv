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
      infos={
        <View style={{ gap: 12 }}>
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
        </View>
      }
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