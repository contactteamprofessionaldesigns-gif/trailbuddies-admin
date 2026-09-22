import { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { indianStatesDistricts } from './indian-states-districts';
import * as turf from '@turf/turf';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { Authenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';

// Initialize GraphQL client at top level for Amplify v6
const client = generateClient();

// ChangeView component for programmatic map updates
function ChangeView({ center, zoom }) {
  const map = useMap();
  if (center && center.length === 2) {
    map.setView(center, zoom);
  }
  return null;
}

function App({ signOut, user }) {
  console.log('App component rendering');
  const handleAddTrek = async (e) => {
  e.preventDefault();
  
  // Strict validation
  if (!validateForm()) {
    alert('Please fill in all mandatory fields before adding a trek.');
    return;
  }

  // Generate auto-incrementing custom ID based on existing treks
  const maxCustomId = treks.reduce((max, trek) => {
    const idNum = parseInt(trek.trekCustomId.replace('ST', '')) || 0;
    return idNum > max ? idNum : max;
  }, 0);
  const nextCustomId = `ST${maxCustomId + 1}`;

  // Generate unique ID using timestamp
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    const mutation = `
      mutation CreateTrek($input: CreateTrekInput!) {
        createTrek(input: $input) {
          id
          trekCustomId
          title
          location
          difficulty
          duration
          category
          country
          state
          district
          date
          slots
          locationHistory
          whatToSee
          howToReach
          thingsToPack
          imageUrl
          gpxFileUrl
        }
      }
    `;
    
    const input = {
      id: uniqueId,
      trekCustomId: String(nextCustomId),
      title: String(newTrek.title),
      location: String(newTrek.location),
      difficulty: String(newTrek.difficulty),
      duration: String(newTrek.duration),
      category: String(newTrek.category),
      country: String(newTrek.country),
      state: String(newTrek.state),
      district: String(newTrek.district),
      date: String(new Date().toISOString().split('T')[0]),
      slots: String(10),
      locationHistory: String(newTrek.locationHistory),
      whatToSee: String(newTrek.whatToSee),
      howToReach: String(newTrek.howToReach),
      thingsToPack: String(newTrek.thingsToPack),
      gpxFileUrl: newTrek.gpxFile ? String(newTrek.gpxFile.name) : null,
      imageUrl: String(newTrek.imageUrl)
    };

    console.log('Creating trek with input:', JSON.stringify(input, null, 2));
    
    const response = await client.graphql({ query: mutation, variables: { input } });
    console.log('Create trek response:', response);
    
    await fetchTreks(); // Refresh treks from database
    
    setNewTrek({ 
      title: '', 
      location: '', 
      difficulty: 'Easy', 
      duration: '', 
      category: 'Trails',
      country: 'India',
      state: '',
      district: '',
      locationHistory: '',
      whatToSee: '',
      howToReach: '',
      thingsToPack: '',
      gpxFile: null,
      imageUrl: '',
      gpxPreview: null,
      gpxMapKey: 0
    });
  } catch (error) {
    console.error('Error creating trek - Full error details:', error);
    console.error('Error message:', error.message);
    console.error('Error errors:', error.errors);
    console.error('Error stack:', error.stack);
    alert(`Error creating trek: ${error.message || 'Unknown error'}. Check console for details.`);
  }
};
  const handleDeleteTrek = async (id) => {
  if (window.confirm('Are you sure you want to delete this trek? This action cannot be undone.')) {
    try {
      const mutation = `
        mutation DeleteTrek($id: ID!) {
          deleteTrek(id: $id) {
            id
          }
        }
      `;
      await client.graphql({ query: mutation, variables: { id } });
      await fetchTreks(); // Refresh treks from database
    } catch (error) {
      console.error('Error deleting trek:', error);
      alert('Error deleting trek. Please try again.');
    }
  }
};
  // Export App wrapped with Authenticator
export default function AppWithAuth() {
  return (
    <Authenticator>
      {({ signOut, user }) => <App signOut={signOut} user={user} />}
    </Authenticator>
  );
}
