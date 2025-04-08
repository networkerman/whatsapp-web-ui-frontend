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

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkConnection()
        setConnectionStatus(status.status)
        setStatusMessage(status.message || null)
        
        if (status.status === 'connected') {
          loadChats()
        } else if (status.status === 'waiting_for_qr') {
          try {
            const url = await getQRCode()
            setQRCodeUrl(url)
          } catch (err) {
            console.error('Error getting QR code:', err)
            setError('Failed to load QR code')
          }
        }
      } catch (error) {
        console.error('Error checking status:', error)
        setError('Failed to check connection status')
      }
    }

    const interval = setInterval(checkStatus, 5000)
    checkStatus() // Initial check

    return () => {
      clearInterval(interval)
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl)
      }
    }
  }, [])

  const loadChats = async () => {
    try {
      setLoading(true)
      const fetchedChats = await getChats()
      setChats(fetchedChats)
      setError(null)
    } catch (err) {
      console.error('Error loading chats:', err)
      setError('Failed to load chats')
    } finally {
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
          <div className="flex flex-col items-center justify-center p-4 bg-yellow-100 rounded-lg">
            <p className="text-yellow-800">Please scan the QR code to connect</p>
            {qrCodeUrl && (
              <img src={qrCodeUrl} alt="QR Code" className="mt-4 w-64 h-64" />
            )}
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
        if (chats.length === 0) {
          return (
            <div className="p-4 bg-blue-100 rounded-lg">
              <p className="text-blue-800">Connected! Loading your chats...</p>
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