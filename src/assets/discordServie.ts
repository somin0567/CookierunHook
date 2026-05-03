import axios from 'axios';

interface DiscordEmbed {
  title: string;
  description: string;
  url?: string;
  color?: number;
  image?: { url: string };
}

interface WebhookPayload {
  content: string;
  embeds?: DiscordEmbed[];
}

export const sendDiscordNotification = async (payload: WebhookPayload): Promise<void> => {
  const WEBHOOK_URL: string = import.meta.env.VITE_DISCORD_WEBHOOK_URL;

  try {
    await axios.post(WEBHOOK_URL, payload);
    console.log('전송 성공');
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('전송 실패:', error.response?.data || error.message);
    } else {
      console.error('알 수 없는 에러:', error);
    }
  }
};