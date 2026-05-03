import axios from 'axios';

export interface DiscordEmbed {
  title: string;
  url?: string;
  color?: number;
	timestamp?: string; 
  image?: { url: string };
  footer?: { text: string; icon_url?: string };
}

export interface WebhookPayload {
  content: string;
  embeds?: DiscordEmbed[];
}

export const sendDiscordNotification = async (payload: WebhookPayload): Promise<void> => {
  const WEBHOOK_URL: string = 
    (import.meta.env?.VITE_DISCORD_WEBHOOK_URL) || (process.env.VITE_DISCORD_WEBHOOK_URL as string);

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