import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList, Dimensions } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import NoticeBoard from '../components/Noticeboard';

const { width, height } = Dimensions.get('window');

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

const AssessmentNotification = ({ navigation }: { navigation: any }) => {
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);

  const handleSubjectSelect = (subject) => {
    setSubjectModalVisible(false);
    router.push(`/(tabs)/subjects-list/${subject.name}/quiz/${subject.name}`);
  };

  const assignedTests = [
    { id: '1', title: 'Characteristics of living organisms', subject: 'Biology', count: 1 },
    { id: '2', title: 'Respiratory system', subject: 'Biology', count: 1 },
    { id: '3', title: 'Force', subject: 'Physics', count: 1 },
    { id: '4', title: 'Organic chemistry', subject: 'Chemistry', count: 1 },
    { id: '5', title: 'Organic chemistry', subject: 'Chemistry', count: 1 },
    { id: '6', title: 'Organic chemistry', subject: 'Chemistry', count: 1 },
    { id: '7', title: 'Organic chemistry', subject: 'Chemistry', count: 1 },
  ];

  // Sample data for recent scores
  const recentScores = [
    { id: '1', title: 'Introduction to organic chemistry', subject: 'Chemistry', score: 64 },
    { id: '2', title: 'Newton\'s law of motion', subject: 'Physics', score: 79 },
    { id: '3', title: 'Classification of living organisms', subject: 'Biology', score: 72 },
    { id: '4', title: 'Newton\'s law of motion', subject: 'Physics', score: 36 },
    { id: '5', title: 'Circle geometry', subject: 'Mathematics', score: 80 },
    { id: '6', title: 'Circle geometry', subject: 'Mathematics', score: 80 },
    { id: '7', title: 'Circle geometry', subject: 'Mathematics', score: 80 },
    { id: '8', title: 'Circle geometry', subject: 'Mathematics', score: 80 },
  ];

  const handleViewMore = () => {
    // Handle view more action
    console.log('View more pressed');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Select an option to begin</Text>
        
        <ScrollView style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => setSubjectModalVisible(true)}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="lightbulb-on" size={28} color="#fff" />
            </View>
            <Text style={styles.optionTitle}>Do a Quiz</Text>
            <Text style={styles.optionSubtitle}>Select a subject to begin</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => navigation.navigate('AssessmentNotification')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#8B5CF6' }]}>
              <Feather name="file-text" size={28} color="#fff" />
            </View>
            <Text style={styles.optionTitle}>Take an Exam</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionTitle}>Results</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressOuter}>
                <View style={styles.progressInner} />
              </View>
              <Text style={styles.progressText}>72%</Text>
            </View>
            <Text style={styles.viewAllText}>View all results</Text>
          </TouchableOpacity>
          
         <NoticeBoard
           assignedTests={assignedTests}
           recentScores={recentScores}
           onViewMore={handleViewMore}
         />
        </ScrollView>
      </View>

      {/* Subject Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={subjectModalVisible}
        onRequestClose={() => setSubjectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Subject</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSubjectModalVisible(false)}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={subjects}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.subjectItem}
                  onPress={() => handleSubjectSelect(item)}
                >
                  <View style={styles.subjectIconContainer}>
                    <Text style={styles.subjectIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.subjectInfo}>
                    <Text style={styles.subjectName}>{item.name}</Text>
                    <Text style={styles.subjectTopics}>{item.topics} topics</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#666" />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.subjectList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  optionsContainer: {
    flex: 1,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'center',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  progressOuter: {
    width: '80%',
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressInner: {
    width: '72%',
    height: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  viewAllText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  noticeBoard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  noticeBoardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.7,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  subjectList: {
    paddingVertical: 8,
  },
  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  subjectIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  subjectTopics: {
    fontSize: 14,
    color: '#6B7280',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 66,
  },
});

export default AssessmentNotification;