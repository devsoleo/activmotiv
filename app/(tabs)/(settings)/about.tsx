import { useRouter } from 'expo-router'
import { View, StyleSheet, ScrollView, Linking } from 'react-native'
import { Appbar, Text, useTheme } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'

const NOTICE_URL = 'https://activmotiv.fr/static/documents/Notice_ActiGraph.pdf?key=b4b01d6c7472362a30ac5470aac7f6be'

const styles = StyleSheet.create({
  title: { marginBottom: 12, marginTop: 16, fontWeight: 'bold', textAlign: 'justify' },
  subtitle: { marginBottom: 8, marginTop: 8, fontWeight: 'bold', textAlign: 'justify' },
  paragraph: { marginBottom: 8, textAlign: 'justify' },
  bullet: { marginLeft: 12, marginBottom: 4, textAlign: 'justify' },
  bold: { fontWeight: 'bold' },
  italic: { fontStyle: 'italic' },
  link: { color: '#1154cc', textDecorationLine: 'underline' },
})

export default function About() {
  const router = useRouter()
  const theme = useTheme()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView>
        <Appbar.Header statusBarHeight={0}>
          <Appbar.BackAction onPress={() => { router.back() }} />
          <Appbar.Content title="Informations étude" />
        </Appbar.Header>
        <View style={{ marginHorizontal: 20, paddingTop: 10, paddingBottom: 30 }}>
          <Text style={[styles.paragraph, styles.bold]} variant="titleMedium">
            Fiche d’information pour le participant
          </Text>

          <Text style={styles.paragraph}>
            Cette note est destinée à vous donner des éléments d’information sur cette recherche. Si vous ne comprenez pas bien certains mots ou éléments de cette note, n’hésitez pas à demander des explications au chercheur.
          </Text>

          <Text style={styles.title} variant="titleMedium">Présentation :</Text>
          <Text style={styles.paragraph}>Chercheurs responsables du projet :</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Julie Boiché</Text>, Laboratoire EuroMov Digital Health in Motion, Montpellier, France{'\n'}
            Contact : <Text style={styles.link} onPress={() => Linking.openURL('mailto:julie.boiche@umontpellier.fr')}>julie.boiche@umontpellier.fr</Text>
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Rémy Dadier</Text>, Laboratoire Euromov Digital Health in Motion, Montpellier, France{'\n'}
            Contact : <Text style={styles.link} onPress={() => Linking.openURL('mailto:remy.dadier@umontpellier.fr')}>remy.dadier@umontpellier.fr</Text>
          </Text>

          <Text style={styles.paragraph}>
            Merci pour l’intérêt exprimé à propos de cette étude de recherche. L'objectif de cette fiche d'information est de vous fournir un aperçu de l'étude à laquelle vous souhaitez participer volontairement en tant que sujet. Merci de lire les informations suivantes attentivement et n'hésitez pas à demander de plus amples explications si vous avez encore des questions ou des doutes. La signature du formulaire de consentement attestera de votre accord final pour participer à cette recherche.
          </Text>

          <Text style={styles.title} variant="titleMedium">Titre du projet :</Text>
          <Text style={styles.paragraph}>
            Étude de l'effet d'une application de conditionnement évaluatif sur smartphone sur les comportements actifs - devis expérimental à cas unique (SCED).
          </Text>

          <Text style={styles.title} variant="titleMedium">Objectifs du projet :</Text>
          <Text style={styles.paragraph}>
            L'étude vise à examiner les effets d'une application sur smartphone sur la perception et la modification des comportements actifs, en observant l'évolution de chaque participant au fil du temps. Votre participation à l’étude contribuera à une meilleure compréhension de la motivation à être actifs.
          </Text>

          <Text style={styles.title} variant="titleMedium">Ce que l’on attend de vous :</Text>

          <Text style={styles.subtitle}>
            0 - Phase de screening — Sélection et attribution du code utilisateur
          </Text>
          <Text style={styles.paragraph}>
            Avant de pouvoir participer pleinement à l’étude, vous devrez compléter un court questionnaire de pré-inclusion en ligne (<Text style={styles.italic}>durée estimée : 3 à 5 minutes</Text>). Ce questionnaire nous permettra de récupérer vos données démographiques et de vérifier que :
          </Text>
          <Text style={styles.bullet}>• Vous possédez un smartphone Android compatible</Text>
          <Text style={styles.bullet}>• Vous ne présentez aucune contre-indication à l’activité physique</Text>
          <Text style={styles.bullet}>• Vous êtes disponible sur la durée totale de l’étude</Text>

          <Text style={styles.paragraph}>
            Si vous remplissez ces critères, un code utilisateur personnel et anonyme vous sera attribué (ex : 9e461812). <Text style={styles.bold}>GARDEZ LE PRECIEUSEMENT</Text>
          </Text>

          <Text style={styles.paragraph}>Ce code vous permettra :</Text>
          <Text style={styles.bullet}>• D’installer l’application sans fournir d’informations personnelles identifiables</Text>
          <Text style={styles.bullet}>• De lier vos réponses et vos données d’utilisation de manière confidentielle</Text>

          <Text style={styles.paragraph}>
            Vous serez également assigné(e) au hasard à une durée de phase initiale de mesure (1, 2 ou 3 semaines), décrite ci-dessous. Si vous acceptez de participer, <Text style={styles.bold}>votre implication durera entre 7 et 9 semaines selon la durée qui vous aura été attribuée, et se déroulera en trois phases principales</Text>, suivies d'un possible entretien de fin d'étude :
          </Text>

          <Text style={styles.subtitle}>
            1 - Phase de ligne de base (Phase A - 1, 2 ou 3 semaines selon votre attribution)
          </Text>
          <Text style={styles.paragraph}>
            Dès le début de votre participation, vous recevrez en main propre (ou par voie postale via une enveloppe prépayée) un petit capteur d'activité accompagné de sa ceinture. Ce dispositif enregistrera vos mouvements quotidiens sans accéder à votre géolocalisation ; vous le porterez en continu à la ceinture pendant toute la durée de votre participation à l'étude (voir la <Text style={styles.link} onPress={() => Linking.openURL(NOTICE_URL)}>« Notice d’utilisation du capteur ActiGraph »</Text>). Une notification vous sera envoyée chaque matin afin de confirmer que le capteur est bien en place autour de votre taille. Il vous suffira de cliquer sur « Je valide le port ». Dans le cas contraire, vous serez contacté par le chercheur afin de vérifier le bon port du capteur et/ou d’identifier la raison de son non-port.
          </Text>
          <Text style={styles.paragraph}>
            Vous recevrez également, dès cette phase, les consignes pour installer l'application sur votre smartphone et vous y connecter à l'aide de votre code utilisateur (<Text style={styles.italic}>voir « Déroulement » ci-dessous pour le détail de l'installation, incluant la sélection des images et le paramétrage des notifications</Text>). Durant cette phase, l'application enregistre uniquement la fréquence de vos déverrouillages, sans afficher les images (Phase 2). Lors de cette phase, vous serez invité(e) à répondre, quotidiennement pendant une semaine (le matin entre 6h00 et 13h00), à de très courtes questions (quelques secondes) sur vos attitudes ou intentions envers l'activité physique, ainsi qu'à réaliser un test informatisé d'environ 5 minutes qui vous sera envoyé par mail.
          </Text>

          <Text style={styles.subtitle}>
            2 - Phase d'intervention (Phase B - 5 semaines)
          </Text>
          <Text style={styles.paragraph}>
            L'application affichera désormais automatiquement une image brève chaque fois que vous déverrouillez votre téléphone, parmi les 30 images que vous aurez sélectionnées lors de l'installation, sans en perturber le fonctionnement normal. Vous continuerez de porter le capteur en continu (soit 24 h/24 et 7 j/7) et de valider son port via les notifications quotidiennes envoyées par l’application. Au cours d'une semaine de cette phase, vous serez à nouveau invité(e) à répondre quotidiennement (le matin entre 6h00 et 13h00) aux courtes questions sur votre smartphone. L'application inclut également un formulaire intégré permettant de signaler à tout moment d'éventuels bugs ou dysfonctionnements (<Text style={styles.italic}>Paramètres {'>'} Signaler un bug</Text>).
          </Text>

          <Text style={styles.subtitle}>
            3 - Phase de suivi (Phase A' - 1 semaine)
          </Text>
          <Text style={styles.paragraph}>
            L'affichage des images s'arrête. Vous continuerez de porter le capteur en continu (soit 24 h/24 et 7 j/7) et répondrez, au cours de cette semaine, aux courtes questions sur votre smartphone. Un second test informatisé d'environ 5 minutes, identique au premier, vous sera proposé au cours de cette phase.
          </Text>

          <Text style={styles.subtitle}>
            4 - Entretien de fin d'étude (facultatif)
          </Text>
          <Text style={styles.paragraph}>
            À l'issue de la phase de suivi, vous serez invité à participer à un entretien individuel (en ligne ou en présentiel) afin de répondre à certaines questions, partager votre expérience et vos impressions sur l’étude.
          </Text>

          <Text style={styles.title} variant="titleMedium">Déroulement de la partie application :</Text>

          <Text style={styles.subtitle}>1. Placement du capteur :</Text>
          <Text style={styles.paragraph}>
            Voir la <Text style={styles.link} onPress={() => Linking.openURL(NOTICE_URL)}>« Notice d’utilisation du capteur ActiGraph »</Text>. Portez-le constamment à la hanche pendant toute la durée de l’étude (24 h/24 et 7 j/7). Le placement du capteur doit rester relativement le même tout au long de l’étude. Il ne doit pas changer d’un jour à l’autre (hanche droite / gauche).
          </Text>

          <Text style={styles.subtitle}>2. Installation de l'application :</Text>
          <Text style={styles.paragraph}>
            Vous recevrez un lien ainsi que les instructions pour installer l'application. Lors de votre première connexion, il vous sera demandé de renseigner le code utilisateur reçu lors de votre inclusion dans l'étude et de créer votre mot de passe (à garder précieusement). Lors de cette installation, trois étapes supplémentaires vous seront demandées :
          </Text>
          <Text style={styles.bullet}>
            • <Text style={styles.bold}>Sélection des images :</Text> vous serez guidé afin de choisir et évaluer 30 images parmi une banque d'environ 120 images. Ce sont ces images qui seront ensuite affichées lors de la phase d'intervention (Phase B).
          </Text>
          <Text style={styles.bullet}>
            • <Text style={styles.bold}>Paramétrage des notifications :</Text> vous choisirez les horaires auxquels vous souhaitez recevoir des rappels pour le port du capteur, ainsi que pour la semaine de questionnaires (EMA) de chaque phase de l'étude. Les horaires renseignés lors de l’inscription ne sont pas fixes et pourront être modifiés à tout moment dans les paramètres de l’application (<Text style={styles.italic}>Paramètres {'>'} Mes rappels</Text>).
          </Text>
          <Text style={styles.bullet}>
            • <Text style={styles.bold}>Autorisations de l'application :</Text> vous devrez accorder à l'application les autorisations nécessaires sur votre téléphone (notamment l'affichage par-dessus les autres applications et l'envoi de notifications) afin qu'elle puisse fonctionner correctement (afficher les images lors du déverrouillage de votre smartphone). Une fois installée, l’application fonctionnera automatiquement en arrière-plan.
          </Text>
          <Text style={[styles.paragraph, styles.italic]}>
            NB : Si vous rencontrez des difficultés, n’hésitez pas à nous contacter (Paramètres {'>'} Contacts).
          </Text>

          <Text style={styles.subtitle}>3. Utilisation quotidienne :</Text>
          <Text style={styles.paragraph}>
            Utilisez votre téléphone comme à votre habitude. Il est essentiel de signaler tout bug dès son apparition pour garantir le bon fonctionnement de l'application (<Text style={styles.italic}>Paramètres {'>'} Signaler un bug</Text>). Les images ne s'affichent qu'à partir de la phase d'intervention (Phase B), pas avant.
          </Text>
          <Text style={[styles.paragraph, styles.italic]}>
            NB : Si une anomalie est détectée par le chercheur (ex. fonctionnement anormal de l’application, non-port du capteur, absence de réponse aux questionnaires), vous serez contacté par le chercheur.
          </Text>

          <Text style={styles.subtitle}>4. Suivi durant les semaines de questionnaires :</Text>
          <Text style={styles.paragraph}>
            Au cours de la semaine de questionnaires prévue à chaque phase (A, B, A'), répondez aux très courtes questions envoyées chaque matin depuis l'application (quelques secondes chacune). Le test informatisé sur ordinateur (<Text style={styles.italic}>estimation : 5 minutes</Text>) n'est réalisé que deux fois au total : au début de la phase A et à la fin de la phase A'. Ils vous seront envoyés par mail et un rappel quant à leur utilisation vous sera adressé par SMS.
          </Text>

          <Text style={styles.title} variant="titleMedium">Bénéfices attendus de l’étude :</Text>
          <Text style={styles.paragraph}>
            Vous ne pouvez pas vous attendre à tirer un bénéfice direct de votre participation à cette recherche, si ce n’est de contribuer à l’avancée des connaissances scientifiques.
          </Text>

          <Text style={styles.title} variant="titleMedium">Risques possibles de l’étude :</Text>
          <Text style={styles.paragraph}>
            Cette recherche ne présente pas de risques plus grands que ceux encourus dans votre vie quotidienne. L'utilisation du capteur, de l’application, la réalisation du test informatisé, le remplissage des questionnaires en ligne ainsi que la participation aux réunions ne présentent aucun danger pour votre santé.
          </Text>

          <Text style={styles.title} variant="titleMedium">Vos droits et garanties :</Text>
          <Text style={styles.paragraph}>
            Si vous participez à cette recherche, toutes nouvelles informations susceptibles de remettre en question votre participation vous seront communiquées. Toutes les données recueillies seront anonymisées et identifiées par un code pour garantir la confidentialité. Vous pouvez, à tout moment et sans justification :
          </Text>
          <Text style={styles.bullet}>• Accéder à l’ensemble des données vous concernant.</Text>
          <Text style={styles.bullet}>• Vous retirer de cette recherche.</Text>
          <Text style={styles.bullet}>• Demander au chercheur la destruction de toutes les données vous concernant.</Text>
          <Text style={styles.paragraph}>
            Pour exercer ces droits ou poser toute question relative au traitement des données, vous pouvez contacter le chercheur responsable du projet ou le Délégué à la protection des Données (<Text style={styles.link} onPress={() => Linking.openURL('mailto:dpo@umontpellier.fr')}>dpo@umontpellier.fr</Text>). Si vous le souhaitez, les résultats globaux de cette recherche vous seront communiqués à sa conclusion.
          </Text>

          <Text style={[styles.paragraph, styles.bold, { marginTop: 16 }]}>
            Si vous avez des questions, n'hésitez pas à les poser. Soyez assuré(e) que votre participation nous est extrêmement précieuse. Nous vous remercions par avance pour votre aide à la recherche scientifique.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
