'use client'

import React, { useEffect, useState } from 'react'
import { Chat, Message, checkConnection, getChats, getMessages, sendMessage, getQRCode } from '@/lib/api'

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'waiting_for_qr'>('disconnected')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [qrCodeUrl, setQRCodeUrl] = useState<string | null>(null)
  const [qrCodeLoading, setQRCodeLoading] = useState(false)
  const [syncingChats, setSyncingChats] = useState(false)

  const checkStatus = async () => {
    try {
      const status = await checkConnection()
      const wasWaitingForQR = connectionStatus === 'waiting_for_qr'
      setConnectionStatus(status.status)
      setStatusMessage(status.message || null)
      
      if (status.status === 'connected') {
        // Clear QR code and load chats when connected
        if (qrCodeUrl) {
          URL.revokeObjectURL(qrCodeUrl)
          setQRCodeUrl(null)
        }
        loadChats()
      } else if (status.status === 'waiting_for_qr' && !qrCodeUrl && !qrCodeLoading && !wasWaitingForQR) {
        // Only fetch QR code if we don't have one and just entered waiting_for_qr state
        try {
          setQRCodeLoading(true)
          const url = await getQRCode()
          setQRCodeUrl(url)
          setError(null)
        } catch (err) {
          console.error('Error getting QR code:', err)
          setError('Failed to load QR code. Please refresh the page to try again.')
        } finally {
          setQRCodeLoading(false)
        }
      }
    } catch (error) {
      console.error('Error checking status:', error)
      setError('Failed to check connection status')
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    const startPolling = () => {
      // Poll every 5 seconds when disconnected or waiting for QR
      // Poll every 30 seconds when connected
      const pollInterval = connectionStatus === 'connected' ? 30000 : 5000;
      interval = setInterval(checkStatus, pollInterval);
    };

    // Initial check
    checkStatus();
    startPolling();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [connectionStatus]); // Restart polling when connection status changes

  const loadChats = async () => {
    try {
      setSyncingChats(true)
      const fetchedChats = await getChats()
      setChats(fetchedChats)
      setError(null)
    } catch (err) {
      console.error('Error loading chats:', err)
      setError('Failed to load chats')
    } finally {
      setSyncingChats(false)
      setLoading(false)
    }
  }

  const loadMessages = async (chatId: string) => {
    try {
      setLoading(true)
      const fetchedMessages = await getMessages(chatId)
      setMessages(fetchedMessages)
      setError(null)
    } catch (err) {
      console.error('Error loading messages:', err)
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId)
    loadMessages(chatId)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedChat || !newMessage.trim()) return

    try {
      const result = await sendMessage(selectedChat, newMessage)
      if (result.success) {
        setNewMessage('')
        loadMessages(selectedChat)
      } else {
        setError(result.message)
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message')
    }
  }

  const renderConnectionStatus = () => {
    switch (connectionStatus) {
      case 'waiting_for_qr':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
              <h1 className="text-2xl font-bold text-center mb-6">WhatsApp Bridge</h1>
              
              <div className="flex flex-col items-center space-y-4">
                <div className="relative p-6 bg-white rounded-xl shadow-lg max-w-md mx-auto mt-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Scan QR Code with WhatsApp</h3>
                <div className="relative">
                  <img 
                    src={qrCodeUrl || undefined} 
                    alt="QR Code" 
                    className="w-64 h-64 border-2 border-blue-400 rounded-lg shadow-md mx-auto"
                    onError={(e) => {
                      console.error('Error loading QR code image');
                      setError('Failed to load QR code image. Please refresh to try again.');
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('QR code image loaded successfully');
                      setError(null);
                    }}
                  />
                  
                  {/* Prominently positioned refresh button */}
                  <button
                    onClick={() => {
                      setQRCodeUrl(null);
                      setError(null);
                      checkStatus();
                    }}
                    className="absolute bottom-2 right-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 hover:scale-105 transition-all duration-200 flex items-center space-x-1"
                    aria-label="Refresh QR Code"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    <span>Refresh QR</span>
                  </button>
                </div>
                <p className="text-gray-600 text-sm mt-4 text-center">
                  Open WhatsApp on your phone &gt; Settings &gt; Linked Devices &gt; Link a Device
                </p>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Scan this QR code with WhatsApp on your phone
                </p>
              </div>
            </div>
          </div>
        )
      case 'disconnected':
        return (
          <div className="p-4 bg-red-100 rounded-lg">
            <p className="text-red-800">
              {statusMessage || 'WhatsApp is disconnected. Please wait while we try to reconnect...'}
            </p>
          </div>
        )
      case 'connected':
        if (syncingChats) {
          return (
            <div className="p-4 bg-blue-100 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800"></div>
                <p className="text-blue-800">Connected! Syncing your chats...</p>
              </div>
              <p className="text-sm text-blue-600 mt-2">This might take a few moments depending on your chat history.</p>
            </div>
          )
        }
        if (chats.length === 0) {
          return (
            <div className="p-4 bg-blue-100 rounded-lg">
              <p className="text-blue-800">No chats found. Start a conversation to see it here!</p>
            </div>
          )
        }
        return null
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-2xl font-bold mb-4">WhatsApp Web Interface</h1>
        
        {error && (
          <div className="p-4 mb-4 bg-red-100 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {renderConnectionStatus()}

        {connectionStatus === 'connected' && (
          <div className="flex gap-4">
            <div className="w-1/3">
              <h2 className="text-xl font-semibold mb-2">Chats</h2>
              <div className="border rounded-lg">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleChatSelect(chat.id)}
                    className={`w-full p-2 text-left hover:bg-gray-100 ${
                      selectedChat === chat.id ? 'bg-gray-200' : ''
                    }`}
                  >
                    <p className="font-medium">{chat.name}</p>
                    {chat.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-2/3">
              <h2 className="text-xl font-semibold mb-2">Messages</h2>
              <div className="border rounded-lg p-4 h-[500px] flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-2 p-2 rounded-lg ${
                        message.sender === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border rounded"
                  />
                  <button
                    type="submit"
                    disabled={!selectedChat || !newMessage.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
} 