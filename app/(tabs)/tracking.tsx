import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { BarChart, PieChart } from "react-native-gifted-charts"
import { useSession } from '@/contexts/auth'
import { useEffect, useState } from 'react'

export default function TrackingScreen() {
  const { session } = useSession()
  const [barData, setBarData] = useState()

  const [openingAmount, setOpeningAmount] = useState()

  const pieData = [
    {value: 40, color: 'lightgrey'},
    {value: 60, color: 'rgb(0, 99, 153)'},
  ];

  const getMeasurement = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tracking/opening`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session}`
        }
      })

      const data = (await response.json())

      setBarData(data.map((item, index) => ({ ...item, frontColor: index % 2 === 0 ? 'lightgray' : 'rgb(0, 99, 153)' }) ))
    } catch (error) {
      console.error(error)
    }
  }

  const getOpeningAmount = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tracking/opening/amount`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session}`
        }
      })

      const data = (await response.json()).data

      setOpeningAmount(data.amount)
    } catch (error) {
      console.error(error)
    }
  }

  const sendMeasurement = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/tracking/opening`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session}`
        },
        body: JSON.stringify({ measurements: [Date.now()] })
      })

      if (response.ok) {
        // console.log("Mesure envoyée !")
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    console.log("ok")
    getOpeningAmount()
    getMeasurement()
    sendMeasurement()
  }, [])

  return (
    <View style={{ flex: 1}}>
      <Text variant="headlineLarge" style={styles.title}>Suivi</Text>

      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text variant='titleMedium'>Nombre d'exposition</Text>
          <Text variant='titleMedium' style={styles.stat_value}>{ openingAmount }</Text>
        </View>
        <View style={styles.stat}>
          <Text variant='titleMedium'>Temps d'exposition</Text>
          <Text variant='titleMedium' style={styles.stat_value}>1j 3h 32m 23s</Text>
        </View>
      </View>

      <View style={{ marginHorizontal: 12 }}>
        <BarChart
          barWidth={25}
          barBorderRadius={4}
          data={barData}
          yAxisThickness={0}
          xAxisThickness={0}
          stepValue={10}
        />
      </View>


      <Text variant='titleMedium'>Nombres d'expositions journalières</Text>

      <View style={{ alignItems: 'center', marginTop: 50 }}>
        <PieChart
          donut
          innerRadius={80}
          data={pieData}
          centerLabelComponent={() => {
            return <Text style={{fontSize: 30}}>60%</Text>;
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', paddingTop: 45, paddingBottom: 15 },
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
