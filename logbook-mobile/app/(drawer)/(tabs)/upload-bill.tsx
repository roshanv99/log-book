import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function UploadBillScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const backgroundColor = Colors[colorScheme].background;
  const cardBackgroundColor = Colors[colorScheme].card;
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string; size: string; date: string; status: string }[]>([
    { id: '1', name: 'electric_bill_june.pdf', size: '2.4 MB', date: '2023-07-01', status: 'processed' },
    { id: '2', name: 'water_bill_may.jpg', size: '1.8 MB', date: '2023-06-15', status: 'processed' },
  ]);

  const handleUpload = () => {
    setUploadStatus('uploading');
    // Simulate upload process
    setTimeout(() => {
      setUploadStatus('success');
      setUploadedFiles([
        { id: '3', name: 'new_bill.jpg', size: '1.2 MB', date: new Date().toISOString().split('T')[0], status: 'processing' },
        ...uploadedFiles,
      ]);
    }, 2000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <ScrollView style={styles.container}>
        <ThemedText style={styles.header}>Upload Bills</ThemedText>
        
        {/* Upload Area */}
        <View style={[styles.card, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <ThemedText style={styles.cardTitle}>Upload New Bill</ThemedText>
          <ThemedText style={styles.cardSubtitle}>Upload your bills to automatically extract and track expenses</ThemedText>
          
          <View style={styles.uploadArea}>
            <IconSymbol 
              name="arrow.up.doc" 
              size={50} 
              color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} 
            />
            <ThemedText style={styles.uploadText}>Drag and drop files here or</ThemedText>
            <TouchableOpacity 
              style={[
                styles.browseButton,
                { backgroundColor: isDark ? '#4361EE' : '#3D5AF1' }
              ]}
              onPress={handleUpload}
              disabled={uploadStatus === 'uploading'}
            >
              <ThemedText style={styles.browseButtonText}>Browse Files</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.supportedText}>
              Supported formats: PDF, JPG, PNG
            </ThemedText>
            
            {uploadStatus === 'uploading' && (
              <View style={styles.statusContainer}>
                <ThemedText style={styles.statusText}>Uploading...</ThemedText>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: '60%' }]} />
                </View>
              </View>
            )}
            
            {uploadStatus === 'success' && (
              <View style={styles.statusContainer}>
                <IconSymbol name="checkmark.circle.fill" size={24} color="#22C55E" />
                <ThemedText style={[styles.statusText, { color: '#22C55E' }]}>Upload successful!</ThemedText>
              </View>
            )}
            
            {uploadStatus === 'error' && (
              <View style={styles.statusContainer}>
                <IconSymbol name="xmark.circle.fill" size={24} color="#EF4444" />
                <ThemedText style={[styles.statusText, { color: '#EF4444' }]}>Upload failed. Please try again.</ThemedText>
              </View>
            )}
          </View>
        </View>
        
        {/* Upload History */}
        <View style={[styles.card, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <ThemedText style={styles.cardTitle}>Upload History</ThemedText>
          
          {uploadedFiles.map((file) => (
            <View key={file.id} style={styles.fileItem}>
              <View style={styles.fileIconContainer}>
                <IconSymbol 
                  name={file.name.endsWith('.pdf') ? 'doc.text.fill' : 'photo.fill'} 
                  size={24} 
                  color={isDark ? '#4361EE' : '#3D5AF1'} 
                />
              </View>
              <View style={styles.fileDetails}>
                <ThemedText style={styles.fileName}>{file.name}</ThemedText>
                <ThemedText style={styles.fileInfo}>{file.size} • {file.date}</ThemedText>
              </View>
              <View style={styles.fileStatus}>
                {file.status === 'processed' ? (
                  <View style={styles.statusBadge}>
                    <IconSymbol name="checkmark.circle.fill" size={16} color="#22C55E" />
                    <ThemedText style={[styles.statusBadgeText, { color: '#22C55E' }]}>Processed</ThemedText>
                  </View>
                ) : (
                  <View style={styles.statusBadge}>
                    <IconSymbol name="clock.fill" size={16} color="#F59E0B" />
                    <ThemedText style={[styles.statusBadgeText, { color: '#F59E0B' }]}>Processing</ThemedText>
                  </View>
                )}
                
                <TouchableOpacity>
                  <IconSymbol name="ellipsis" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        
        {/* Bill Processing Information */}
        <View style={[styles.card, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <ThemedText style={styles.cardTitle}>How It Works</ThemedText>
          
          <View style={styles.stepContainer}>
            <View style={[styles.stepIconContainer, { backgroundColor: isDark ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)' }]}>
              <ThemedText style={[styles.stepNumber, { color: isDark ? '#4361EE' : '#3D5AF1' }]}>1</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Upload Your Bill</ThemedText>
              <ThemedText style={styles.stepDescription}>Upload any supported bill format (PDF, JPG, PNG)</ThemedText>
            </View>
          </View>
          
          <View style={styles.stepContainer}>
            <View style={[styles.stepIconContainer, { backgroundColor: isDark ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)' }]}>
              <ThemedText style={[styles.stepNumber, { color: isDark ? '#4361EE' : '#3D5AF1' }]}>2</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Automatic Processing</ThemedText>
              <ThemedText style={styles.stepDescription}>Our system extracts key bill information automatically</ThemedText>
            </View>
          </View>
          
          <View style={styles.stepContainer}>
            <View style={[styles.stepIconContainer, { backgroundColor: isDark ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)' }]}>
              <ThemedText style={[styles.stepNumber, { color: isDark ? '#4361EE' : '#3D5AF1' }]}>3</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Review & Approve</ThemedText>
              <ThemedText style={styles.stepDescription}>Verify the extracted information before finalizing</ThemedText>
            </View>
          </View>
          
          <View style={styles.stepContainer}>
            <View style={[styles.stepIconContainer, { backgroundColor: isDark ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)' }]}>
              <ThemedText style={[styles.stepNumber, { color: isDark ? '#4361EE' : '#3D5AF1' }]}>4</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Track & Analyze</ThemedText>
              <ThemedText style={styles.stepDescription}>Bill data is integrated into your financial reports</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderWidth: 2,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.1)',
  },
  uploadText: {
    marginTop: 16,
    marginBottom: 12,
    fontSize: 16,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  supportedText: {
    fontSize: 12,
    opacity: 0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    width: 100,
    marginLeft: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4361EE',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileDetails: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontWeight: '500',
    fontSize: 16,
  },
  fileInfo: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
  },
  fileStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginRight: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
}); 