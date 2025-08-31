import { useRouter } from 'expo-router'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Appbar, Text } from 'react-native-paper'

const styles = StyleSheet.create({
  image: {
    borderRadius: 8,
    borderColor: "rgb(0, 99, 153)"
  },
  title: { marginBottom: 12 },
  paragraph: { marginBottom: 8 }
})

export default function About() {
  const router = useRouter()

  return (
    <ScrollView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => {router.back()}} />
        <Appbar.Content title="Informations étude" />
      </Appbar.Header>
      <View style={{ marginHorizontal: 20, paddingTop: 20 }}>
        <Text style={styles.title} variant="titleMedium">Présentation</Text>
        <Text style={styles.paragraph}>
          Cette note est destinée à vous donner des éléments d'information sur cette recherche. Si
          vous ne comprenez pas bien certains mots ou éléments de cette note, n'hésitez pas à
          demander des explications au chercheur. Vous êtes totalement libre d'accepter ou de
          refuser de participer à cette recherche. Le chercheur vous laissera le temps nécessaire pour
          prendre votre décision.
        </Text>
        <Text style={styles.title} variant="titleMedium">Chercheur responsable du projet</Text>
        <Text style={styles.paragraph}>
          Julie Boiché, Laboratoire EuroMov Digital Health in Motion, Montpellier, France
          julie.boiche@umontpellier.fr
        </Text>
        <Text style={styles.paragraph}>
          Rémy Dadier, Laboratoire EuroMov Digital Health in Motion, Montpellier, France
          remy.dadier@umontpellier.fr
        </Text>
        <Text style={styles.paragraph}>
          Merci pour l'intérêt exprimé à propos de cette étude de recherche.
          L'objectif de cette fiche d'information est de vous fournir un aperçu de l'étude à laquelle
          vous souhaitez participer volontairement en tant que sujet. Merci de lire les informations
          suivantes attentivement et n'hésitez pas à demander de plus amples explications, si vous
          avez encore des questions, des doutes ou autres demandes.
          La signature du formulaire de consentement attestera de votre accord final pour participer à
          cette recherche.
        </Text>
        <Text style={styles.title} variant="titleMedium">Titre du projet</Text>
        <Text style={styles.paragraph}>
          Étude pilote portant sur l'optimisation et l'acceptabilité d'une application de conditionnement
          évaluatif sur smartphone.
        </Text>
        <Text style={styles.title} variant="titleMedium">Objectif</Text>
        <Text style={styles.paragraph}>
          L'objectif de ce projet est d'optimiser et de tester l'acceptabilité d'une application de
          conditionnement évaluatif sur smartphone, en mesurant les interactions des participants
          avec l'application, leur nombre d'exposition aux stimuli visuels ainsi que leurs retours
          utilisateur.
        </Text>
        <Text style={styles.title} variant="titleMedium">Méthodologie</Text>
        <Text style={styles.paragraph}>
          Si vous participez à cette recherche, vous installerez une application sur votre smartphone
          pour une durée de 1 mois. Pendant cette période, vous utiliserez votre téléphone comme à
          votre habitude. L'application affichera des images chaque fois que vous déverrouillez votre
          téléphone.
          Chaque semaine, il vous sera demandé de répondre à des questionnaires (pour une durée
          totale estimée de 5 à 10 minutes) portant sur votre expérience utilisateur (e.g., bugs
          éventuels, remarques, avis utilisateurs). Il est important de nous rapporter tout type de
          bug dès son apparition afin d'améliorer le bon fonctionnement de l'application.
        </Text>
        <Text style={styles.paragraph}>
          1. Installation de l'application : Vous recevrez des instructions pour installer
          l'application sur votre smartphone. L'installation devra être effectuée au début
          de l'étude. Une fois installée, l'application fonctionnera en arrière-plan et
          affichera des images chaque fois que vous déverrouillerez votre téléphone -
          sans en perturber son fonctionnement habituel.
        </Text>
        <Text style={styles.paragraph}>
          2. Utilisation quotidienne : Pendant cette période de 1 mois, vous utiliserez
          votre téléphone comme à votre habitude. Les images apparaîtront à chaque
          déverrouillage de votre téléphone, sans nécessiter d'intervention
          supplémentaire de votre part.
        </Text>
        <Text style={styles.paragraph}>
          3. Rapport d'expérience : Chaque semaine, vous serez invité(e) à remplir un
          questionnaire d'une durée de 5 à 10 minutes. Ce questionnaire portera sur
          votre utilisation de l'application et vous permettra de donner votre avis sur les
          aspects techniques (e.g., bugs, erreurs, suggestions d'amélioration) ainsi que
          sur votre expérience générale avec l'application. Il sera également attendu
          de votre part de signaler tout bug dès son apparition afin que nous
          puissions corriger d'éventuels problèmes techniques.
        </Text>
        <Text style={styles.paragraph}>
          4. Retour final : À la fin de la période d'étude de 1 mois, un dernier
          questionnaire vous sera proposé pour recueillir votre retour global sur
          l'application et vos suggestions éventuelles pour améliorer son
          fonctionnement.
        </Text>
        <Text style={styles.title} variant="titleMedium">Bénéfice attendu et indemnisation</Text>
        <Text style={styles.paragraph}>
          Vous ne pouvez pas vous attendre à tirer un bénéfice direct de votre participation à cette
          recherche, si ce n'est par votre contribution à l'avancée des connaissances scientifiques.
        </Text>
        <Text style={styles.title} variant="titleMedium">Risques engendrés</Text>
        <Text style={styles.paragraph}>
          Cette recherche ne présente pas de risques plus grands que ceux encourus dans votre vie
  quotidienne. L'utilisation de l'application ne présentent pas de danger pour votre santé.
        </Text>
        <Text style={styles.title} variant="titleMedium">Vos droits et garanties</Text>
        <Text style={styles.paragraph}>
          Si vous participez à cette recherche, toute nouvelle connaissance susceptible de remettre
          en question votre participation vous sera immédiatement communiquée.
          Si vous participez à cette recherche, les chercheurs vont recueillir des informations vous
          concernant. Ces données seront anonymisées et identifiées par un numéro de code pour
          garantir la confidentialité.
          Vous pouvez, à tout moment et sans vous justifier :
          · Accéder à l'ensemble des données vous concernant.
          · Vous retirer de cette recherche.
          · Demander au chercheur la destruction de toutes les données vous
          concernant.
          Pour exercer ces droits ou poser toute question relative au traitement des données, vous
          pouvez contacter le chercheur responsable du projet ou le Délégué à la protection des
          Données (dpo@umontpellier.fr). Si vous le demandez, les résultats globaux de cette
          recherche vous seront communiqués à sa conclusion.
        </Text>
        <Text style={styles.title} variant="titleMedium">Si vous avez des questions n'hésitez pas à les poser.</Text>
        <Text style={styles.paragraph}>
          Soyez assuré(e) que votre participation nous est extrêmement précieuse. Nous vous
          remercions par avance de l'aide que vous apportez à la recherche scientifique.
        </Text>
      </View>
    </ScrollView>
  )
}