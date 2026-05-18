import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { createFeed } from '../lib/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { StatusIndicator } from '../components/StatusIndicator';
import styles from '../styles/Admin.module.css';

export default function Admin() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    source: '',
    category: '',
    image_url: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [feedCount, setFeedCount] = useState(0);

  // Initialize WebSocket
  const { isConnected } = useWebSocket(
    (newFeed) => {
      setFeedCount((prev) => prev + 1);
    },
    null,
    null
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Show notification
  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 4000);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      showMessage('Title is required', 'error');
      return;
    }

    if (!formData.url.trim()) {
      showMessage('URL is required', 'error');
      return;
    }

    // Validate URL format
    try {
      new URL(formData.url);
    } catch {
      showMessage('Please enter a valid URL', 'error');
      return;
    }

    setIsLoading(true);
    const result = await createFeed(formData);
    setIsLoading(false);

    if (result.success) {
      showMessage('✓ Feed created successfully!', 'success');
      setFormData({
        title: '',
        description: '',
        url: '',
        source: '',
        category: '',
        image_url: '',
      });
      setFeedCount((prev) => prev + 1);
    } else {
      showMessage(
        result.error || 'Failed to create feed',
        'error'
      );
    }
  };

  return (
    <>
      <Head>
        <title>Admin Panel - Feed App</title>
        <meta name="description" content="Create new feeds" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>⚙️ Admin Panel</h1>
            <Link href="/" className={styles.backLink}>
              ← Back to Feeds
            </Link>
          </div>

          <StatusIndicator isConnected={isConnected} />
        </header>

        <div className={styles.content}>
          {/* Statistics Card */}
          <div className={styles.statsCard}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Feeds Created</span>
              <span className={styles.statValue}>{feedCount}</span>
            </div>
          </div>

          {/* Form Card */}
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Create New Feed</h2>

            {message && (
              <div className={`${styles.message} ${styles[messageType]}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Title */}
              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>
                  Title <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter feed title"
                  disabled={isLoading}
                  className={styles.input}
                />
              </div>

              {/* URL */}
              <div className={styles.formGroup}>
                <label htmlFor="url" className={styles.label}>
                  URL <span className={styles.required}>*</span>
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/feed"
                  disabled={isLoading}
                  className={styles.input}
                />
              </div>

              {/* Description */}
              <div className={styles.formGroup}>
                <label htmlFor="description" className={styles.label}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter feed description"
                  disabled={isLoading}
                  className={styles.textarea}
                  rows="3"
                />
              </div>

              {/* Two Column Row */}
              <div className={styles.formRow}>
                {/* Source */}
                <div className={styles.formGroup}>
                  <label htmlFor="source" className={styles.label}>
                    Source
                  </label>
                  <input
                    type="text"
                    id="source"
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    placeholder="e.g., TechCrunch"
                    disabled={isLoading}
                    className={styles.input}
                  />
                </div>

                {/* Category */}
                <div className={styles.formGroup}>
                  <label htmlFor="category" className={styles.label}>
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={styles.input}
                  >
                    <option value="">Select category</option>
                    <option value="Technology">Technology</option>
                    <option value="Business">Business</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Science">Science</option>
                    <option value="Health">Health</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div className={styles.formGroup}>
                <label htmlFor="image_url" className={styles.label}>
                  Image URL
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  disabled={isLoading}
                  className={styles.input}
                />
              </div>

              {/* Preview */}
              {formData.image_url && (
                <div className={styles.imagePreview}>
                  <img src={formData.image_url} alt="Preview" />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={styles.submitBtn}
              >
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Creating...
                  </>
                ) : (
                  '✓ Create Feed'
                )}
              </button>
            </form>
          </div>

          {/* Info Card */}
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>📋 Field Information</h3>
            <ul className={styles.infoList}>
              <li>
                <strong>Title:</strong> The name of your feed (required)
              </li>
              <li>
                <strong>URL:</strong> A unique link to the feed resource (required)
              </li>
              <li>
                <strong>Description:</strong> Additional details about the feed
              </li>
              <li>
                <strong>Source:</strong> Where the feed comes from (publication name)
              </li>
              <li>
                <strong>Category:</strong> Classify the feed for organization
              </li>
              <li>
                <strong>Image URL:</strong> Display image for the feed
              </li>
            </ul>
          </div>
        </div>

        <footer className={styles.footer}>
          <p>Real-time feed creation with instant updates via WebSocket</p>
        </footer>
      </main>
    </>
  );
}
