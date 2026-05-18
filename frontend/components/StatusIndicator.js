import styles from './StatusIndicator.module.css';

export function StatusIndicator({ isConnected, clientCount, source }) {
  return (
    <div className={styles.indicator}>
      <div className={styles.status}>
        <div className={`${styles.dot} ${isConnected ? styles.connected : styles.disconnected}`}></div>
        <span className={styles.text}>
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>

      {isConnected && clientCount !== undefined && (
        <div className={styles.clients}>
          <span className={styles.icon}>👥</span>
          <span className={styles.count}>{clientCount}</span>
        </div>
      )}

      {source && (
        <div className={styles.source}>
          <span className={styles.label}>{source === 'cache' ? '💾' : '🔍'} {source}</span>
        </div>
      )}
    </div>
  );
}

export default StatusIndicator;
