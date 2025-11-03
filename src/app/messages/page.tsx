'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import {
  MagnifyingGlassIcon,
  StarIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import AuthenticatedImage from '@/components/common/AuthenticatedImage';
import AuthenticatedVideo from '@/components/common/AuthenticatedVideo';
import AuthenticatedAudio from '@/components/common/AuthenticatedAudio';
import { Message, MessageType, MessageDirection } from '@/types/messages';

interface Contact {
  phoneNumber: string;
  displayName: string;
  avatarUrl?: string;
  lastMessageAt: string;
  unreadCount: number;
  isExternal?: boolean;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [fromContacts, setFromContacts] = useState<Contact[]>([]);
  const [allToContacts, setAllToContacts] = useState<Contact[]>([]);
  const [filteredToContacts, setFilteredToContacts] = useState<Contact[]>([]);
  const [selectedFromContact, setSelectedFromContact] = useState<Contact | null>(null);
  const [selectedToContact, setSelectedToContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [fromSearchQuery, setFromSearchQuery] = useState('');
  const [toSearchQuery, setToSearchQuery] = useState('');
  const [conversationMap, setConversationMap] = useState<Map<string, Set<string>>>(new Map());
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [expandedTranscripts, setExpandedTranscripts] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (selectedFromContact) {
      // Filter TO contacts to show only those that have conversations with selected FROM contact
      const conversationsWithFrom = conversationMap.get(selectedFromContact.phoneNumber) || new Set();
      const filtered = allToContacts.filter(contact => 
        conversationsWithFrom.has(contact.phoneNumber)
      );
      setFilteredToContacts(filtered);
      // Reset selected TO contact if it's not in the filtered list
      if (selectedToContact && !filtered.find(c => c.phoneNumber === selectedToContact?.phoneNumber)) {
        setSelectedToContact(null);
        setMessages([]);
      }
    } else {
      setFilteredToContacts([]);
      setSelectedToContact(null);
      setMessages([]);
    }
  }, [selectedFromContact, allToContacts, conversationMap]);

  useEffect(() => {
    if (selectedFromContact && selectedToContact) {
      loadMessages(selectedFromContact.phoneNumber, selectedToContact.phoneNumber);
    } else {
      setMessages([]);
    }
  }, [selectedFromContact, selectedToContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadContacts = async () => {
    try {
      setIsLoadingContacts(true);
      // Load all messages to extract unique contacts
      const data = await api.getWhatsAppMessages({ page: 1, limit: 1000 });
      
      // Group by fromPhoneNumber
      const fromMap = new Map<string, Contact>();
      // Group by toPhoneNumber
      const toMap = new Map<string, Contact>();
      // Map to track which contacts have conversations with each other
      const convMap = new Map<string, Set<string>>();

      data.messages.forEach((msg: Message) => {
        // Process FROM contacts
        const fromPhone = msg.fromPhoneNumber || msg.from;
        const toPhone = msg.toPhoneNumber || msg.to;
        
        if (fromPhone) {
          const existing = fromMap.get(fromPhone) || {
            phoneNumber: fromPhone,
            displayName: msg.externalSenderName || msg.metadata?.senderContactName || msg.whatsappUsername || fromPhone,
            avatarUrl: msg.whatsappAvatarUrl,
            lastMessageAt: msg.sentAt,
            unreadCount: 0,
            isExternal: msg.isExternalNumber || false,
          };
          
          if (new Date(msg.sentAt) > new Date(existing.lastMessageAt)) {
            existing.lastMessageAt = msg.sentAt;
          }
          
          fromMap.set(fromPhone, existing);
        }

        // Process TO contacts
        if (toPhone) {
          const existing = toMap.get(toPhone) || {
            phoneNumber: toPhone,
            displayName: msg.metadata?.senderContactName || msg.whatsappUsername || toPhone,
            avatarUrl: msg.whatsappAvatarUrl,
            lastMessageAt: msg.sentAt,
            unreadCount: 0,
            isExternal: msg.isExternalNumber || false,
          };
          
          if (new Date(msg.sentAt) > new Date(existing.lastMessageAt)) {
            existing.lastMessageAt = msg.sentAt;
          }
          
          toMap.set(toPhone, existing);
        }

        // Track conversations between FROM and TO contacts
        if (fromPhone && toPhone) {
          if (!convMap.has(fromPhone)) {
            convMap.set(fromPhone, new Set());
          }
          convMap.get(fromPhone)!.add(toPhone);
        }
      });

      // Convert maps to arrays and sort by lastMessageAt
      const fromContactsArray = Array.from(fromMap.values()).sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      const toContactsArray = Array.from(toMap.values()).sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );

      setFromContacts(fromContactsArray);
      setAllToContacts(toContactsArray);
      setConversationMap(convMap);
    } catch (error: any) {
      console.error('Error loading contacts:', error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const loadMessages = async (fromPhone: string, toPhone: string) => {
    try {
      setIsLoadingMessages(true);
      // Load messages where fromPhoneNumber matches fromPhone and toPhoneNumber matches toPhone
      // OR vice versa (bidirectional conversation)
      const data = await api.getWhatsAppMessages({ 
        page: 1, 
        limit: 1000,
        from: fromPhone,
        to: toPhone,
      });
      
      // Also get reverse direction messages
      const reverseData = await api.getWhatsAppMessages({ 
        page: 1, 
        limit: 1000,
        from: toPhone,
        to: fromPhone,
      });

      // Combine and sort by timestamp
      const allMessages = [...data.messages, ...reverseData.messages].sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      );

      setMessages(allMessages);
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
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate consistent color based on phone number
  const getAvatarColor = (phoneNumber: string) => {
    // Simple hash function to generate consistent color
    let hash = 0;
    for (let i = 0; i < phoneNumber.length; i++) {
      hash = phoneNumber.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Generate color in HSL format for better consistency
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
      // Pause all other audios
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

  const filteredFromContacts = fromContacts.filter(contact => {
    if (!fromSearchQuery) return true;
    const query = fromSearchQuery.toLowerCase();
    return (
      contact.displayName.toLowerCase().includes(query) ||
      contact.phoneNumber.toLowerCase().includes(query)
    );
  });

  const filteredToContactsSearch = filteredToContacts.filter(contact => {
    if (!toSearchQuery) return true;
    const query = toSearchQuery.toLowerCase();
    return (
      contact.displayName.toLowerCase().includes(query) ||
      contact.phoneNumber.toLowerCase().includes(query)
    );
  });

  const renderContactItem = (contact: Contact, isSelected: boolean, onClick: () => void) => (
    <div
      key={contact.phoneNumber}
      onClick={onClick}
      className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-gray-100' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {contact.avatarUrl ? (
            <img
              src={contact.avatarUrl}
              alt={contact.displayName}
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
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-xs ${
              contact.avatarUrl ? 'hidden' : ''
            }`}
            style={{
              backgroundColor: getAvatarColor(contact.phoneNumber),
            }}
          >
            {getInitials(contact.displayName)}
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 truncate text-sm">{contact.displayName}</h3>
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {formatTime(contact.lastMessageAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-600 truncate flex-1">{contact.phoneNumber}</p>
            {contact.isExternal && (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded flex-shrink-0">
                External
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-120px)] bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Left Sidebar - FROM Contacts */}
        <div className="w-1/4 border-r border-gray-200 flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search From..."
                value={fromSearchQuery}
                onChange={(e) => setFromSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900 text-sm">From</h2>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingContacts ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 text-sm">Loading contacts...</p>
              </div>
            ) : filteredFromContacts.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 text-sm">No contacts found</p>
              </div>
            ) : (
              filteredFromContacts.map((contact) =>
                renderContactItem(
                  contact,
                  selectedFromContact?.phoneNumber === contact.phoneNumber,
                  () => setSelectedFromContact(contact)
                )
              )
            )}
          </div>
        </div>

        {/* Right Sidebar - TO Contacts */}
        <div className="w-1/4 border-r border-gray-200 flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search To..."
                value={toSearchQuery}
                onChange={(e) => setToSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900 text-sm">To</h2>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingContacts ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 text-sm">Loading contacts...</p>
              </div>
            ) : filteredToContacts.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 text-sm">No contacts found</p>
              </div>
            ) : filteredToContactsSearch.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 text-sm">
                  {selectedFromContact ? 'No conversations found' : 'Select a FROM contact first'}
                </p>
              </div>
            ) : (
              filteredToContactsSearch.map((contact) =>
                renderContactItem(
                  contact,
                  selectedToContact?.phoneNumber === contact.phoneNumber,
                  () => setSelectedToContact(contact)
                )
              )
            )}
          </div>
        </div>

        {/* Center - Chat Window */}
        <div className="flex-1 flex flex-col">
          {selectedFromContact && selectedToContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {selectedFromContact.avatarUrl ? (
                      <img
                        src={selectedFromContact.avatarUrl}
                        alt={selectedFromContact.displayName}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-xs"
                        style={{
                          backgroundColor: getAvatarColor(selectedFromContact.phoneNumber),
                        }}
                      >
                        {getInitials(selectedFromContact.displayName)}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">→</span>
                    {selectedToContact.avatarUrl ? (
                      <img
                        src={selectedToContact.avatarUrl}
                        alt={selectedToContact.displayName}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-xs"
                        style={{
                          backgroundColor: getAvatarColor(selectedToContact.phoneNumber),
                        }}
                      >
                        {getInitials(selectedToContact.displayName)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 text-sm">
                      {selectedFromContact.displayName} → {selectedToContact.displayName}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedFromContact.phoneNumber} → {selectedToContact.phoneNumber}
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <StarIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No messages found between these contacts</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOutbound = message.direction === MessageDirection.OUTBOUND;
                      const isAudio = message.type === MessageType.AUDIO;
                      const isPlaying = playingAudioId === message._id;

                      return (
                        <div
                          key={message._id}
                          className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isOutbound
                                ? 'bg-green-500 text-white'
                                : 'bg-white text-gray-900 shadow-sm'
                            }`}
                          >
                            {/* Reply Preview */}
                            {message.replyToMessage && (
                              <div
                                className={`mb-2 pb-2 border-l-2 pl-2 text-xs ${
                                  isOutbound ? 'border-green-300' : 'border-gray-300'
                                }`}
                              >
                                <p className="font-semibold">{message.replyToMessage.senderName}</p>
                                <p className="truncate">{message.replyToMessage.content}</p>
                              </div>
                            )}

                            {/* Message Content */}
                            {isAudio ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => handleAudioPlay(message._id)}
                                    className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-colors"
                                  >
                                    {isPlaying ? (
                                      <PauseIcon className="w-5 h-5 text-white" />
                                    ) : (
                                      <PlayIcon className="w-5 h-5 text-white ml-0.5" />
                                    )}
                                  </button>
                                  <div className="flex-1">
                                    <div className="h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                                      <div className="h-full bg-white w-1/3"></div>
                                    </div>
                                    <audio
                                      ref={(el) => {
                                        if (el) audioRefs.current.set(message._id, el);
                                      }}
                                      src={message.mediaUrl}
                                      onEnded={() => setPlayingAudioId(null)}
                                      onPause={() => setPlayingAudioId(null)}
                                    />
                                    <p className="text-xs mt-1">0:10</p>
                                  </div>
                                </div>
                                {/* Transcription */}
                                {message.metadata?.caption && (
                                  <div>
                                    <button
                                      onClick={() => toggleTranscript(message._id)}
                                      className="text-xs underline hover:no-underline"
                                    >
                                      {expandedTranscripts.has(message._id) ? '−' : '+'} Transcrição
                                    </button>
                                    {expandedTranscripts.has(message._id) && (
                                      <p className="text-sm mt-1">{message.metadata.caption}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : message.type === MessageType.IMAGE ? (
                              <div>
                                <AuthenticatedImage
                                  src={message.mediaUrl || ''}
                                  alt="Image"
                                  className="rounded-lg max-w-full"
                                />
                                {message.content && <p className="mt-2">{message.content}</p>}
                              </div>
                            ) : message.type === MessageType.VIDEO ? (
                              <div>
                                <AuthenticatedVideo
                                  src={message.mediaUrl || ''}
                                  className="rounded-lg max-w-full"
                                />
                                {message.content && <p className="mt-2">{message.content}</p>}
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            )}

                            {/* Timestamp */}
                            <p className={`text-xs mt-1 ${isOutbound ? 'text-green-100' : 'text-gray-500'}`}>
                              {formatTime(message.sentAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-gray-500 text-lg">Select FROM and TO contacts to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
