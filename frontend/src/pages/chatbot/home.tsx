"use client";
import { Thread } from "@/components/assistant-ui/thread";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider, useComposerRuntime, useThreadRuntime } from "@assistant-ui/react";
import { WebSpeechSynthesisAdapter } from "@assistant-ui/react";
import {
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
} from "@assistant-ui/react";
import { useEffect, useState } from "react";
import { CreateMessage, Message } from "ai";
import { PlusIcon } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { SideNavigation } from "@/components/layout/chatbot/SideNavigation";

export default function ChatBotHome() {
  const navigation = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [chatid, setChatid] = useState<string | null>(null);
  const [isFinish, setIsFinish] = useState(false);

  useEffect(() => {
    if (isFinish && chatid) {
      navigation(`/chat/${chatid}`)
      // window.history.pushState({}, "", `/chat/${chatid}`) // TODO: write the same code after isFinish which i have in the \chatId
    }
  }, [isFinish, chatid])

  const runtime = useChatRuntime({
    // api: "/api/chat",
    api: "http://127.0.0.1:8000/api/chatbot/generate",
    onResponse: (response: Response) => {
      const id = response.headers.get("chatid");
      // console.log(id);
      setChatid(id);
    },
    onFinish: (response) => {
      // console.log(runtime.thread.export());
      // console.log("CurrMsg: ", runtime.thread.getState().messages); 
      setIsFinish(true);
    },
    adapters: {
      speech: new WebSpeechSynthesisAdapter(),
      attachments: new CompositeAttachmentAdapter([
        new SimpleImageAttachmentAdapter(),
        new SimpleTextAttachmentAdapter(),
      ]),
    },
    sendExtraMessageFields: true
  });


  return (<>
    <AssistantRuntimeProvider runtime={runtime}>
      <main className="h-dvh flex">
        <SideNavigation />
        {!loading && !error && <Thread />}
      </main>
    </AssistantRuntimeProvider>
  </>
  );
}
