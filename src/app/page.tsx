'use client'

import React, { useEffect, useState } from 'react'
import { Chat, Message, getChats, getMessages, sendMessage } from '@/lib/api'

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadChats()
  }, [])

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id)
    }
  }, [selectedChat])

  async function loadChats() {
    try {
      setLoading(true)
      console.log('Loading chats...')
      const fetchedChats = await getChats()
      console.log('Fetched chats:', fetchedChats)
      setChats(fetchedChats)
    } catch (err) {
      console.error('Error loading chats:', err)
      setError(`Failed to load chats: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(chatId: string) {
    try {
      setLoading(true)
      console.log('Loading messages for chat:', chatId)
      const fetchedMessages = await getMessages(chatId)
      console.log('Fetched messages:', fetchedMessages)
      setMessages(fetchedMessages)
    } catch (err) {
      console.error('Error loading messages:', err)
      setError(`Failed to load messages: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedChat || !newMessage.trim()) return

    try {
      setLoading(true)
      console.log('Sending message:', newMessage)
      const message = await sendMessage(selectedChat.id, newMessage)
      console.log('Message sent:', message)
      setMessages(prev => [...prev, message])
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
      setError(`Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500 text-xl">{error}</div>
      </main>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/4 bg-white border-r">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Chats</h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-2">
              {chats.map(chat => (
                <div
                  key={chat.id}
                  className={`p-3 rounded-lg cursor-pointer ${
                    selectedChat?.id === chat.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="font-medium">{chat.name}</div>
                  {chat.lastMessage && (
                    <div className="text-sm text-gray-500 truncate">{chat.lastMessage}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">{selectedChat.name}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200'
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-lg"
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  )
} 