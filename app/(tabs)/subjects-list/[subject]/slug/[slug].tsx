import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Dimensions, 
  SafeAreaView,
  FlatList
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Sample data for experiments
const experiments = [
    { id: '1', title: 'Osmosis', image: 'https://images.pexels.com/photos/29006120/pexels-photo-29006120/free-photo-of-abstract-oil-and-water-bubbles-macro-photography.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: '2', title: 'Electrical Circuit', image: 'https://images.pexels.com/photos/189524/pexels-photo-189524.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: '4', title: 'Chemical Reaction', image: 'https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=600/' },
    { id: '5', title: 'Magnetism', image: 'https://images.pexels.com/photos/8082893/pexels-photo-8082893.jpeg?auto=compress&cs=tinysrgb&w=600' },
  ];

// Sample data for topics
const topics = [
  { id: '1', title: 'Living And Non-Living Things' },
  { id: '2', title: 'Basic Functions Of Living Organism' },
  { id: '3', title: 'Classification Of Living Organism' },
  { id: '4', title: 'Cell Organization' },
];

const SimulationScreen = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('Topics');
  const [selectedExperiment, setSelectedExperiment] = useState('1');
  
  const scrollViewRef = useRef(null);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleReset = () => {
    // Reset simulation logic here
    setIsPlaying(false);
  };

  const handleExperimentSelect = (id) => {
    setSelectedExperiment(id);
  };

  const renderExperimentItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.experimentItem, 
        selectedExperiment === item.id && styles.selectedExperimentItem
      ]}
      onPress={() => handleExperimentSelect(item.id)}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.experimentImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Simulation View */}
      <View style={styles.simulationContainer}>
        <View style={styles.simulationHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.experimentLabel}>
            <Text style={styles.experimentLabelText}>Osmosis</Text>
          </View>
        </View>
        
        <View style={styles.simulationContent}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/17483869/pexels-photo-17483869/free-photo-of-an-artist-s-illustration-of-artificial-intelligence-ai-this-image-represents-how-machine-learning-is-inspired-by-neuroscience-and-the-human-brain-it-was-created-by-novoto-studio-as-par.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'}} 
            style={styles.simulationImage}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.controlsContainer}>
          <View style={styles.mediaControls}>
            <TouchableOpacity style={styles.controlButton} onPress={handleMute}>
              <Ionicons name={isMuted ? "volume-mute" : "volume-medium"} size={22} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={handlePlayPause}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={22} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={handleReset}>
              <Ionicons name="refresh" size={22} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="settings-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Assessment</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>End Class</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Experiments Carousel */}
      <View style={styles.experimentsContainer}>
        <View style={styles.carouselControls}>
          <TouchableOpacity style={styles.carouselButton}>
            <Ionicons name="chevron-back" size={20} color="white" />
          </TouchableOpacity>
          
          <FlatList
            data={experiments}
            renderItem={renderExperimentItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.experimentsList}
            ref={scrollViewRef}
          />
          
          <TouchableOpacity style={styles.carouselButton}>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Content' && styles.activeTab]}
          onPress={() => setActiveTab('Content')}
        >
          <Ionicons name="book-outline" size={20} color="white" />
          <Text style={styles.tabText}>Content</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Topics' && styles.activeTab]}
          onPress={() => setActiveTab('Topics')}
        >
          <Ionicons name="list-outline" size={20} color="white" />
          <Text style={styles.tabText}>Topics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Search' && styles.activeTab]}
          onPress={() => setActiveTab('Search')}
        >
          <Ionicons name="search-outline" size={20} color="white" />
          <Text style={styles.tabText}>Search</Text>
        </TouchableOpacity>
      </View>
      
      {/* Topics List */}
      <ScrollView style={styles.topicsContainer}>
        {topics.map((topic) => (
          <TouchableOpacity key={topic.id} style={styles.topicItem}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={16} color="white" />
            </View>
            <Text style={styles.topicText}>{topic.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  simulationContainer: {
    height: height * 0.5,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  simulationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
  },
  experimentLabel: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 16,
  },
  experimentLabelText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  simulationContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simulationImage: {
    width: '80%',
    height: '80%',
  },
  controlsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mediaControls: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  experimentsContainer: {
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  carouselControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carouselButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  experimentsList: {
    paddingHorizontal: 8,
  },
  experimentItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedExperimentItem: {
    borderColor: '#3B82F6',
  },
  experimentImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.2 }],
    objectFit: 'cover',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
    backgroundColor: '#2C3E50',
  },
  tabText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 14,
  },
  topicsContainer: {
    flex: 1,
    backgroundColor: '#121212',
    paddingVertical: 8,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topicText: {
    color: 'white',
    fontSize: 16,
  },
});

export default SimulationScreen;