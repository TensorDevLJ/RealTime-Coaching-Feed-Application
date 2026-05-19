import styles from './FeedCard.module.css';

export function FeedCard({
  feed,
  onDelete,
  isLoading
}) {

  // Safe date formatting
  const formatDate = (dateString) => {

    if (!dateString)
      return "Just now";

    const date =
      new Date(dateString);

    if (
      isNaN(date.getTime())
    ) {
      return "Just now";
    }

    return date
    .toLocaleDateString(
      'en-US',
      {
        month:'short',
        day:'numeric',
        year:'numeric'
      }
    );

  };


  return (

    <div className={styles.card}>

      <div className={styles.header}>

        <div
        className={
        styles.titleSection
        }>

          <h3
          className={
          styles.title
          }>
            {feed.title}
          </h3>

          {feed.category && (

            <span
            className={
            styles.category
            }>
              {feed.category}
            </span>

          )}

        </div>


        <button
          className={
          styles.deleteBtn
          }

          onClick={()=>
          onDelete(
          feed._id
          )}

          disabled={
          isLoading
          }

          title=
          "Delete feed"
        >

          {isLoading
          ? "..."
          : "✕"}

        </button>

      </div>


      <div
      className={
      styles.image
      }>

        <img

          src={
          feed.image_url ||

          "https://picsum.photos/400/250"
          }

          alt={
          feed.title
          }

          onError={
          (e)=>{

          e.target.src=
          "https://picsum.photos/400/250";

          }

          }

        />

      </div>


      {feed.description && (

        <p
        className={
        styles.description
        }>
          {feed.description}
        </p>

      )}


      <div
      className={
      styles.footer
      }>

        <a
          href={feed.url}

          target="_blank"

          rel=
          "noopener noreferrer"

          className={
          styles.url
          }
        >

          {feed.source
          ||
          feed.url}

        </a>


        <time
        className={
        styles.date
        }>

        {
        formatDate(
        feed.createdAt
        )
        }

        </time>

      </div>

    </div>

  );

}

export default FeedCard;