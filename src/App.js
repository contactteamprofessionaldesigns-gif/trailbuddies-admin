import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { indianStatesDistricts } from './indian-states-districts';
import * as turf from '@turf/turf';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';

// ChangeView component for programmatic map updates
function ChangeView({ center, zoom }) {
  const map = useMap();
  if (center && center.length === 2) {
    map.setView(center, zoom);
  }
  return null;
}

function App() {
  console.log('App component rendering');
  
  const [treks, setTreks] = useState([
    { 
      id: 1, 
      trekCustomId: 'ST1',
      name: 'Mountain Peak Adventure', 
      location: 'Himalayas', 
      difficulty: 'Hard', 
      duration: '7 days', 
      category: 'Trails',
      country: 'Nepal',
      state: 'Bagmati',
      district: 'Kathmandu',
      title: 'Mountain Peak Adventure',
      date: '2026-09-20',
      slots: 10,
      locationHistory: 'Historical mountain routes used by ancient traders',
      whatToSee: 'Snow-capped peaks, alpine lakes, rare wildlife',
      howToReach: 'Fly to Kathmandu, then drive to trailhead',
      thingsToPack: 'Warm clothing, ice axe, crampons, first aid kit',
      imageUrl: ''
    },
    { 
      id: 2, 
      trekCustomId: 'ST2',
      name: 'Forest Trail Explorer', 
      location: 'Amazon', 
      difficulty: 'Moderate', 
      duration: '5 days', 
      category: 'Trails',
      country: 'Brazil',
      state: 'Amazonas',
      district: 'Manaus',
      title: 'Forest Trail Explorer',
      date: '2026-09-25',
      slots: 8,
      locationHistory: 'Indigenous hunting paths through pristine rainforest',
      whatToSee: 'Exotic birds, medicinal plants, waterfalls',
      howToReach: 'Boat transfer from Manaus, then jungle trek',
      thingsToPack: 'Insect repellent, water purification, hammock',
      imageUrl: ''
    },
    { 
      id: 3, 
      trekCustomId: 'ST3',
      name: 'Coastal Walk Journey', 
      location: 'California', 
      difficulty: 'Easy', 
      duration: '3 days', 
      category: 'Trails',
      country: 'USA',
      state: 'California',
      district: 'San Francisco',
      title: 'Coastal Walk Journey',
      date: '2026-09-28',
      slots: 15,
      locationHistory: 'Historic coastal trail used by early settlers',
      whatToSee: 'Ocean views, sea caves, marine wildlife',
      howToReach: 'Drive to Pacific Coast Highway trailhead',
      thingsToPack: 'Sunscreen, water shoes, camera, binoculars',
      imageUrl: ''
    },
  ]);

  const [newTrek, setNewTrek] = useState({
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

  const [editingTrek, setEditingTrek] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const editImageInputRef = useRef(null);
  const editGpxInputRef = useRef(null);

  // Analytics Data
  const categoryData = [
    { name: 'Fort', value: treks.filter(t => t.category === 'Fort').length },
    { name: 'Waterfall', value: treks.filter(t => t.category === 'Waterfall').length },
    { name: 'Caves', value: treks.filter(t => t.category === 'Caves').length },
    { name: 'Trails', value: treks.filter(t => t.category === 'Trails').length }
  ].filter(item => item.value > 0);

  const categoryColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  const geographicData = Object.entries(
    treks.reduce((acc, trek) => {
      const key = `${trek.state} - ${trek.district}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const geographicColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const validateForm = () => {
    const requiredFields = [
      'title',
      'duration', 
      'state',
      'district',
      'locationHistory',
      'whatToSee',
      'howToReach',
      'thingsToPack'
    ];

    for (const field of requiredFields) {
      if (!newTrek[field] || newTrek[field].trim() === '') {
        return false;
      }
    }

    // Check file uploads
    if (!newTrek.imageUrl) {
      return false;
    }

    if (!newTrek.gpxFile) {
      return false;
    }

    return true;
  };

  const handleAddTrek = (e) => {
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

    const trek = {
      id: treks.length + 1,
      trekCustomId: nextCustomId,
      name: newTrek.title,
      location: newTrek.location,
      difficulty: newTrek.difficulty,
      duration: newTrek.duration,
      category: newTrek.category,
      country: newTrek.country,
      state: newTrek.state,
      district: newTrek.district,
      title: newTrek.title,
      date: new Date().toISOString().split('T')[0],
      slots: 10,
      locationHistory: newTrek.locationHistory,
      whatToSee: newTrek.whatToSee,
      howToReach: newTrek.howToReach,
      thingsToPack: newTrek.thingsToPack,
      gpxFileUrl: newTrek.gpxFile ? newTrek.gpxFile.name : null,
      imageUrl: newTrek.imageUrl
    };
    setTreks([...treks, trek]);
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
  };

  const handleDeleteTrek = (id) => {
    if (window.confirm('Are you sure you want to delete this trek? This action cannot be undone.')) {
      setTreks(treks.filter(trek => trek.id !== id));
    }
  };

  const handleEditTrek = (trek) => {
    setEditingTrek({ 
      ...trek,
      tempImageUrl: trek.imageUrl,
      tempGpxFile: trek.gpxFileUrl,
      tempGpxPreview: null,
      tempGpxMapKey: 0
    });
    setIsEditModalOpen(true);
    
    // Reset file inputs
    if (editImageInputRef.current) {
      editImageInputRef.current.value = '';
    }
    if (editGpxInputRef.current) {
      editGpxInputRef.current.value = '';
    }
  };

  const handleUpdateTrek = (e) => {
    e.preventDefault();
    
    if (!editingTrek) return;

    const updatedTrek = {
      ...editingTrek,
      imageUrl: editingTrek.tempImageUrl || editingTrek.imageUrl,
      gpxFileUrl: editingTrek.tempGpxFile ? editingTrek.tempGpxFile.name : editingTrek.gpxFileUrl
    };

    const updatedTreks = treks.map(trek => 
      trek.id === editingTrek.id ? updatedTrek : trek
    );
    
    setTreks(updatedTreks);
    setIsEditModalOpen(false);
    setEditingTrek(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'state') {
      setEditingTrek({
        ...editingTrek,
        [name]: value,
        district: ''
      });
    } else {
      setEditingTrek({
        ...editingTrek,
        [name]: value
      });
    }
  };

  const handleEditImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if image is horizontal (width > height)
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = async () => {
      if (img.height > img.width) {
        alert('Please upload a landscape/horizontal image.');
        e.target.value = ''; // Clear the file input
        return;
      }

      // Compress image to 30KB
      try {
        const options = {
          maxSizeMB: 0.03, // 30KB = 0.03MB
          maxWidthOrHeight: 1920,
          useWebWorker: true
        };

        const compressedFile = await imageCompression(file, options);
        
        // Create object URL for preview
        const imageUrl = URL.createObjectURL(compressedFile);
        
        setEditingTrek({
          ...editingTrek,
          tempImageUrl: imageUrl,
          tempImageFile: compressedFile
        });
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('Error processing image. Please try another image.');
      }
    };
  };

  const handleEditGpxChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clear previous GPX data
    setEditingTrek({
      ...editingTrek,
      tempGpxFile: null,
      tempGpxPreview: null,
      tempGpxMapKey: (editingTrek.tempGpxMapKey || 0) + 1
    });

    // Parse GPX file for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(event.target.result, "text/xml");
        
        // Extract track points
        const trackPoints = xmlDoc.getElementsByTagName("trkpt");
        const coordinates = [];
        
        for (let i = 0; i < trackPoints.length; i++) {
          const lat = parseFloat(trackPoints[i].getAttribute("lat"));
          const lon = parseFloat(trackPoints[i].getAttribute("lon"));
          if (!isNaN(lat) && !isNaN(lon)) {
            coordinates.push([lat, lon]); // Store as [lat, lon] for Leaflet
          }
        }

        if (coordinates.length > 0) {
          // Create a simple line string for preview
          const line = turf.lineString(coordinates.map(coord => [coord[1], coord[0]])); // Convert back to [lon, lat] for turf
          const bbox = turf.bbox(line);
          
          setEditingTrek({
            ...editingTrek,
            tempGpxFile: file,
            tempGpxPreview: {
              coordinates: coordinates,
              bbox: bbox,
              pointCount: coordinates.length
            },
            tempGpxMapKey: (editingTrek.tempGpxMapKey || 0) + 1
          });
        } else {
          setEditingTrek({
            ...editingTrek,
            tempGpxFile: file,
            tempGpxPreview: null
          });
        }
      } catch (error) {
        console.error('Error parsing GPX file:', error);
        setEditingTrek({
          ...editingTrek,
          tempGpxFile: file,
          tempGpxPreview: null
        });
      }
    };
    
    reader.readAsText(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Reset district when state changes
    if (name === 'state') {
      setNewTrek({
        ...newTrek,
        [name]: value,
        district: ''
      });
    } else {
      setNewTrek({
        ...newTrek,
        [name]: value
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clear previous GPX data
    setNewTrek({
      ...newTrek,
      gpxFile: null,
      gpxPreview: null,
      gpxMapKey: newTrek.gpxMapKey + 1
    });

    // Parse GPX file for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(event.target.result, "text/xml");
        
        // Extract track points
        const trackPoints = xmlDoc.getElementsByTagName("trkpt");
        const coordinates = [];
        
        for (let i = 0; i < trackPoints.length; i++) {
          const lat = parseFloat(trackPoints[i].getAttribute("lat"));
          const lon = parseFloat(trackPoints[i].getAttribute("lon"));
          if (!isNaN(lat) && !isNaN(lon)) {
            coordinates.push([lat, lon]); // Store as [lat, lon] for Leaflet
          }
        }

        if (coordinates.length > 0) {
          // Create a simple line string for preview
          const line = turf.lineString(coordinates.map(coord => [coord[1], coord[0]])); // Convert back to [lon, lat] for turf
          const bbox = turf.bbox(line);
          
          setNewTrek({
            ...newTrek,
            gpxFile: file,
            gpxPreview: {
              coordinates: coordinates,
              bbox: bbox,
              pointCount: coordinates.length
            },
            gpxMapKey: newTrek.gpxMapKey + 1
          });
        } else {
          setNewTrek({
            ...newTrek,
            gpxFile: file,
            gpxPreview: null
          });
        }
      } catch (error) {
        console.error('Error parsing GPX file:', error);
        setNewTrek({
          ...newTrek,
          gpxFile: file,
          gpxPreview: null
        });
      }
    };
    
    reader.readAsText(file);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if image is horizontal (width > height)
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = async () => {
      if (img.height > img.width) {
        alert('Please upload a landscape/horizontal image.');
        e.target.value = ''; // Clear the file input
        return;
      }

      // Compress image to 30KB
      try {
        const options = {
          maxSizeMB: 0.03, // 30KB = 0.03MB
          maxWidthOrHeight: 1920,
          useWebWorker: true
        };

        const compressedFile = await imageCompression(file, options);
        
        // Create object URL for preview
        const imageUrl = URL.createObjectURL(compressedFile);
        
        setNewTrek({
          ...newTrek,
          imageUrl: imageUrl,
          imageFile: compressedFile
        });
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('Error processing image. Please try another image.');
      }
    };
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">Treks Dashboard</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Distribution</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Geographic Breakdown</h3>
            {geographicData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={geographicData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name.split(' - ')[0]} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {geographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={geographicColors[index % geographicColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Treks</p>
                <p className="text-3xl font-bold text-gray-800">{treks.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Rescue</p>
                <p className="text-3xl font-bold text-gray-800">{treks.length}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Incident Alerts</p>
                <p className="text-3xl font-bold text-gray-800">{treks.length}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recently Added Treks</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trek ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trek Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {treks.map((trek) => (
                    <tr key={trek.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{trek.trekCustomId}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {trek.imageUrl ? (
                          <img src={trek.imageUrl} alt={trek.title} className="h-12 w-16 object-cover rounded" />
                        ) : (
                          <div className="h-12 w-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{trek.title}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{trek.difficulty}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{trek.date}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {trek.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditTrek(trek)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTrek(trek.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Trek</h2>
            <form onSubmit={handleAddTrek} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trek Title</label>
                <input
                  type="text"
                  name="title"
                  value={newTrek.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter trek title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={newTrek.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={newTrek.country}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  name="state"
                  value={newTrek.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select State</option>
                  {Object.keys(indianStatesDistricts).map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <select
                  name="district"
                  value={newTrek.district}
                  onChange={handleInputChange}
                  required
                  disabled={!newTrek.state}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select District</option>
                  {newTrek.state && indianStatesDistricts[newTrek.state]?.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  name="difficulty"
                  value={newTrek.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={newTrek.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Fort">Fort</option>
                  <option value="Waterfall">Waterfall</option>
                  <option value="Caves">Caves</option>
                  <option value="Trails">Trails</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={newTrek.duration}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5 days"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location History *</label>
                <textarea
                  name="locationHistory"
                  value={newTrek.locationHistory}
                  onChange={handleInputChange}
                  rows="2"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Historical information about the location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What to See *</label>
                <textarea
                  name="whatToSee"
                  value={newTrek.whatToSee}
                  onChange={handleInputChange}
                  rows="2"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Points of interest and attractions"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How to Reach *</label>
                <textarea
                  name="howToReach"
                  value={newTrek.howToReach}
                  onChange={handleInputChange}
                  rows="2"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Transportation and route information"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Things to Pack *</label>
                <textarea
                  name="thingsToPack"
                  value={newTrek.thingsToPack}
                  onChange={handleInputChange}
                  rows="2"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Essential items and equipment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Trek Image *</label>
                <input
                  type="file"
                  name="trekImage"
                  onChange={handleImageChange}
                  accept="image/*"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Upload horizontal/landscape image (will be compressed to 30KB)</p>
                {newTrek.imageUrl && (
                  <div className="mt-3 p-3 bg-gray-50 rounded border">
                    <p className="text-sm font-medium text-gray-700 mb-2">Image Preview</p>
                    <img src={newTrek.imageUrl} alt="Preview" className="h-32 w-auto rounded border mx-auto" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GPX File (GPS Route)</label>
                <input
                  type="file"
                  name="gpxFile"
                  onChange={handleFileChange}
                  accept=".gpx"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Upload .gpx file for GPS route tracking</p>
                {newTrek.gpxPreview && (
                  <div className="mt-3 p-3 bg-gray-50 rounded border">
                    <p className="text-sm font-medium text-gray-700 mb-2">GPX Route Preview</p>
                    <div className="h-[350px] rounded-lg overflow-hidden border">
                      <MapContainer 
                        key={newTrek.gpxMapKey}
                        center={newTrek.gpxPreview.coordinates[0]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <ChangeView center={newTrek.gpxPreview.coordinates[0]} zoom={13} />
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                        />
                        <Polyline 
                          positions={newTrek.gpxPreview.coordinates}
                          color="#3B82F6"
                          weight={3}
                        />
                      </MapContainer>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{newTrek.gpxPreview.pointCount} GPS Points</p>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!validateForm()}
                className={`w-full py-2 px-4 rounded-md transition duration-200 ${
                  validateForm() 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                {validateForm() ? 'Add Trek' : 'Fill All Required Fields *'}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Treks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {treks.map((trek) => (
              <div key={trek.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                {trek.imageUrl && (
                  <img src={trek.imageUrl} alt={trek.name} className="w-full h-32 object-cover rounded mb-3" />
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{trek.name}</h3>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{trek.trekCustomId}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">📍 {trek.location}</p>
                <p className="text-sm text-gray-600 mb-1">⚡ {trek.difficulty}</p>
                <p className="text-sm text-gray-600 mb-1">⏱️ {trek.duration}</p>
                <p className="text-sm text-gray-600 mb-1">🏷️ {trek.category}</p>
                <p className="text-sm text-gray-600 mb-1">🌍 {trek.country}, {trek.state}, {trek.district}</p>
                <p className="text-sm text-gray-600 mb-1">👥 Slots: {trek.slots}</p>
                <p className="text-sm text-gray-600 mb-1">📅 {trek.date}</p>
                {trek.gpxFileUrl && <p className="text-sm text-green-600 mb-1">🗺️ GPX Route Uploaded</p>}
                {trek.locationHistory && <p className="text-xs text-gray-500 mt-2 truncate">📜 {trek.locationHistory}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingTrek && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Edit Trek</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateTrek} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trek ID</label>
                  <input
                    type="text"
                    name="trekCustomId"
                    value={editingTrek.trekCustomId}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trek Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editingTrek.title}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editingTrek.location}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={editingTrek.duration}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    name="difficulty"
                    value={editingTrek.difficulty}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={editingTrek.category}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Fort">Fort</option>
                    <option value="Waterfall">Waterfall</option>
                    <option value="Caves">Caves</option>
                    <option value="Trails">Trails</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={editingTrek.country}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    name="state"
                    value={editingTrek.state}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select State</option>
                    {Object.keys(indianStatesDistricts).map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <select
                    name="district"
                    value={editingTrek.district}
                    onChange={handleEditInputChange}
                    required
                    disabled={!editingTrek.state}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select District</option>
                    {editingTrek.state && indianStatesDistricts[editingTrek.state]?.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location History</label>
                  <textarea
                    name="locationHistory"
                    value={editingTrek.locationHistory}
                    onChange={handleEditInputChange}
                    rows="2"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">What to See</label>
                  <textarea
                    name="whatToSee"
                    value={editingTrek.whatToSee}
                    onChange={handleEditInputChange}
                    rows="2"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">How to Reach</label>
                  <textarea
                    name="howToReach"
                    value={editingTrek.howToReach}
                    onChange={handleEditInputChange}
                    rows="2"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Things to Pack</label>
                  <textarea
                    name="thingsToPack"
                    value={editingTrek.thingsToPack}
                    onChange={handleEditInputChange}
                    rows="2"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Trek Image</label>
                  <input
                    type="file"
                    name="trekImage"
                    ref={editImageInputRef}
                    onChange={handleEditImageChange}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload horizontal/landscape image (will be compressed to 30KB)</p>
                  {editingTrek.tempImageUrl && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border">
                      <p className="text-sm font-medium text-gray-700 mb-2">New Image Preview</p>
                      <img src={editingTrek.tempImageUrl} alt="Preview" className="h-32 w-auto rounded border mx-auto" />
                    </div>
                  )}
                  {!editingTrek.tempImageUrl && editingTrek.imageUrl && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border">
                      <p className="text-sm font-medium text-gray-700 mb-2">Current Image</p>
                      <img src={editingTrek.imageUrl} alt="Current" className="h-32 w-auto rounded border mx-auto" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GPX File (GPS Route)</label>
                  <input
                    type="file"
                    name="gpxFile"
                    ref={editGpxInputRef}
                    onChange={handleEditGpxChange}
                    accept=".gpx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload .gpx file for GPS route tracking</p>
                  {editingTrek.tempGpxPreview && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border">
                      <p className="text-sm font-medium text-gray-700 mb-2">New GPX Route Preview</p>
                      <div className="h-[350px] rounded-lg overflow-hidden border">
                        <MapContainer 
                          key={editingTrek.tempGpxMapKey}
                          center={editingTrek.tempGpxPreview.coordinates[0]}
                          zoom={13}
                          style={{ height: '100%', width: '100%' }}
                        >
                          <ChangeView center={editingTrek.tempGpxPreview.coordinates[0]} zoom={13} />
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                          />
                          <Polyline 
                            positions={editingTrek.tempGpxPreview.coordinates}
                            color="#3B82F6"
                            weight={3}
                          />
                        </MapContainer>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{editingTrek.tempGpxPreview.pointCount} GPS Points</p>
                    </div>
                  )}
                  {!editingTrek.tempGpxPreview && editingTrek.gpxFileUrl && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border">
                      <p className="text-sm font-medium text-gray-700 mb-2">Current GPX File</p>
                      <p className="text-sm text-gray-600">{editingTrek.gpxFileUrl}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Update Trek
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
