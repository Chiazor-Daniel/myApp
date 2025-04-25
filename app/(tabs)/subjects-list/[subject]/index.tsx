// TopicsScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView, StatusBar } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

// Sample data for Biology topics (matching the screenshot)
const biologyTopics = [
  { id: '01', title: 'Cell Organization' },
  { id: '02', title: 'Basic Functions Of Living Organism' },
  { id: '03', title: 'Classification Of Living Organism' },
  { id: '04', title: 'Digestive System' },
  { id: '05', title: 'Respiratory System' },
  { id: '06', title: 'Plants' },
  { id: '07', title: 'Cell Organization', new: true },
  { id: '08', title: 'Cell Organization' },
];

// For other subjects we would have different topics
const topicsBySubject = {
  'Biology': biologyTopics,
  // Add other subjects' topics here
};

export default function TopicsScreen() {
  const { subject } = useLocalSearchParams<{
    subject: string;
  }>();
  console.log("seen", subject);
  
  const topics = topicsBySubject[subject as string] || [];

  const handleTopicPress = (topic) => {
    // Navigate to the topic content screen
    router.push(`/(tabs)/subjects-list/${subject}/slug/${topic}`);
  };

  const renderTopicItem = ({ item }) => (
    <View style={styles.topicItem}>
      <View style={styles.topicNumberContainer}>
        <Text style={styles.topicNumber}>{item.id}</Text>
      </View>
      <View style={styles.topicTitleContainer}>
        <Text style={styles.topicTitle}>{item.title}</Text>
      </View>
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => handleTopicPress(item)}
      >
        <Feather name="play" size={16} color="white" style={styles.playIcon} />
        <Text style={styles.startButtonText}>Start Topic</Text>
      </TouchableOpacity>
      
      {item.new && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}
    </View>
  );

  return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        
        {/* Title and Breadcrumbs */}
        <Text style={styles.title}>Subjects</Text>
        <View style={styles.breadcrumbs}>
          <Text  style={styles.breadcrumbText}>{subject}</Text>
          <Text style={styles.breadcrumbSeparator}> / </Text>
          <Text style={styles.breadcrumbCurrent}>Topic List</Text>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by topic"
            placeholderTextColor="#64748B"
          />
        </View>
        
        {/* Topics List */}
        <FlatList
          data={topics}
          renderItem={renderTopicItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  profileButton: {
    padding: 4,
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  breadcrumbText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  breadcrumbSeparator: {
    fontSize: 16,
    color: '#64748B',
    marginHorizontal: 4,
  },
  breadcrumbCurrent: {
    fontSize: 16,
    color: '#94A3B8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: 'white',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  topicNumberContainer: {
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topicNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  topicTitleContainer: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B8AF7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  playIcon: {
    marginRight: 4,
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  newBadge: {
    position: 'absolute',
    bottom: -6,
    right: 16,
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});