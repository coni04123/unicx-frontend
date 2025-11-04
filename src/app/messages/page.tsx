'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import {
  MagnifyingGlassIcon,
  PlayIcon,
  PauseIcon,
  StarIcon,
  EllipsisHorizontalIcon,
  Squares2X2Icon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import AuthenticatedImage from '@/components/common/AuthenticatedImage';
import AuthenticatedVideo from '@/components/common/AuthenticatedVideo';
import AuthenticatedAudio from '@/components/common/AuthenticatedAudio';
import { Message, MessageType, MessageDirection } from '@/types/messages';

interface Conversation {
  conversationId: string;
  displayName: string;
  displayPhone?: string;
  avatarUrl?: string;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageType: string;
  unreadCount: number;
  isGroupMessage: boolean;
  isExternal: boolean;
  fromPhoneNumber?: string;
  toPhoneNumber?: string;
  whatsappUsername?: string;
  whatsappGroupName?: string;
}

interface Contact {
  phoneNumber: string;
  displayName: string;
  avatarUrl?: string;
  whatsappUsername?: string;
  isOnline?: boolean;
  unreadCount?: number;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [conversationSearchQuery, setConversationSearchQuery] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [expandedTranscripts, setExpandedTranscripts] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    loadConversations();
    loadContacts();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.conversationId);
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const data = await api.getWhatsAppConversations();
      setConversations(data);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadContacts = async () => {
    try {
      const data = await api.getWhatsAppConversations();
      const contactMap = new Map<string, Contact>();

      data.forEach((conv: Conversation) => {
        if (conv.displayPhone) {
          const phone = conv.displayPhone;
          if (!contactMap.has(phone)) {
            contactMap.set(phone, {
              phoneNumber: phone,
              displayName: conv.displayName,
              avatarUrl: conv.avatarUrl,
              whatsappUsername: conv.whatsappUsername,
              isOnline: false,
              unreadCount: conv.unreadCount,
            });
          } else {
            // Update unread count if higher
            const existing = contactMap.get(phone)!;
            if (conv.unreadCount > (existing.unreadCount || 0)) {
              existing.unreadCount = conv.unreadCount;
            }
          }
        }
      });

      setContacts(Array.from(contactMap.values()));
    } catch (error: any) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoadingMessages(true);
      const data = await api.getConversationMessages(conversationId, {
        page: 1,
        limit: 100,
      });
      setMessages(data.messages.sort((a: Message, b: Message) => 
        new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      ));
    } catch (error: any) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (phone: string) => {
    // Format as (XX) XXXXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    }
    return phone;
  };

  const formatLastMessage = (message: string, maxLength: number = 40) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 65%, 50%)`;
  };

  const handleAudioPlay = (messageId: string) => {
    const audio = audioRefs.current.get(messageId);
    if (!audio) return;

    if (playingAudioId === messageId) {
      audio.pause();
      setPlayingAudioId(null);
    } else {
      audioRefs.current.forEach((a, id) => {
        if (id !== messageId) a.pause();
      });
      audio.play();
      setPlayingAudioId(messageId);
    }
  };

  const toggleTranscript = (messageId: string) => {
    const newSet = new Set(expandedTranscripts);
    if (newSet.has(messageId)) {
      newSet.delete(messageId);
    } else {
      newSet.add(messageId);
    }
    setExpandedTranscripts(newSet);
  };

  const filteredContacts = contacts.filter(contact => {
    if (!contactSearchQuery) return true;
    const query = contactSearchQuery.toLowerCase();
    return (
      contact.displayName.toLowerCase().includes(query) ||
      contact.phoneNumber.toLowerCase().includes(query)
    );
  });

  const filteredConversations = conversations.filter(conv => {
    if (!conversationSearchQuery) return true;
    const query = conversationSearchQuery.toLowerCase();
    return (
      conv.displayName.toLowerCase().includes(query) ||
      conv.displayPhone?.toLowerCase().includes(query) ||
      conv.lastMessage.toLowerCase().includes(query)
    );
  });

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-80px)] bg-white overflow-hidden">
        {/* Left Column - Contacts */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
          {/* Header */}
          {/* <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Mensagens</h1>
          </div> */}

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar contatos"
                value={contactSearchQuery}
                onChange={(e) => setContactSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Carregando...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Nenhum contato
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedContact?.phoneNumber === contact.phoneNumber;
                const unreadCount = contact.unreadCount || 0;

                return (
                  <div
                    key={contact.phoneNumber}
                    onClick={() => {
                      setSelectedContact(contact);
                      const conv = conversations.find(c => c.displayPhone === contact.phoneNumber);
                      if (conv) setSelectedConversation(conv);
                    }}
                    className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        {contact.avatarUrl ? (
                          <img
                            src={contact.avatarUrl}
                            alt={contact.displayName}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-sm ${
                            contact.avatarUrl ? 'hidden' : ''
                          }`}
                          style={{ backgroundColor: getAvatarColor(contact.displayName) }}
                        >
                          {getInitials(contact.displayName)}
                        </div>
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                            {unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{contact.displayName}</h3>
                        <p className="text-xs text-gray-500 truncate">{formatPhoneNumber(contact.phoneNumber)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Middle Column - Conversations */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar conversas"
                value={conversationSearchQuery}
                onChange={(e) => setConversationSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Carregando...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Nenhuma conversa
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConversation?.conversationId === conv.conversationId;
                const lastMessageTime = formatTime(conv.lastMessageAt);

                return (
                  <div
                    key={conv.conversationId}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        {conv.avatarUrl ? (
                          <img
                            src={conv.avatarUrl}
                            alt={conv.displayName}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-sm ${
                            conv.avatarUrl ? 'hidden' : ''
                          }`}
                          style={{ backgroundColor: getAvatarColor(conv.displayName) }}
                        >
                          {getInitials(conv.displayName)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{conv.displayName}</h3>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{lastMessageTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600 truncate flex-1">{formatLastMessage(conv.lastMessage)}</p>
                          {conv.unreadCount === 0 && (
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column - Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  {selectedConversation.avatarUrl ? (
                    <img
                      src={selectedConversation.avatarUrl}
                      alt={selectedConversation.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${
                      selectedConversation.avatarUrl ? 'hidden' : ''
                    }`}
                    style={{ backgroundColor: getAvatarColor(selectedConversation.displayName) }}
                  >
                    {getInitials(selectedConversation.displayName)}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 text-base">{selectedConversation.displayName}</h2>
                    <p className="text-xs text-gray-500">{formatPhoneNumber(selectedConversation.displayPhone || '')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <StarIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <EllipsisHorizontalIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Carregando mensagens...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Nenhuma mensagem
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOutbound = message.direction === MessageDirection.OUTBOUND;
                    const isAudio = message.type === MessageType.AUDIO;
                    const isPlaying = playingAudioId === message._id;

                    return (
                      <div
                        key={message._id}
                        className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} items-end gap-2`}
                      >
                        {!isAudio && (
                          <div
                            className={`max-w-xs rounded-lg px-4 py-2 ${
                              isOutbound
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            {message.type === MessageType.TEXT && (
                              <p className="text-sm break-words">{message.content}</p>
                            )}
                            {message.type === MessageType.IMAGE && message.mediaUrl && (
                              <AuthenticatedImage src={message.mediaUrl} alt="message" className="max-w-xs rounded" />
                            )}
                            {message.type === MessageType.VIDEO && message.mediaUrl && (
                              <AuthenticatedVideo src={message.mediaUrl} className="max-w-xs rounded" />
                            )}
                            <p className={`text-xs mt-1 ${isOutbound ? 'text-green-100' : 'text-gray-500'}`}>
                              {formatTime(message.sentAt)}
                            </p>
                          </div>
                        )}
                        {isAudio && (
                          <>
                            <div className="max-w-xs rounded-lg px-3 py-2 bg-gray-700 flex items-center gap-3">
                              <button
                                onClick={() => handleAudioPlay(message._id)}
                                className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors flex-shrink-0"
                              >
                                {isPlaying ? (
                                  <PauseIcon className="w-5 h-5 text-white" />
                                ) : (
                                  <PlayIcon className="w-5 h-5 text-white ml-0.5" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="h-1 rounded-full overflow-hidden bg-gray-600">
                                  <div className="h-full bg-green-600" style={{ width: '25%' }}></div>
                                </div>
                                <p className="text-xs mt-1 text-white">0:10</p>
                              </div>
                              <p className="text-xs text-white flex-shrink-0">{formatTime(message.sentAt)}</p>
                              <audio
                                ref={(el) => {
                                  if (el) audioRefs.current.set(message._id, el);
                                }}
                                src={message.mediaUrl || undefined}
                                onEnded={() => setPlayingAudioId(null)}
                                onPause={() => setPlayingAudioId(null)}
                              />
                            </div>
                            {message.metadata?.caption && (
                              <div className={`max-w-xs ${isOutbound ? 'ml-auto' : ''} mt-2`}>
                                <button
                                  onClick={() => toggleTranscript(message._id)}
                                  className="text-xs text-blue-600 underline hover:no-underline"
                                >
                                  {expandedTranscripts.has(message._id) ? '−' : '+'} Transcrição
                                </button>
                                {expandedTranscripts.has(message._id) && (
                                  <p className="text-sm mt-1 text-gray-700 bg-white p-2 rounded border border-gray-200">
                                    {message.metadata.caption}
                                  </p>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
              <p>Selecione uma conversa para visualizar mensagens</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
