import axios from 'axios';
import { useEffect, useState } from 'react';

export default function TravelPage() {
  const [allTrips, setAllTrips] = useState([]);
  const [trips, setTrips] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/trips')
      .then(res => {
        setAllTrips(res.data);
        setTrips(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load trips');
        setLoading(false);
      });
  }, []);

  const handleSearch = () => {
    const q = query.trim();
    if (!q) {
      // empty query: show all trips
      setTrips(allTrips);
      return;
    }
    setLoading(true);
    setError('');
    axios.get(`/api/trips/search?q=${encodeURIComponent(q)}`)
      .then(res => {
        setTrips(res.data);
        if (res.data.length === 0) {
          setError(`No trips found matching “${q}”.`);
        }
      })
      .catch(err => {
        console.error(err);
        setError('Search failed. Please try again.');
      })
      .finally(() => setLoading(false));
  };
  if (loading) return <p>Loading trips…</p>;
  if (error)   return <p>{error}</p>;

  return (
    <div className="trips-container">
      <h2>Available Trips</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search trips by name…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      
      <div className="trip-list">
        {trips.map(trip => (
          <div key={trip.code} className="trip-card">
            <img
              src={`/images/${trip.image}`}
              alt={trip.name}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            <h3>{trip.name}</h3>
            <p><strong>{trip.length}</strong></p>
            <p>Start: {new Date(trip.start).toLocaleDateString()}</p>
            <p>Resort: {trip.resort}</p>
            <p><strong>${parseFloat(trip.perPerson).toFixed(2)}</strong> per person</p>
            <div
              className="trip-description"
              dangerouslySetInnerHTML={{ __html: trip.description }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
