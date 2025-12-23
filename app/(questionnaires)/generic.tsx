import { StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { attitudeList, intentionList, motivationList } from '@/constants/forms'
import Questionnaire from '@/components/Questionnaire'
import { useRouter } from 'expo-router'
import { enqueueForm } from '@/services/queue/questionnaires'

const shuffledGroups = [
  attitudeList.map(item => ({ ...item, type: 'motivation' })),
  intentionList.map(item => ({ ...item, type: 'intention' })),
  motivationList.map(item => ({ ...item, type: 'motivation' }))
].sort(() => Math.random() - 0.5)

const genericList = shuffledGroups.flat()

export default function GenericScreen() {
  const router = useRouter()

  return (
    <Questionnaire title="Questionnaire générique" infos={<>
      <Text style={{ textAlign: 'justify' }}>
        Dans cette section, vous répondrez à quelques questions sur votre perception, vos émotions et votre motivation concernant l'activité physique.
        Avant de commencer, voici une <Text style={{ fontWeight: "bold" }}>définition standardisée de l'activité physique</Text>, afin que chacun(e) se base sur la même compréhension :
      </Text>
      <Text style={{ paddingTop: 12, fontStyle: 'italic', textAlign: 'justify' }}>
        "L'activité physique se réfère à tout mouvement corporel produit par les muscles squelettiques qui requiert une dépense d'énergie.
        L'activité physique désigne tous les mouvements que l'on effectue notamment dans le cadre des loisirs, pour se déplacer d'un endroit à l'autre, sur le lieu de travail ou lors des tâches ménagères". - OMS, 2024.
      </Text>
      <Text style={{ paddingTop: 12, textAlign: 'justify' }}>
        Il vous suffira d'indiquer, sur des échelles de 1 à 7, ce qui correspond le mieux à votre opinion personnelle.
      </Text>
      <Text style={{ fontWeight: "bold", paddingTop: 12, textAlign: 'justify' }}>Répondez spontanément et sincèrement : il n'y a pas de bonne ou mauvaise réponse.</Text>
    </>} list={genericList} onSubmit={async (headers, answers) => {
      await enqueueForm('questionnaires', { label: 'generic', headers, answers, timestamp: Date.now() })

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