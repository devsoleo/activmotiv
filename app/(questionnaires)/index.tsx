import { StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { dailyList } from '@/constants/forms'
import Questionnaire from '@/components/Questionnaire'
import { useRouter } from 'expo-router'
import { enqueueForm } from '@/services/queue/questionnaires'

export default function QuestionnaireScreen() {
  const router = useRouter()

  return (
    <Questionnaire title="Questionnaire" infos={<>
      <Text>
        Lisez attentivement chaque phrase et répondez sur l'échelle située en dessous en sélectionnant un nombre correspondant le mieux à ce que vous pensez.
      </Text>
      <Text style={{ paddingTop: 12 }}>
        (1 = pas du tout d'accord à 5 = tout à fait d'accord)
      </Text>
    </>} list={dailyList} onSubmit={async (headers, results) => {
      await enqueueForm('questionnaires', 'daily', { headers, results, timestamp: Date.now() })

      router.replace('/(tabs)')
    }} />
  )
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', paddingVertical: 12, fontWeight: "bold" },
  text: { paddingBottom: 6, paddingTop: 6 },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 50,
  },
  radioItem: {
    alignItems: 'center',
  },
  radioLabel: {
    marginBottom: 4,
    textAlign: 'center',
    width: 65,
  },
})