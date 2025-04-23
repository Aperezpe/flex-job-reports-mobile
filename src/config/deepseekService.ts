import axios from 'axios';

const API_URL = 'https://deepseek-v3.p.rapidapi.com/chat';
const API_KEY = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;

console.log(`DeepSeek API Key: ${API_KEY ? 'Loaded' : 'Not Loaded'}`);

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface DeepseekResponse {
  messages: ChatMessage[];
}

export const callDeepseek = async (message: string): Promise<string> => {
  const data = {
    messages: [
      {
        role: 'user',
        content: message,
      },
    ],
  };

  const headers = {
    'x-rapidapi-key': API_KEY,
    'x-rapidapi-host': 'deepseek-v31.p.rapidapi.com',
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post<DeepseekResponse>(API_URL, data, { headers });
    return response.data.messages[0]?.content || 'No response';
  } catch (error) {
    console.error('DeepSeek error:', error);
    throw error;
  }
};