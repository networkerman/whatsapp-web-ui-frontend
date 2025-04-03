const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error('NEXT_PUBLIC_API_URL is not set');
}

export interface Chat {
  id: string;
  name: string;
  lastMessage?: string;
  timestamp: number;
}

export interface Message {
  id: string;
  content: string;
  timestamp: number;
  sender: 'user' | 'bot';
}

export async function getChats(): Promise<Chat[]> {
  console.log('Fetching chats from:', `${API_URL}/api/chats`);
  const response = await fetch(`${API_URL}/api/chats`);
  if (!response.ok) {
    console.error('Failed to fetch chats:', response.status, response.statusText);
    throw new Error(`Failed to fetch chats: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  console.log('Fetched chats:', data);
  return data;
}

export async function getMessages(chatId: string): Promise<Message[]> {
  console.log('Fetching messages from:', `${API_URL}/api/messages/${chatId}`);
  const response = await fetch(`${API_URL}/api/messages/${chatId}`);
  if (!response.ok) {
    console.error('Failed to fetch messages:', response.status, response.statusText);
    throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  console.log('Fetched messages:', data);
  return data;
}

export async function sendMessage(chatId: string, message: string): Promise<{ success: boolean; chatId: string; message: string }> {
  console.log('Sending message to:', `${API_URL}/api/messages/${chatId}`);
  const response = await fetch(`${API_URL}/api/messages/${chatId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: message }),
  });
  if (!response.ok) {
    console.error('Failed to send message:', response.status, response.statusText);
    throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  console.log('Message sent:', data);
  return data;
} 