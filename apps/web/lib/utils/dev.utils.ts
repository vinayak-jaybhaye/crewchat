// development util

export function generateRandomMessage(){
  const msg = [
    "Hello!",
    "How are you?",
    "What's up?",
    "Let's catch up later.",
    "Did you see the game last night?",
    "I'm working on a new project.",
    "Have you heard the news?",
    "Let's grab lunch sometime.",
    "What are your plans for the weekend?",
    "Talk to you soon!"
  ];
  return msg[Math.floor(Math.random() * msg.length)];
}