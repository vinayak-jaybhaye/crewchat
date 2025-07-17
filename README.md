# CrewChat Project Directory Structure

```

crewchat/
├── apps/
│   ├── web/                # Next.js frontend (App Router)
│   │   ├── app/            # Next.js app directory
│   │   ├── components/     # Reusable React components
│   │   ├── lib/            # Utility functions (e.g., fetchers, helpers)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── styles/         # Tailwind or CSS modules
│   │   ├── constants/      # Static values (routes, configs)
│   │   ├── middleware.ts   # For auth protection
│   │   └── next.config.js
│   └── socket-server/      # WebSocket + WebRTC server (Node.js + ws/socket.io)
│       ├── index.js
│       ├── socket/         # Socket handlers (events, rooms, etc.)
│       ├── webrtc/         # WebRTC signaling logic
│       └── redis/          # Redis pub/sub logic
├── packages/
│   ├── db/                 # MongoDB schema models using Mongoose or Prisma
│   │   ├── models/
│   │   └── index.ts
│   ├── types/              # Shared TypeScript types/interfaces
│   ├── utils/              # Shared utility functions
│   └── config/             # Shared config (env setup, constants)
├── public/                 # Static assets (favicon, images)
├── .env                    # Environment variables
├── .gitignore
├── docker-compose.yml      # Optional: For Redis, MongoDB containers
├── README.md
└── package.json

```