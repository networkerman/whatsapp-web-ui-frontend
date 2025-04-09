# WhatsApp Web Interface

A modern web interface for WhatsApp, built with Next.js and TypeScript.

## Features

- 🔒 Secure WhatsApp connection using official WhatsApp Web protocol
- 💬 View and send messages
- 📱 Mobile-friendly interface
- 🔄 Real-time chat synchronization
- 🎨 Modern UI with Tailwind CSS

## Connection Process

1. **Initial Connection**
   - When you first open the app, you'll see a QR code
   - Scan this QR code with your WhatsApp mobile app:
     1. Open WhatsApp on your phone
     2. Go to Settings > Linked Devices
     3. Tap "Link a Device"
     4. Scan the QR code shown in the web interface

2. **Synchronization**
   - After scanning the QR code, the app will start syncing your chats
   - This process may take a few moments depending on your chat history
   - You'll see a loading indicator while synchronization is in progress
   - Once complete, your chats will appear in the left sidebar

3. **Session Management**
   - Your session remains active until you log out
   - You can use the same WhatsApp account on up to 4 linked devices
   - The connection is end-to-end encrypted

## Development

### Prerequisites

- Node.js 18 or later
- npm or yarn
- A WhatsApp account

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/whatsapp-web-ui-frontend.git
   cd whatsapp-web-ui-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Deployment

The app is automatically deployed to Netlify when changes are pushed to the main branch.

### Environment Variables

Make sure to set these environment variables in your Netlify dashboard:

- `NEXT_PUBLIC_API_URL`: URL of your WhatsApp bridge backend API

### Build Settings

The following build settings are configured in `netlify.toml`:

- Build command: `npm install && npm run build`
- Publish directory: `out`
- Node version: 18

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 