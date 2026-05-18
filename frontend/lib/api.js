import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get all feeds with optional caching indication
 */
export async function getFeeds() {
  try {
    const response = await apiClient.get('/feed');
    return {
      success: true,
      data: response.data.data,
      source: response.data.source,
      timestamp: response.data.timestamp,
    };
  } catch (error) {
    console.error('❌ Failed to fetch feeds:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      data: [],
    };
  }
}

/**
 * Create a new feed
 */
export async function createFeed(feedData) {
  try {
    const response = await apiClient.post('/feed', {
      title: feedData.title,
      description: feedData.description,
      url: feedData.url,
      source: feedData.source,
      category: feedData.category,
      image_url: feedData.image_url,
    });

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error('❌ Failed to create feed:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      details: error.response?.data,
    };
  }
}

/**
 * Delete a feed
 */
export async function deleteFeed(feedId) {
  try {
    const response = await apiClient.delete(`/feed/${feedId}`);
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error('❌ Failed to delete feed:', error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Get health status
 */
export async function getHealth() {
  try {
    const response = await apiClient.get('/health');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

export default apiClient;
