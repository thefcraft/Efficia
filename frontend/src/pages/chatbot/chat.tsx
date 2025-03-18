"use client";
import { Thread } from "@/components/assistant-ui/thread";
import {useChatRuntime} from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider, useComposerRuntime, useThreadRuntime } from "@assistant-ui/react";
import { WebSpeechSynthesisAdapter } from "@assistant-ui/react";
import {
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
} from "@assistant-ui/react";
 
import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import { SideNavigation } from "@/components/layout/chatbot/SideNavigation";
 
export default function ChatBotChat() {
  const { chatId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runtime = useChatRuntime({
    api: "http://127.0.0.1:8000/api/chatbot/generate",
    onFinish: (response) => {
      console.log("CurrMsg: ", runtime.thread.getState().messages);
    },
    adapters: {
      speech: new WebSpeechSynthesisAdapter(),
      attachments: new CompositeAttachmentAdapter([
        new SimpleImageAttachmentAdapter(),
        new SimpleTextAttachmentAdapter(),
      ]),
    },
    headers: {
      chatid: chatId
    },
    sendExtraMessageFields: true
  });
  

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/chatbot/chat/${chatId}`)
    .then(async (res) => {
      if(!res.ok) {
        const error = await res.json();
        throw error
      }
      return res.json()
    })
    .then((data) => {
      setLoading(false);
      console.log(data);
      runtime.thread.import(data);
    })
    .catch((e) => {
      setError(e['detail'] || e);
    })
  }, [chatId])

  if (error) {
    return <>ERROR: {error}</>
  }
 
  return (<>
    <AssistantRuntimeProvider runtime={runtime}>
      <main className="h-dvh flex">
        <SideNavigation />
        {!loading && <Thread />}
      </main>
    </AssistantRuntimeProvider>
  </>
  );
}