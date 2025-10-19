import { StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { fsusList } from '@/constants/forms'
import Questionnaire from '@/components/Questionnaire'
import { saveResults, syncWithServer } from '@/services/cache/questionnaire'
import { useRouter } from 'expo-router'

export default function FsusScreen() {
  const router = useRouter()

  return (
    <Questionnaire title="Questionnaire F-SUS" infos={<>
      <Text>
        Lisez attentivement chaque phrase et répondez sur l'échelle située en dessous en sélectionnant un nombre correspondant le mieux à ce que vous pensez.
      </Text>
      <Text style={{ paddingTop: 12 }}>
        (1 = pas du tout d'accord à 5 = tout à fait d'accord)
      </Text>
    </>} list={fsusList} onSubmit={async (listHeaders, answers) => {
      await saveResults('fsus', listHeaders, answers).then(() => {
        syncWithServer()
      })

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