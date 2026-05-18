import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getFeeds, deleteFeed } from '../lib/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { FeedCard } from '../components/FeedCard';
import { StatusIndicator } from '../components/StatusIndicator';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [feeds, setFeeds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('database');
  const [deletingId, setDeletingId] = useState(null);

  // Load initial feeds
  useEffect(() => {
    async function loadFeeds() {
      setIsLoading(true);
      const result = await getFeeds();
      if (result.success) {
        setFeeds(result.data);
        setSource(result.source);
        setError(null);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    }

    loadFeeds();
  }, []);

  // WebSocket handlers
  const handleFeedCreated = (newFeed) => {
    console.log('📥 Adding new feed:', newFeed.title);
    setFeeds((prevFeeds) => {
      // Check if feed already exists to prevent duplicates
      if (prevFeeds.some((f) => f.id === newFeed.id)) {
        console.log('🚫 Feed already exists, skipping duplicate');
        return prevFeeds;
      }
      return [newFeed, ...prevFeeds];
    });
  };

  const handleFeedDeleted = (feedId) => {
    console.log('📤 Removing feed:', feedId);
    setFeeds((prevFeeds) => prevFeeds.filter((f) => f.id !== feedId));
  };

  const handleClientsUpdated = (count) => {
    console.log('👥 Client count updated:', count);
  };

  // Initialize WebSocket connection
  const { isConnected, clientCount } = useWebSocket(
    handleFeedCreated,
    handleFeedDeleted,
    handleClientsUpdated
  );

  // Handle feed deletion
  const onDeleteFeed = async (feedId) => {
    if (confirm('Are you sure you want to delete this feed?')) {
      setDeletingId(feedId);
      const result = await deleteFeed(feedId);
      setDeletingId(null);

      if (result.success) {
        // Feed will be removed via WebSocket message
        console.log('✓ Feed deleted successfully');
      } else {
        setError(`Failed to delete: ${result.error}`);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Feed App - Real-time Updates</title>
        <meta name="description" content="Real-time feed application with WebSocket support" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>📡 Feed Hub</h1>
            <Link href="/admin" className={styles.adminLink}>
              Admin Panel →
            </Link>
          </div>

          <StatusIndicator isConnected={isConnected} clientCount={clientCount} source={source} />
        </header>

        {error && (
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading feeds...</p>
          </div>
        )}

        {!isLoading && feeds.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📭</div>
            <h2>No feeds yet</h2>
            <p>Go to the <Link href="/admin">Admin Panel</Link> to add your first feed</p>
          </div>
        ) : (
          <div className={styles.feedsGrid}>
            {feeds.map((feed) => (
              <FeedCard
                key={feed.id}
                feed={feed}
                onDelete={onDeleteFeed}
                isLoading={deletingId === feed.id}
              />
            ))}
          </div>
        )}

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <p>
              Real-time feed application 
              {/* | <span className={styles.badge}>WebSocket</span>{' '}
              <span className={styles.badge}>Redis Cache</span>{' '}
              <span className={styles.badge}>PostgreSQL</span> */}
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
