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
  sender: string;
}

export interface ConnectionStatus {
  status: 'connected' | 'disconnected' | 'waiting_for_qr';
  message?: string;
}

export async function checkConnection(): Promise<ConnectionStatus> {
  try {
    const response = await fetch(`${API_URL}/api/status`);
    if (!response.ok) {
      throw new Error(`Failed to check connection: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error checking connection:', error);
    return {
      status: 'disconnected',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getChats(): Promise<Chat[]> {
  console.log('Fetching chats from:', `${API_URL}/api/chats`);
  try {
    const response = await fetch(`${API_URL}/api/chats`);
    if (!response.ok) {
      throw new Error(`Failed to fetch chats: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Raw response:', data);
    console.log('Response type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    if (!Array.isArray(data)) {
      console.error('Expected array but got:', data);
      return [];
    }
    return data;
  } catch (error) {
    console.error('Error fetching chats:', error);
    return [];
  }
}

export async function getMessages(chatId: string): Promise<Message[]> {
  console.log('Fetching messages from:', `${API_URL}/api/messages/${chatId}`);
  try {
    const response = await fetch(`${API_URL}/api/messages/${chatId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Fetched messages:', data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export async function sendMessage(chatId: string, message: string): Promise<{ success: boolean; message: string }> {
  console.log('Sending message to:', `${API_URL}/api/messages/${chatId}`);
  try {
    const response = await fetch(`${API_URL}/api/messages/${chatId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: message }),
    });
    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Message sent:', data);
    return {
      success: true,
      message: data.message || message
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getQRCode(): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/qr`);
    if (!response.ok) {
      throw new Error(`Failed to get QR code: ${response.status} ${response.statusText}`);
    }
    // Convert the image to a data URL
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error getting QR code:', error);
    throw error;
  }
} 