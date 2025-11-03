import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { BarChart, PieChart } from "react-native-gifted-charts"
import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getTrackingItem, syncWithServer } from '@/services/cache/tracking'

export default function TrackingScreen() {
  const [barData, setBarData] = useState()

  const [openingAmount, setOpeningAmount] = useState()

  const pieData = [
    {value: 40, color: 'lightgrey'},
    {value: 60, color: 'rgb(0, 99, 153)'},
  ]

  const getTracking = async () => {
    syncWithServer()

    let data = {
      amount: (await getTrackingItem('amount')) ?? 0,
      opening: (await getTrackingItem('opening'))
    }

    setOpeningAmount(data.amount)
    setBarData(data.opening.map((item, index) => ({ ...item, frontColor: index % 2 === 0 ? 'lightgray' : 'rgb(0, 99, 153)' }) ))
  }

  useFocusEffect(
    useCallback(() => {
      getTracking()
    }, [])
  )

  return (
    <SafeAreaView style={{ flex: 1}}>
      <Text variant="headlineLarge" style={styles.title}>Suivi</Text>

      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text variant='titleMedium'>Nombre d'exposition</Text>
          <Text variant='titleMedium' style={styles.stat_value}>{ openingAmount }</Text>
        </View>
        <View style={[styles.stat, {backgroundColor: 'lightgray', opacity: 0.2}]}>
          <Text variant='titleMedium'>Temps d'exposition</Text>
          <Text variant='titleMedium' style={styles.stat_value}>0j 0h 0m 0s</Text>
        </View>
      </View>

      <View style={{ marginHorizontal: 12, zIndex: -1, opacity: 0.2 }}>
        <BarChart
          disablePress={true} // TODO: a supprimer
          barWidth={25}
          barBorderRadius={4}
          data={barData}
          yAxisThickness={0}
          xAxisThickness={0}
          stepValue={10}
        />
      </View>

      <Text variant='titleMedium' style={[{marginTop: 20, textAlign: 'center', color: 'lightgray'}]}>Nombres d'expositions journalières</Text>

      {/* <View style={{ alignItems: 'center', marginTop: 30, opacity: 0.2 }}>
        <PieChart
          donut
          innerRadius={80}
          data={pieData}
          centerLabelComponent={() => {
            return <Text style={{fontSize: 30}}>0%</Text>
          }}
        />
      </View> */}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', paddingVertical: 12, fontWeight: "bold" },
  statsContainer: {
    flexDirection: 'row', // côte à côte
    justifyContent: 'space-evenly', 
    paddingHorizontal: 10,
    marginBottom: 50
  },
  stat: { 
    backgroundColor: 'rgb(205, 229, 255)',
    borderRadius: 18,
    padding: 16,
    flex: 1,
    marginHorizontal: 5,
  },
  stat_value: {
    marginTop: 6,
    fontSize: 20
  }
})
