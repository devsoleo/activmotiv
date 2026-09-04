import { useMemo } from 'react'
import { Text } from 'react-native-paper'
import { attitudeAffectiveList, attitudeInstrumentaleList, intentionList } from '@/constants/forms'
import Questionnaire from '@/components/Questionnaire'
import { useRouter } from 'expo-router'
import { enqueueForm } from '@/services/queue/questionnaires'

function getRandomItem<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

export default function QuestionnaireScreen() {
  const router = useRouter()

  const list = useMemo(() => [
    getRandomItem(attitudeAffectiveList),
    getRandomItem(attitudeInstrumentaleList),
    getRandomItem(intentionList),
  ], [])

  return (
    <Questionnaire
      title="Questionnaire"
      infos={
        <>
          <Text>
            {"Lisez attentivement chaque phrase et répondez sur l'échelle située en dessous en sélectionnant un nombre correspondant le mieux à ce que vous pensez."}
          </Text>
          <Text style={{ paddingTop: 12 }}>
            {"(1 à 7)"}
          </Text>
        </>
      }
      list={list}
      onSubmit={async (results) => {
        await enqueueForm('questionnaires', 'daily', { results, timestamp: Date.now() })
        router.replace('/(tabs)')
      }}
    />
  )
}
