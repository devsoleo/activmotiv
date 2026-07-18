import React, { useState, useMemo } from 'react'
import { useRouter } from 'expo-router'
import { View, StyleSheet, FlatList, Linking, Pressable } from 'react-native'
import { Appbar, Text, Searchbar, useTheme, Card, Button, Chip } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import licensesData from '@/constants/licenses.json'

interface LicenseItem {
  name: string
  version: string
  license: string
  text: string
  repository?: string
}

export default function Licenses() {
  const router = useRouter()
  const theme = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const handleToggleExpand = (name: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  const handleOpenRepo = async (url: string) => {
    try {
      let cleanUrl = url.trim()
      if (cleanUrl.startsWith('git://')) {
        cleanUrl = cleanUrl.replace(/^git:\/\//, 'https://')
      }
      const formattedUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`
      await Linking.openURL(formattedUrl)
    } catch (error) {
      console.warn("Impossible d'ouvrir l'URL :", url)
    }
  }

  const filteredLicenses = useMemo(() => {
    if (!searchQuery) return licensesData

    const lowerQuery = searchQuery.toLowerCase()
    return licensesData.filter(
      (item: LicenseItem) =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.license.toLowerCase().includes(lowerQuery)
    )
  }, [searchQuery])

  const renderItem = ({ item }: { item: LicenseItem }) => {
    const isExpanded = !!expandedItems[item.name]

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.elevation.level1 }]}>
        <Pressable
          onPress={() => handleToggleExpand(item.name)}
          style={({ pressed }) => [
            styles.cardHeader,
            pressed && { backgroundColor: theme.colors.elevation.level2 }
          ]}
        >
          <View style={styles.headerTitleContainer}>
            <Text variant="titleMedium" style={styles.packageName}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              v{item.version}
            </Text>
          </View>
          <View style={styles.headerBadgeContainer}>
            <Chip compact style={[styles.chip, { backgroundColor: theme.colors.secondaryContainer }]}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSecondaryContainer, fontWeight: 'bold' }}>
                {item.license}
              </Text>
            </Chip>
          </View>
        </Pressable>

        {isExpanded && (
          <Card.Content style={[styles.cardContent, { borderTopWidth: 1, borderTopColor: theme.colors.outlineVariant }]}>
            {item.repository ? (
              <Button
                mode="text"
                compact
                icon="github"
                onPress={() => handleOpenRepo(item.repository!)}
                style={styles.repoButton}
                labelStyle={{ fontSize: 13 }}
              >
                Code source
              </Button>
            ) : null}

            <View style={[styles.licenseTextContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={[styles.licenseText, { color: theme.colors.onSurfaceVariant }]}>
                {item.text}
              </Text>
            </View>
          </Card.Content>
        )}
      </Card>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Licences Open-Source" />
      </Appbar.Header>

      <View style={styles.container}>
        <Searchbar
          placeholder="Rechercher une bibliothèque..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <FlatList
          data={filteredLicenses}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Aucune licence trouvée pour "{searchQuery}".
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  searchbar: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24
  },
  card: {
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden'
  },
  cardHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitleContainer: {
    flex: 1,
    paddingRight: 8
  },
  headerBadgeContainer: {
    alignItems: 'flex-end'
  },
  packageName: {
    fontWeight: 'bold',
    marginBottom: 2
  },
  chip: {
    borderRadius: 6
  },
  cardContent: {
    paddingTop: 12,
    paddingBottom: 16
  },
  repoButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginLeft: -8
  },
  licenseTextContainer: {
    borderRadius: 6,
    padding: 12,
    marginTop: 4
  },
  licenseText: {
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40
  }
})
