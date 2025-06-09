import axios from 'axios';
import { BASE_URL } from '@/config/serverApiConfig';

const checkFile = async (path) => {
  try {
    const response = await axios.head(path, {
      headers: {
        'Access-Control-Allow-Origin': BASE_URL
      }
    });

    return response.status === 200;
  } catch {
    return false;
  }
};

export default checkFile;