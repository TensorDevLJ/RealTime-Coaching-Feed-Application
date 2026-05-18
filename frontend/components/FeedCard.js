import styles from './FeedCard.module.css';

export function FeedCard({ feed, onDelete, isLoading }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{feed.title}</h3>
          {feed.category && <span className={styles.category}>{feed.category}</span>}
        </div>
        <button
          className={styles.deleteBtn}
          onClick={() => onDelete(feed.id)}
          disabled={isLoading}
          title="Delete feed"
        >
          ✕
        </button>
      </div>

      {feed.image_url && (
        <div className={styles.image}>
          <img src={feed.image_url} alt={feed.title} />
        </div>
      )}

      {feed.description && <p className={styles.description}>{feed.description}</p>}

      <div className={styles.footer}>
        <a href={feed.url} target="_blank" rel="noopener noreferrer" className={styles.url}>
          {feed.source || feed.url}
        </a>
        <time className={styles.date}>{formatDate(feed.created_at)}</time>
      </div>
    </div>
  );
}

export default FeedCard;
