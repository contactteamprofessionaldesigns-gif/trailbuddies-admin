import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

// Initialize the clean GraphQL client for Amplify v6
const client = generateClient();

function App({ signOut, user }) {
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: 'Forts', difficulty: 'Easy' });

  // 1. Fetch data from DynamoDB safely on load
  async function fetchTreks() {
    try {
      setLoading(true);
      const query = `
        query ListTreks {
          listTreks {
            id
            trekCustomId
            title
            category
            difficulty
          }
        }
      `;
      const response = await client.graphql({ query });
      setTreks(response.data.listTreks || []);
    } catch (err) {
      console.error('Error fetching treks from AWS:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTreks();
  }, []);

  // 2. Add Trek Logic with string validations
  const handleAddTrek = async (e) => {
    e.preventDefault();
    if (!formData.title) return alert('Trek Title is compulsory!');
    
    const uniqueId = String(Date.now());
    const nextCustomId = `ST${treks.length + 1}`;

    try {
      const mutation = `
        mutation CreateTrek($input: TrekInput!) {
          createTrek(input: $input) {
            id
            trekCustomId
            title
            category
            difficulty
          }
        }
      `;
      
      const input = {
        id: uniqueId,
        trekCustomId: String(nextCustomId),
        title: String(formData.title),
        category: String(formData.category),
        difficulty: String(formData.difficulty)
      };

      await client.graphql({ query: mutation, variables: { input } });
      setFormData({ title: '', category: 'Forts', difficulty: 'Easy' });
      await fetchTreks();
    } catch (err) {
      console.error('Error saving trek to DynamoDB:', err);
      alert('Database error. Check your AppSync settings.');
    }
  };

  // 3. Delete Trek Logic wrapped inside Input Object
  const handleDeleteTrek = async (id) => {
    if (!window.confirm('Delete this trek permanently from AWS DynamoDB?')) return;
    try {
      const mutation = `
        mutation DeleteTrek($input: DeleteTrekInput!) {
          deleteTrek(input: $input) {
            id
          }
        }
      `;
      await client.graphql({ query: mutation, variables: { input: { id: String(id) } } });
      await fetchTreks();
    } catch (err) {
      console.error('Error deleting trek from DynamoDB:', err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#ff9900' }}>⛰️ TrailBuddies Admin Dashboard (AWS Secure Layer)</h1>
        <button onClick={signOut} style={{ padding: '8px 15px', background: '#333', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Sign Out</button>
      </div>
      <p>Welcome, <strong>{user?.username}</strong>! You have access to secure admin tools.</p>
      <hr />
      
      {/* Trek Insertion Form */}
      <form onSubmit={handleAddTrek} style={{ marginBottom: '30px', background: '#f4f4f4', padding: '15px', borderRadius: '5px' }}>
        <h3>Add New Hiker Route</h3>
        <input 
          type="text" 
          placeholder="Trek Title (e.g. Harishchandragad)" 
          value={formData.title} 
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          style={{ padding: '8px', marginRight: '10px', width: '250px' }}
        />
        <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ padding: '8px', marginRight: '10px' }}>
          <option value="Forts">Forts</option>
          <option value="Waterfalls">Waterfalls</option>
          <option value="Caves">Caves</option>
        </select>
        <select value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})} style={{ padding: '8px', marginRight: '10px' }}>
          <option value="Easy">Easy</option>
          <option value="Moderate">Moderate</option>
          <option value="Hard">Hard</option>
        </select>
        <button type="submit" style={{ padding: '8px 15px', background: '#ff9900', color: 'white', border: 'none', cursor: 'pointer' }}>Save to AWS</button>
      </form>

      {/* Trek Status Table */}
      <h2>Live Database Records (AWS DynamoDB Sync)</h2>
      {loading ? <p>Syncing with cloud layers...</p> : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#eee' }}>
              <th>ID</th>
              <th>Custom ID</th>
              <th>Trek Title</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {treks.map(trek => (
              <tr key={trek.id}>
                <td>{trek.id}</td>
                <td><strong>{trek.trekCustomId}</strong></td>
                <td>{trek.title}</td>
                <td>{trek.category}</td>
                <td>{trek.difficulty}</td>
                <td>
                  <button onClick={() => handleDeleteTrek(trek.id)} style={{ background: '#ff3333', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Delete Permanently</button>
                </td>
              </tr>
            ))}
            {treks.length === 0 && <tr><td colSpan="6">No records inside DynamoDB. Try adding one!</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Clean Export App wrapped with Authenticator to resolve React Error #130
export default function AppWithAuth() {
  return (
    <Authenticator>
      {({ signOut, user }) => <App signOut={signOut} user={user} />}
    </Authenticator>
  );
}
