import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import * as fs from 'fs';
import * as path from 'path';
import { sendDiscordNotification } from '../services/discordService';

interface YouTubeEntry {
  title: string[];
  link: Array<{ $: { href: string } }>;
  'yt:videoId'?: string[];
  published: string[];
}

interface YouTubeFeed {
  feed: {
    title: string[];
    entry?: YouTubeEntry[];
  };
}

async function monitorYouTube(): Promise<void> {
  const CHANNEL_ID: string = 'UCr-Eaw_CBpAqKHbzV_GidQQ'; 
  const RSS_URL: string = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

  const ID_FILE_PATH: string = path.join(import.meta.dirname, 'last_id.txt');

  try {
    const response = await axios.get<string>(RSS_URL);
    
    const result = await (parseStringPromise(response.data) as Promise<YouTubeFeed>);
    const feed = result.feed;
    const channelName: string = feed.title[0];
    const entries = feed.entry || [];

    if (entries.length === 0) return;

    const latestEntry = entries[0];
    const videoId: string | undefined = latestEntry['yt:videoId']?.[0];
    const title: string = latestEntry.title[0];
    const link: string = latestEntry.link[0].$.href;
    const published: string = latestEntry.published[0];

    // 중복 체크
    let lastId: string = '';
    if (fs.existsSync(ID_FILE_PATH)) {
      lastId = fs.readFileSync(ID_FILE_PATH, 'utf-8').trim();
    }

    if ((videoId || link) === lastId) {
      console.log('✨ No new updates found.');
      return;
    }

    // 카드
    const isVideo: boolean = !!videoId;
    const thumbnailUrl: string = isVideo 
      ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` 
      : "";

    await sendDiscordNotification({
      content: isVideo 
        ? `**New Video from ${channelName}!**\n${link}` 
        : `**New Post from ${channelName}!**\n${link}`,
      embeds: [{
        title: title,
        url: link,
        color: 14390859,
        ...(isVideo && { image: { url: thumbnailUrl } }),
        timestamp: published,
      }]
    });

    fs.writeFileSync(ID_FILE_PATH, videoId || link, 'utf-8');
    console.log(`✅ Successfully notified: ${title}`);

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.message);
    } else {
      console.error('Unexpected Error:', error);
    }
  }
}

monitorYouTube();