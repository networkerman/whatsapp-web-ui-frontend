# WhatsApp Web UI Frontend

A modern web interface for WhatsApp messaging, built with Next.js and Tailwind CSS.

## Project Overview

This is the frontend component of a WhatsApp-like messaging application. It connects to a backend API server deployed on Railway.

### Key Features
- Real-time chat interface
- Chat list with last message preview
- Message history viewing
- Message sending functionality
- Responsive design with Tailwind CSS

## Tech Stack
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript
- **Deployment**: Netlify
- **API Integration**: RESTful API calls

## Project Structure
```
src/
├── app/                 # Next.js app directory
│   ├── page.tsx        # Main chat interface
│   ├── layout.tsx      # Root layout
│   └── globals.css     # Global styles
└── lib/
    └── api.ts          # API integration functions
```

## Environment Variables
Required environment variable:
```
NEXT_PUBLIC_API_URL=https://uday-whatsapp-production.up.railway.app
```

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/networkerman/whatsapp-web-ui-frontend.git
cd whatsapp-web-ui-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
echo "NEXT_PUBLIC_API_URL=https://uday-whatsapp-production.up.railway.app" > .env.local
```

4. Run the development server:
```bash
npm run dev
```

## Deployment

The application is deployed on Netlify at https://messageai.netlify.app

### Deployment Configuration
- Build command: `npm install && npm run build`
- Publish directory: `.next`
- Environment variables are set in Netlify dashboard

### Netlify Configuration
```toml
[build]
  command = "npm install && npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## API Integration

The frontend communicates with the backend API through the following endpoints:

- `GET /api/chats` - Fetch all chats
- `GET /api/messages/{chatId}` - Fetch messages for a specific chat
- `POST /api/messages/{chatId}` - Send a new message

## Known Issues and Solutions

1. **Type Error in Message Handling**
   - Issue: Type mismatch between API response and Message interface
   - Solution: Transform API response into proper Message object in handleSendMessage function
   - Location: `src/app/page.tsx`

2. **CORS Configuration**
   - Issue: Cross-origin requests blocked
   - Solution: Backend CORS configuration updated to allow requests from messageai.netlify.app

## Troubleshooting

If you encounter issues:

1. Check the API connection:
```bash
curl -v https://uday-whatsapp-production.up.railway.app/api/chats
```

2. Verify environment variables:
```bash
echo $NEXT_PUBLIC_API_URL
```

3. Check Netlify deployment logs:
```bash
npx netlify-cli logs
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test locally
4. Submit a pull request

## License

This project is licensed under the MIT License. 