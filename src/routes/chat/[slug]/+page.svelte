<script lang="ts">
  import type { Message, Chat } from '$lib/type/chat';
  
  let chat: Chat = {
    id: '1',
    name: 'Support Chat',
    messages: [
      { id: '1', sender: 'user', text: 'Hello!', createdAt: new Date(),avaterImg:'/bot.png' },
      { id: '2', sender: 'bot', text: 'Hi! How can I help you?', createdAt: new Date(), avaterImg:'/bot.png' },
      { id: '3', sender: 'user', text: 'I need help with my order', createdAt: new Date(), avaterImg:'/bot.png' },
      { id: '4', sender: 'bot', text: 'Sure! Please provide me with your order number', createdAt: new Date(), avaterImg:'/bot.png' },
      { id: '4', sender: 'bot', text: 'Sure! Please provide me with your order number', createdAt: new Date(), avaterImg:'/bot.png' },
      { id: '4', sender: 'bot', text: 'Sure! Please provide me with your order number', createdAt: new Date(), avaterImg:'/bot.png' },
      { id: '4', sender: 'bot', text: 'Sure! Please provide me with your order number', createdAt: new Date(), avaterImg:'/bot.png' },

      { id: '4', sender: 'bot', text: 'Sure! Please provide me with your order number', createdAt: new Date(), avaterImg:'/bot.png' },
      { id: '4', sender: 'bot', text: 'Sure! Please provide me with your order number', createdAt: new Date(), avaterImg:'/bot.png' },
      { id: '4', sender: 'bot', text: 'Sure! Please provide me with your order number', createdAt: new Date(), avaterImg:'/bot.png' },
      { id: '4', sender: 'bot', text: 'Sure! Please provide me with your order number', createdAt: new Date(), avaterImg:'/bot.png' },
      { id: '4', sender: 'bot', text: 'Sure! Please provide me with your order number', createdAt: new Date(), avaterImg:'/bot.png' },
      { id: '4', sender: 'bot', text: 'Sure! Please provide me with your order number', createdAt: new Date(), avaterImg:'/bot.png' },
      { id: '4', sender: 'bot', text: 'Sure! Please provide me with your order number', createdAt: new Date(), avaterImg:'/bot.png' },
      { id: '4', sender: 'bot', text: 'Sure! Please provide me with your order number', createdAt: new Date(), avaterImg:'/bot.png' },
      { id: '4', sender: 'bot', text: 'Sure! Please provide me with your order number', createdAt: new Date(), avaterImg:'/bot.png' },
      { id: '4', sender: 'bot', text: 'Sure! Please provide me with your order number', createdAt: new Date(), avaterImg:'/bot.png' },
      { id: '4', sender: 'bot', text: 'Sure! Please provide me with your order number', createdAt: new Date(), avaterImg:'/bot.png' },

    ],
  };
  
  let newMessageText = '';

  function sendMessage() {
    if (newMessageText.trim() !== '') {
      const newMessage: Message = {
        id: String(chat.messages.length + 1),
        sender: 'user',
        text: newMessageText,
        createdAt: new Date(),
        avaterImg:'/bot.png'
      };
      chat.messages = [...chat.messages, newMessage];
      newMessageText = '';
    }
  }

  </script>

<div class="flex flex-col h-[calc(100vh-4rem)] mx-auto">
  <div class="flex-grow overflow-y-auto p-4">
    {#each chat.messages as message}
      <div class="flex items-start mb-4">
        <img src="/bot.png" alt="Avatar" class="w-8 h-8 rounded-full mr-2" />
        <div class="flex flex-col">
          <div class="flex items-center">
            <p class="font-bold">{message.sender}</p>
            <p class="text-gray-500 text-sm ml-2">{message.createdAt.toLocaleTimeString()}</p>
          </div>
          <p class="bg-gray-200 p-2 rounded-lg">{message.text}</p>
        </div>
      </div>
    {/each}
  </div>
  
  <div class="flex p-4">
    <input
      type="text"
      bind:value={newMessageText}
      placeholder="Type your message..."
      class="flex-grow p-2 border rounded-l-lg"
    />
    <button on:click={sendMessage} class="p-2 bg-blue-500 text-white rounded-r-lg">Send</button>
  </div>
</div>