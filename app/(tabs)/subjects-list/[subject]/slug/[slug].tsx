import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  SafeAreaView,
  FlatList,
  TextInput,
  ActivityIndicator,
  StatusBar as RNStatusBar,
  Platform
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { useGetCardsQuery, useGetSubtopicsQuery } from '@/services/api';
import WebView from 'react-native-webview';
import { Audio } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useUIStore } from '@/store/uiStore';
import FloatingAI from '../../../../components/FloatingAI';

const { width, height } = Dimensions.get('window');

const SimulationScreen = () => {
  const { subjectId, topicId } = useLocalSearchParams<{
    subjectId: string;
    topicId: string;
  }>();

  // State management
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Topics');
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // API calls
  const { data: subtopicsData } = useGetSubtopicsQuery({ 
    topic_id: parseInt(topicId || '1', 10) 
  });

  const { data: cardsData, isLoading, error } = useGetCardsQuery({
    subject_id: parseInt(subjectId || '4', 10),
    topic_id: parseInt(topicId || '1', 10),
    subtopic_id: selectedSubtopicId || undefined,
    isOnline: true
  });

  const currentCard = cardsData?.results?.[currentCardIndex];
  const webviewRef = useRef<WebView>(null);
  const setHeaderVisible = useUIStore(state => state.setHeaderVisible);

  // Handle subtopic selection
  const handleSubtopicSelect = useCallback((subtopicId: number) => {
    setSelectedSubtopicId(subtopicId);
    setCurrentCardIndex(0);
    setIsModelLoaded(false);
  }, []);

  // Audio management
  const loadAudio = useCallback(async () => {
    if (!currentCard?.audio_file) return;

    try {
      setIsAudioLoading(true);
      if (sound) await sound.unloadAsync();

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: currentCard.audio_file },
        { shouldPlay: false },
        (status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) setIsPlaying(false);
          }
        }
      );

      setSound(newSound);
    } catch (error) {
      console.error('Error loading audio:', error);
    } finally {
      setIsAudioLoading(false);
    }
  }, [currentCard?.audio_file]);

  const handlePlayPause = async () => {
    if (!sound) return;
    isPlaying ? await sound.pauseAsync() : await sound.playAsync();
  };

  const handleMute = async () => {
    if (!sound) return;
    await sound.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
  };

  const handleReset = async () => {
    if (!sound) return;
    await sound.stopAsync();
    await sound.setPositionAsync(0);
    setIsPlaying(false);
  };

  // Fullscreen management
  const toggleFullscreen = useCallback(async () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);

    try {
      if (newFullscreenState) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        Platform.OS === 'android' && RNStatusBar.setHidden(true);
        setHeaderVisible(false);
      } else {
        await ScreenOrientation.unlockAsync();
        Platform.OS === 'android' && RNStatusBar.setHidden(false);
        setHeaderVisible(true);
      }
    } catch (error) {
      console.error('Error changing screen orientation:', error);
    }
  }, [isFullscreen]);

  // Cleanup effects
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
      ScreenOrientation.unlockAsync();
      Platform.OS === 'android' && RNStatusBar.setHidden(false);
      setHeaderVisible(true);
    };
  }, []);

  // Load audio when card changes
  useEffect(() => {
    if (currentCard?.audio_file) loadAudio();
  }, [currentCard?.audio_file]);

  // Render experiment item for carousel
  const renderExperimentItem = ({ item, index }: { item: any, index: number }) => (
    <TouchableOpacity
      style={[
        styles.experimentItem,
        currentCardIndex === index && styles.selectedExperimentItem
      ]}
      onPress={() => {
        setIsModelLoaded(false);
        setCurrentCardIndex(index);
      }}
    >
      {item.thumbnail_file ? (
        <Image
          source={{ uri: item.thumbnail_file }}
          style={styles.experimentImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.experimentFallback}>
          <Ionicons name="image-outline" size={24} color="white" />
        </View>
      )}
      <Text style={styles.experimentTitle} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
  );

  if (isLoading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#6B8AF7" />
      <Text style={styles.loadingText}>Loading content...</Text>
    </View>
  );

  if (error) return (
    <View style={styles.errorContainer}>
      <Feather name="alert-circle" size={40} color="#EF4444" />
      <Text style={styles.errorText}>Failed to load content</Text>
      <TouchableOpacity style={styles.retryButton}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Fullscreen Mode */}
      {isFullscreen && currentCard?.verge3d_file && (
        <View style={styles.fullscreenContainer}>
           <FloatingAI />
          <WebView
            ref={webviewRef}
            style={styles.fullscreenWebView}
            originWhitelist={['*']}
            source={{
              html: `
              <!DOCTYPE html>
              <html style="height: 100%; width: 100%; margin: 0; padding: 0; overflow: hidden;">
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <style>
                  html, body {
                    height: 100%;
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    background-color: #000;
                  }
                  iframe {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    border: none;
                    overflow: hidden;
                  }
                </style>
              </head>
              <body>
                <iframe src="${currentCard.verge3d_file}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </body>
              </html>
            ` }}
            renderLoading={() => (
              <View style={styles.webviewLoading}>
                <ActivityIndicator size="large" color="#6B8AF7" />
                <Text style={styles.loadingText}>Loading 3D content...</Text>
              </View>
            )}
            onLoadEnd={() => setIsModelLoaded(true)}
            startInLoadingState={true}
            cacheEnabled={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            androidLayerType="hardware"
            androidHardwareAccelerationDisabled={false}
          />

          {/* Floating Controls */}
          <View style={styles.floatingControlsContainer}>
            <View style={styles.floatingHeader}>
              <TouchableOpacity
                style={styles.floatingButton}
                onPress={toggleFullscreen}
              >
                <Ionicons name="contract-outline" size={24} color="white" />
              </TouchableOpacity>

              <Text style={styles.floatingTitle} numberOfLines={1}>
                {currentCard.title}
              </Text>
            </View>

            <View style={styles.floatingMediaControls}>
              {currentCard?.audio_file && (
                <>
                  <TouchableOpacity
                    style={styles.floatingControlButton}
                    onPress={handleMute}
                    disabled={isAudioLoading}
                  >
                    <Ionicons name={isMuted ? "volume-mute" : "volume-medium"} size={22} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.floatingControlButton}
                    onPress={handlePlayPause}
                    disabled={isAudioLoading}
                  >
                    {isAudioLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Ionicons name={isPlaying ? "pause" : "play"} size={22} color="white" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.floatingControlButton}
                    onPress={handleReset}
                    disabled={isAudioLoading}
                  >
                    <Ionicons name="refresh" size={22} color="white" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Regular Simulation View */}
      {!isLoading && !error && currentCard && !isFullscreen && (
        <>
          <View style={styles.simulationContainer}>
            <View style={styles.simulationHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.experimentLabel}>
                <Text style={styles.experimentLabelText}>{currentCard.title}</Text>
              </View>
              <TouchableOpacity
                style={styles.fullscreenButton}
                onPress={toggleFullscreen}
              >
                <Ionicons
                  name="expand-outline"
                  size={22}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            {currentCard?.verge3d_file ? (
              <WebView
                ref={webviewRef}
                style={[styles.simulationImage, isFullscreen && styles.fullscreenWebView]}
                originWhitelist={['*']}
                source={{ html: `<iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="width: 100%; height: 100%; border: none; background-color: transparent;" src="${currentCard.verge3d_file}" />` }}
                renderLoading={() => (
                  <View style={styles.webviewLoading}>
                    <ActivityIndicator size="large" color="#6B8AF7" />
                    <Text style={styles.loadingText}>Loading 3D content...</Text>
                  </View>
                )}
                onLoadEnd={() => setIsModelLoaded(true)}
                startInLoadingState={true}
                cacheEnabled={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                androidLayerType="hardware"
                androidHardwareAccelerationDisabled={false}
              />
            ) : currentCard?.thumbnail_file ? (
              <Image
                source={{ uri: currentCard.thumbnail_file }}
                style={styles.simulationImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.noImageContainer}>
                <Feather name="image" size={40} color="#64748B" />
                <Text style={styles.noImageText}>No visualization available</Text>
              </View>
            )}

            <View style={styles.controlsContainer}>
              <View style={styles.mediaControls}>
                <TouchableOpacity
                  style={[styles.controlButton, !currentCard?.audio_file && styles.disabledButton]}
                  onPress={handleMute}
                  disabled={!currentCard?.audio_file || isAudioLoading}
                >
                  <Ionicons name={isMuted ? "volume-mute" : "volume-medium"} size={22} color={currentCard?.audio_file ? "white" : "#666"} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, !currentCard?.audio_file && styles.disabledButton]}
                  onPress={handlePlayPause}
                  disabled={!currentCard?.audio_file || isAudioLoading}
                >
                  {isAudioLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name={isPlaying ? "pause" : "play"} size={22} color={currentCard?.audio_file ? "white" : "#666"} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, !currentCard?.audio_file && styles.disabledButton]}
                  onPress={handleReset}
                  disabled={!currentCard?.audio_file || isAudioLoading}
                >
                  <Ionicons name="refresh" size={22} color={currentCard?.audio_file ? "white" : "#666"} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlButton}>
                  <Ionicons name="settings-outline" size={22} color="white" />
                </TouchableOpacity>
              </View>
{/* 
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Assessment</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>End Class</Text>
                </TouchableOpacity>
              </View> */}
            </View>
          </View>

          {/* Experiments Carousel */}
          {cardsData?.results && (
            <View style={styles.experimentsContainer}>
              <FlatList
                data={cardsData.results}
                renderItem={renderExperimentItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.experimentsList}
              />
            </View>
          )}

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
              <Text style={styles.tabText}>Content List</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'Search' && styles.activeTab]}
              onPress={() => setActiveTab('Search')}
            >
              <Ionicons name="search-outline" size={20} color="white" />
              <Text style={styles.tabText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Content View */}
          {activeTab === 'Content' && currentCard && (
            <View style={styles.contentContainer}>
              {currentCard.content ? (
                <WebView
                  originWhitelist={['*']}
                  source={{
                    html: `
                      <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                          body {
                            font-family: system-ui, -apple-system, sans-serif;
                            padding: 16px;
                            color: white;
                            background-color: #121212;
                            font-size: 16px;
                            line-height: 1.5;
                          }
                          p { margin-bottom: 16px; }
                          strong { color: #6B8AF7; }
                          table { border-collapse: collapse; margin: 16px 0; width: 100%; }
                          td, th { border: 1px solid #334155; padding: 8px; }
                          th { background-color: #1E293B; }
                        </style>
                      </head>
                      <body>
                        ${currentCard.content}
                      </body>
                      </html>
                    `
                  }}
                  style={{ height: height * 0.6, backgroundColor: '#121212' }}
                />
              ) : (
                <View style={styles.noContentContainer}>
                  <Text style={styles.noContentText}>No content available for this topic</Text>
                </View>
              )}
            </View>
          )}

          {/* Topics List */}
          {activeTab === 'Topics' && subtopicsData && (
            <ScrollView style={styles.topicsContainer}>
              {subtopicsData.results.map((subtopic) => (
                <TouchableOpacity
                  key={subtopic.id}
                  style={[
                    styles.topicItem,
                    selectedSubtopicId === subtopic.id && styles.activeTopicItem
                  ]}
                  onPress={() => handleSubtopicSelect(subtopic.id)}
                >
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={16} color="white" />
                  </View>
                  <Text style={styles.topicText}>{subtopic.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Search Tab */}
          {activeTab === 'Search' && (
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Feather name="search" size={20} color="#64748B" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search content"
                  placeholderTextColor="#64748B"
                />
              </View>
              <Text style={styles.searchHint}>Type to search for topics and content</Text>
            </View>
          )}
        </>
      )}
      <FloatingAI />
    </SafeAreaView>
  );
};

// Keep all your existing styles exactly as they were
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  simulationContainer: {
    height: 400,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1000,
    backgroundColor: '#000',
    paddingTop: 0,
  },
  floatingControlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1001,
    padding: 16,
  },
  floatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    marginBottom: 16,
  },
  floatingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  floatingTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  floatingMediaControls: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    alignSelf: 'flex-start',
  },
  floatingControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fullscreenButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  simulationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    justifyContent: 'space-between',
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
    flex: 1,
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
    backgroundColor: '#000',
    overflow: 'hidden',
    borderRadius: 8,
  },
  simulationImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  fullscreenWebView: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  controlsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
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
    fontSize: 15,
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94A3B8',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94A3B8',
  },
  noContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#121212',
    height: height * 0.6,
  },
  noContentText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  activeTopicItem: {
    backgroundColor: 'rgba(107, 138, 247, 0.2)',
    borderLeftWidth: 3,
    borderLeftColor: '#6B8AF7',
  },
  searchContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
    width: '100%',
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
  searchHint: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  experimentFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2C3E50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  experimentTitle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 4,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default SimulationScreen;