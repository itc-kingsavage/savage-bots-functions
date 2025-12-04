const axios = require('axios');
const { validateArgs, isVIP } = require('../../../shared/utils.js');

// Conversation memory for each user
const conversations = new Map();

module.exports = {
    name: 'ai',
    description: 'Progressive ChatGPT (VIP only) - Continues conversation when you reply',
    category: 'vip',
    async execute(args, message, client, botType) {
        if (!isVIP(message.from)) {
            return '❌ This is a VIP-exclusive AI feature.\n💎 Use $vip to upgrade.';
        }
        
        const userId = message.from;
        
        // Check if this is a new conversation or continuation
        const isReply = message.hasQuotedMsg && 
                       (await message.getQuotedMsg()).fromMe;
        
        let conversation = conversations.get(userId);
        
        if (!conversation || !isReply) {
            // Start new conversation
            conversation = {
                messages: [],
                createdAt: Date.now(),
                messageCount: 0
            };
            conversations.set(userId, conversation);
            
            // Clean old conversations
            cleanupConversations();
        }
        
        if (!validateArgs(args)) {
            return conversation.messageCount === 0 
                ? '💬 Start chatting with AI! Example: $ai Hello, how are you?'
                : '💬 Continue the conversation by replying to my message, or start fresh with: $ai <new message>';
        }
        
        try {
            // Add user message to conversation
            conversation.messages.push({
                role: 'user',
                content: args
            });
            conversation.messageCount++;
            conversation.lastActive = Date.now();
            
            // Call ChatGPT API
            const response = await callChatGPT(conversation.messages);
            
            // Add AI response to conversation
            conversation.messages.push({
                role: 'assistant',
                content: response
            });
            
            // Limit conversation history
            if (conversation.messages.length > 20) {
                conversation.messages = conversation.messages.slice(-10);
            }
            
            // VIP gets faster response
            const prefix = conversation.messageCount === 1 
                ? '🤖 *ChatGPT (VIP)*\n' 
                : '🤖 *ChatGPT Continuing...*\n';
            
            return prefix + response;
            
        } catch (error) {
            console.error('AI error:', error);
            
            // Clear conversation on error
            conversations.delete(userId);
            
            if (error.response?.status === 429) {
                return '⚠️ Rate limit reached. Try again in a minute.';
            } else if (error.response?.status === 401) {
                return '🔑 API key invalid. Contact admin.';
            } else {
                return '❌ AI service temporarily unavailable.';
            }
        }
    }
};

async function callChatGPT(messages) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
        throw new Error('OpenAI API key not configured');
    }
    
    const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful WhatsApp assistant called Savage-X AI. Keep responses concise and WhatsApp-friendly. Use emojis appropriately. Limit responses to 3-5 sentences maximum.'
                },
                ...messages.slice(-5) // Last 5 messages for context
            ],
            max_tokens: 500,
            temperature: 0.7
        },
        {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 second timeout for VIP
        }
    );
    
    return response.data.choices[0].message.content.trim();
}

function cleanupConversations() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [userId, conv] of conversations.entries()) {
        if (now - conv.lastActive > oneHour) {
            conversations.delete(userId);
        }
    }
}
