'use client';

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatContacts, chatConversations, chatMessages } from '@/data/chatMockData';

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  lastSeen: string;
  isOnline: boolean;
}

interface Conversation {
  id: string;
  contactId: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isRead: boolean;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'audio';
  isIncoming: boolean;
  status: 'sent' | 'delivered' | 'read';
}

// Use imported mock data
const mockContacts = chatContacts;
const mockConversations = chatConversations;
const mockMessages = chatMessages;


export default function ChatInterface() {
  const [selectedConversationId, setSelectedConversationId] = useState<string>('1');
  const [contactSearch, setContactSearch] = useState('');
  const [conversationSearch, setConversationSearch] = useState('');

  const selectedConversation = mockConversations.find(c => c.id === selectedConversationId);
  const selectedContact = selectedConversation 
    ? mockContacts.find(c => c.id === selectedConversation.contactId)
    : null;
  const conversationMessages = mockMessages.filter(m => m.conversationId === selectedConversationId);

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.phone.includes(contactSearch)
  );

  const filteredConversations = mockConversations.filter(conv => {
    const contact = mockContacts.find(c => c.id === conv.contactId);
    return contact?.name.toLowerCase().includes(conversationSearch.toLowerCase()) ||
           conv.lastMessage.toLowerCase().includes(conversationSearch.toLowerCase());
  });


  const getInitials = (name: string, contact?: any) => {
    if (contact && contact.initials) {
      return contact.initials;
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex h-[calc(100vh-180px)] bg-white rounded-lg shadow-sm border border-border overflow-hidden">
      {/* Left Sidebar - Agents */}
      <div className="w-80 border-r border-border flex flex-col bg-gray-50">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground mb-3">Agents</h3>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {getInitials(contact.name, contact)}
                </div>
                {contact.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {contact.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {contact.phone}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle - Conversations */}
      <div className="w-96 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground mb-3">Conversations</h3>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search"
              value={conversationSearch}
              onChange={(e) => setConversationSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => {
            const contact = mockContacts.find(c => c.id === conversation.contactId);
            const isSelected = conversation.id === selectedConversationId;
            
            return (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                className={`flex items-start p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                  isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {contact ? getInitials(contact.name, contact) : '?'}
                  </div>
                  {contact?.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">
                      {contact?.name || 'Unknown'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {conversation.timestamp}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {conversation.lastMessage}
                  </p>
                  <div className="flex items-center mt-1">
                    {conversation.isRead && (
                      <div className="text-primary mr-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right - Chat Messages */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-gray-50">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {getInitials(selectedContact.name, selectedContact)}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    {selectedContact.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedContact.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {conversationMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isIncoming ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isIncoming
                        ? 'bg-white text-foreground'
                        : 'bg-primary text-white'
                    } shadow-sm`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center justify-end mt-1 space-x-1 ${
                      message.isIncoming ? 'text-muted-foreground' : 'text-primary-100'
                    }`}>
                      <span className="text-xs">{message.timestamp}</span>
                      {!message.isIncoming && (
                        <div className="text-primary-100">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Select a conversation
              </h3>
              <p className="text-muted-foreground">
                Choose a conversation from the list to start messaging.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
