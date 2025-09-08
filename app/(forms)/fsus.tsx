import { useState, useRef, createRef } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Portal, Modal, Button,  Card, RadioButton } from 'react-native-paper'
import { questionsList } from '@/constants/fsus'
import { api } from '@/api/client'
import { useRouter } from 'expo-router'

const containerStyle = {backgroundColor: 'white', margin: 20, padding: 24, borderRadius: 18}

export default function FsusScreen() {
  const router = useRouter()
  const [visible, setVisible] = useState(true)

  const hideModal = () => setVisible(false)

  const [hasSubmit, setHasSubmit] = useState(false)

  // Notes
  const [notes, setNotes] = useState(Array(questionsList.length).fill(null))

  const handleNoteChange = (index, value) => {
    const updatedNotes = [...notes]
    updatedNotes[index] = value
    setNotes(updatedNotes)
  }

  // Scroll
  const scrollViewRef = useRef(null)
  const sectionRefs = useRef(questionsList.map(() => createRef()))

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
    <View style={{ flex: 1}}>
      <Text variant="headlineLarge" style={styles.title}>Questionnaire F-SUS</Text>
      <Portal>
        <Modal visible={visible} contentContainerStyle={containerStyle}>
          <Text variant='titleLarge' style={{ marginBottom: 12 }}>Information importante</Text>
          <Text>
            Lisez attentivement chaque phrase et répondez sur l'échelle située en dessous en sélectionnant un nombre correspondant le mieux à ce que vous pensez. 1 = pas du tout d'accord à 5 = tout à fait d'accord.
          </Text>
          <Button style={{ marginTop: 18 }} onPress={hideModal}>Commencer le questionnaire</Button>
        </Modal>
      </Portal>

      <ScrollView ref={scrollViewRef}>
        {questionsList.map((item, index) => (
          <Card style={{ margin: 12 }} key={item.id} ref={sectionRefs.current[index]}>
            <Card.Content style={{ alignItems: 'center' }}>
              <Text variant="titleMedium" >Question : {item.id}/{questionsList.length}</Text>
              <Text variant="titleMedium" style={{ textAlign: 'center' }}>{item.text}</Text>

              <RadioButton.Group onValueChange={value => handleNoteChange(index, Number(value))} value={String(notes[index])}>
                <View style={styles.radioGroup}>
                  <View style={[styles.radioItem, {marginTop: -32}]}>
                    <Text style={styles.radioLabel}>Pas du tout d'accord</Text>
                    <RadioButton value="1" />
                  </View>
                  <View style={styles.radioItem}>
                    <Text style={styles.radioLabel}> </Text>
                    <RadioButton value="2" />
                  </View>
                  <View style={styles.radioItem}>
                    <Text style={styles.radioLabel}> </Text>
                    <RadioButton value="3" />
                  </View>
                  <View style={styles.radioItem}>
                    <Text style={styles.radioLabel}> </Text>
                    <RadioButton value="4" />
                  </View>
                  <View style={[styles.radioItem, {marginTop: -16}]}>
                    <Text style={styles.radioLabel}>Tout à fait d'accord</Text>
                    <RadioButton value="5" />
                  </View>
                </View>
              </RadioButton.Group>
              <Text style={{ color: 'red', paddingTop: 6 }} variant='titleMedium'>{ (notes[index] == null && hasSubmit) && "Réponse manquante !"}</Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <View style={{ marginVertical: 12, alignSelf: 'center' }}>
        <Button mode="outlined" onPress={() => {
          setHasSubmit(true)
          const missingAnswer = notes.indexOf(null)

          if (missingAnswer != -1) return scrollToSection(missingAnswer)

          api.post('/forms/fsus', { results: notes })
          .then(() => {
            router.replace('/(tabs)')
          })
          .catch((error) => {
            console.log(error)
          })
        }}>Valider mes réponses</Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', paddingTop: 45, paddingBottom: 15 },
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