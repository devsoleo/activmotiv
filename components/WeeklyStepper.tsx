import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text, Card, useTheme, Icon } from 'react-native-paper'

export type DayStatus = 'done' | 'not-done' | 'empty'

export interface DayStep {
  label: string
  status?: DayStatus
  completed?: boolean
}

interface WeeklyStepperProps {
  title: string
  days: DayStep[]
  completedCount?: number
  icon?: string
  currentDayIndex?: number
  isAdmin?: boolean
  onDayPress?: (dayIndex: number, day: DayStep) => void
}

export default function WeeklyStepper({
  title,
  days,
  completedCount,
  icon,
  currentDayIndex,
  isAdmin = false,
  onDayPress
}: WeeklyStepperProps) {
  const theme = useTheme()

  const getDayStatus = (day: DayStep, index: number): DayStatus => {
    if (day.status) return day.status
    if (currentDayIndex !== undefined) {
      if (day.completed) return 'done'
      if (index < currentDayIndex) return 'not-done'
      return 'empty'
    }
    return day.completed ? 'done' : 'empty'
  }

  const count =
    completedCount ??
    days.filter((d, idx) => getDayStatus(d, idx) === 'done').length

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {icon && (
              <View style={[styles.iconWrapper, { backgroundColor: theme.colors.primaryContainer }]}>
                <Icon source={icon} size={18} color={theme.colors.primary} />
              </View>
            )}
            <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
              {title}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text variant="labelMedium" style={{ color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }}>
              {count} / 7 j
            </Text>
          </View>
        </View>

        <View style={styles.stepperRow}>
          {days.map((day, index) => {
            const status = getDayStatus(day, index)
            const isLast = index === days.length - 1
            const nextStatus = !isLast ? getDayStatus(days[index + 1], index + 1) : 'empty'
            const isCurrentDay = currentDayIndex !== undefined && index === currentDayIndex
            const isTogglable = onDayPress !== undefined && (isAdmin || (currentDayIndex !== undefined && index <= currentDayIndex))

            let circleBg = theme.colors.surfaceVariant
            let circleBorder = theme.colors.outlineVariant
            let borderWidth = 1.5
            let iconComponent = null

            const GREEN_COLOR = '#4CAF50'
            const GREEN_DARK = '#2E7D32'
            const RED_COLOR = '#E53935'
            const RED_DARK = '#8B0000'

            if (status === 'done') {
              circleBg = GREEN_COLOR
              circleBorder = GREEN_DARK
              iconComponent = <Icon source="check" size={16} color="#FFFFFF" />
            } else if (status === 'not-done') {
              circleBg = RED_COLOR
              circleBorder = RED_DARK
              iconComponent = <Icon source="close" size={16} color="#FFFFFF" />
            } else {
              // 'empty': bulle vide (bordure bleue pour le jour en cours si vide)
              circleBg = theme.colors.surfaceVariant
              circleBorder = isCurrentDay ? theme.colors.primary : theme.colors.outlineVariant
              iconComponent = null
            }

            if (isCurrentDay) {
              borderWidth = 2.5
            } else if (currentDayIndex !== undefined && index < currentDayIndex) {
              borderWidth = 0
            }

            let labelColor = theme.colors.onSurfaceVariant
            if (status === 'done') labelColor = GREEN_DARK
            else if (status === 'not-done') labelColor = RED_DARK
            else if (isCurrentDay) labelColor = theme.colors.primary

            return (
              <React.Fragment key={index}>
                <View style={styles.stepItem}>
                  <TouchableOpacity
                    disabled={!isTogglable}
                    activeOpacity={0.7}
                    onPress={() => isTogglable && onDayPress && onDayPress(index, day)}
                  >
                    <View
                      style={[
                        styles.circle,
                        {
                          backgroundColor: circleBg,
                          borderColor: circleBorder,
                          borderWidth: borderWidth
                        }
                      ]}
                    >
                      {iconComponent}
                    </View>
                  </TouchableOpacity>
                  <Text variant="labelSmall" style={[styles.dayLabel, { color: labelColor }]}>
                    {day.label}
                  </Text>
                </View>

                {!isLast && (
                  <View
                    style={[
                      styles.connector,
                      {
                        backgroundColor:
                          status === 'done' && nextStatus === 'done'
                            ? GREEN_COLOR
                            : theme.colors.outlineVariant
                      }
                    ]}
                  />
                )}
              </React.Fragment>
            )
          })}
        </View>
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontWeight: 'bold'
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 4
  },
  stepItem: {
    alignItems: 'center'
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  dayLabel: {
    marginTop: 6,
    fontWeight: 'bold',
    fontSize: 12
  },
  connector: {
    flex: 1,
    height: 3,
    marginTop: 12.5,
    marginHorizontal: 2,
    borderRadius: 1.5
  }
})