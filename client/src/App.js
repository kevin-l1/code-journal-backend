import { useState, useEffect } from 'react';
import EntryForm from './EntryForm';
import EntryList from './EntryList';
import { NavBar } from './NavBar';
import './App.css';

export default function App() {
  /* What is being currently edited:
   * undefined - nothing, display entries
   * null - creating a new entry
   * defined - the entry being edited
   */
  const [editing, setEditing] = useState();
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    async function fetchEntries() {
      try {
        const res = await fetch('./api/entries');
        if (!res.ok) throw new Error(`fetch error ${res.status}`);
        const entries = await res.json();
        setEntries(entries);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEntries();
  }, []);

  async function addEntry(newEntry) {
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      });
      const result = await response.json();
      console.log(result);
      const array = [result].concat(entries);
      setEntries(array);
      setEditing(undefined);
    } catch (error) {
      console.error(error);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error('Fetch error:', error);
    return (
      <div>
        Error! {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }
  return (
    <>
      <NavBar onEntries={() => setEditing(undefined)} />
      {editing !== undefined && (
        <EntryForm entry={editing} onSubmit={addEntry} />
      )}
      {editing === undefined && (
        <EntryList
          entries={entries}
          onCreate={() => setEditing(null)}
          onEdit={(entry) => setEditing(entry)}
        />
      )}
    </>
  );
}
