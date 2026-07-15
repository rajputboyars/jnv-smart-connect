"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParentSummaryCard } from "@/components/ai/parent-summary-card";
import { ReportCardNarrativeCard } from "@/components/ai/report-card-narrative-card";
import { HomeworkGeneratorCard } from "@/components/ai/homework-generator-card";
import { QuestionPaperGeneratorCard } from "@/components/ai/question-paper-generator-card";
import { ChatAssistantCard } from "@/components/ai/chat-assistant-card";
import { RiskScoresTable } from "@/components/ai/risk-scores-table";

export function AiAssistView() {
  return (
    <Tabs defaultValue="chat">
      <TabsList>
        <TabsTrigger value="chat">Assistant</TabsTrigger>
        <TabsTrigger value="parent-summary">Parent Summary</TabsTrigger>
        <TabsTrigger value="report-card">Report Card</TabsTrigger>
        <TabsTrigger value="homework">Homework</TabsTrigger>
        <TabsTrigger value="question-paper">Question Paper</TabsTrigger>
        <TabsTrigger value="risk-scores">Risk Indicators</TabsTrigger>
      </TabsList>
      <TabsContent value="chat">
        <ChatAssistantCard />
      </TabsContent>
      <TabsContent value="parent-summary">
        <ParentSummaryCard />
      </TabsContent>
      <TabsContent value="report-card">
        <ReportCardNarrativeCard />
      </TabsContent>
      <TabsContent value="homework">
        <HomeworkGeneratorCard />
      </TabsContent>
      <TabsContent value="question-paper">
        <QuestionPaperGeneratorCard />
      </TabsContent>
      <TabsContent value="risk-scores">
        <RiskScoresTable />
      </TabsContent>
    </Tabs>
  );
}
