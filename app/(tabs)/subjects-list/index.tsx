// SubjectsScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView, StatusBar } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router, Router, useLocalSearchParams } from 'expo-router';

// Sample data for subjects
const subjects = [
  { id: '1', name: 'Biology', icon: '🧬', topics: 8 },
  { id: '2', name: 'Chemistry', icon: '🧪', topics: 6 },
  { id: '3', name: 'Physics', icon: '⚛️', topics: 7 },
  { id: '4', name: 'Mathematics', icon: '📊', topics: 9 },
  { id: '5', name: 'Computer Science', icon: '💻', topics: 5 },
  { id: '6', name: 'History', icon: '📜', topics: 4 },
  { id: '7', name: 'Geography', icon: '🌍', topics: 6 },
  { id: '8', name: 'Literature', icon: '📚', topics: 5 },
];

export default function SubjectsScreen() {
 // in SubjectsScreen.js
const handleSubjectPress = (subject) => {
  router.push(`/(tabs)/subjects-list/${subject.name}`);
};


  const renderSubjectItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.subjectCard}
      onPress={() => handleSubjectPress(item)}
    >
      <View style={styles.subjectIconContainer}>
        <Text style={styles.subjectIcon}>{item.icon}</Text>
      </View>
      <View style={styles.subjectInfo}>
        <Text style={styles.subjectName}>{item.name}</Text>
        <Text style={styles.subjectTopics}>{item.topics} topics</Text>
      </View>
      <View style={styles.arrowContainer}>
        <Feather name="chevron-right" size={24} color="#6B8AF7" />
      </View>
    </TouchableOpacity>
  );

  return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        {/* Title */}
        <Text style={styles.title}>Subjects</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by subject"
            placeholderTextColor="#64748B"
          />
        </View>
        
        {/* Subjects List */}
        <FlatList
          data={subjects}
          renderItem={renderSubjectItem}
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
    marginBottom: 20,
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
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  subjectIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(107, 138, 247, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  subjectIcon: {
    fontSize: 24,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  subjectTopics: {
    fontSize: 14,
    color: '#94A3B8',
  },
  arrowContainer: {
    padding: 4,
  },
});