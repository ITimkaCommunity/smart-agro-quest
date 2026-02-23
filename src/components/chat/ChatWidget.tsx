import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  onClose: () => void;
}

export const ChatWidget = ({ onClose }: ChatWidgetProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Привет! 👋 Я ТИММИ — твой AI-помощник в EduFarm. Помогу разобраться с заданиями, подскажу по учёбе и расскажу, как устроена платформа. Спрашивай!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get FastAPI endpoint from environment or use default
  const FASTAPI_ENDPOINT = import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000/api/chat';

  // Local fallback responses — work without any backend
  const LOCAL_RESPONSES: { patterns: RegExp; reply: string }[] = [
    {
      patterns: /расскажи про себя|кто ты|что ты умеешь|что ты можешь/i,
      reply:
        'Я ТИММИ 🤖 — AI-помощник платформы EduFarm!\n\nВот что я умею:\n• 📚 Помогаю разобраться с заданиями и учебными материалами\n• 🌾 Подсказываю, как работает ферма, зоны и производство\n• 🏆 Рассказываю про достижения и как их получить\n• 🐾 Помогаю ухаживать за питомцем\n• 📊 Объясняю прогресс и систему уровней\n\nПросто спроси — и я постараюсь помочь!',
    },
    {
      patterns: /^привет$|^здравствуй|^хай|^добрый день|^доброе утро|^добрый вечер/i,
      reply: 'Привет! 👋 Я ТИММИ, чем могу помочь сегодня?',
    },
    {
      patterns: /помощь|помоги|help|как пользоваться/i,
      reply:
        'Конечно помогу! Вот с чем я могу помочь:\n\n🌾 **Ферма** — спроси про посадку, животных или производство\n📚 **Задания** — помогу разобраться с учебными заданиями\n🏆 **Достижения** — расскажу, какие есть и как получить\n🐾 **Питомец** — подскажу, как ухаживать\n\nПросто напиши свой вопрос!',
    },
    {
      patterns: /ферма|зона|посадка|растени|урожай|животн/i,
      reply:
        'На ферме ты можешь:\n\n🌱 Сажать семена и собирать урожай\n🐄 Ухаживать за животными\n⚙️ Запускать производственные цепочки\n\nКаждая зона (биология, химия, физика, математика, IT) — это отдельная тематическая область с уникальными ресурсами. Выполняй задания, чтобы прокачиваться и открывать новые слоты!',
    },
    {
      patterns: /достижени|ачивк|награ/i,
      reply:
        'Достижения — это награды за твои успехи! 🏆\n\nОни бывают разной редкости: обычные, редкие, эпические и легендарные. Выполняй задания, ухаживай за фермой и питомцем — и достижения будут открываться автоматически!',
    },
    {
      patterns: /питомец|пет|корм|счастье/i,
      reply:
        'У тебя есть виртуальный питомец! 🐾\n\nНе забывай его кормить, поить и играть с ним. Если питомец будет несчастным слишком долго — он может убежать! Покупай предметы в зоомагазине за ресурсы с фермы.',
    },
  ];

  const getLocalResponse = (text: string): string | null => {
    const match = LOCAL_RESPONSES.find((r) => r.patterns.test(text.trim()));
    return match ? match.reply : null;
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    // Check local fallback first
    const localReply = getLocalResponse(currentInput);
    if (localReply) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: localReply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(FASTAPI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          history: messages.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, content: m.content })),
          system_prompt: 'Тебя зовут ТИММИ. Ты дружелюбный AI-помощник образовательной платформы EduFarm. Ты помогаешь студентам с заданиями, объясняешь материалы, подсказываешь по работе с платформой (ферма, задания, достижения, питомец). Отвечай на русском языке, кратко и по делу. Когда тебя спрашивают "расскажи про себя" — представься как ТИММИ и опиши свои возможности.',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || 'No response',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Не удалось связаться с AI-сервером. Но я всё ещё могу ответить на базовые вопросы! Попробуй спросить: "Кто ты?", "Помощь" или "Расскажи про ферму".',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
        <div>
          <h3 className="font-semibold text-foreground">ТИММИ</h3>
          <p className="text-xs text-muted-foreground">Твой AI-помощник в EduFarm</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length <= 1 && messages[0]?.id === 'welcome' && (
            <div className="text-center text-muted-foreground text-xs py-2">
              Начни диалог — напиши что-нибудь!
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Напишите сообщение..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
