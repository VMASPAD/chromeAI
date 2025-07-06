"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { LanguageCombobox } from "@/components/Languague";
import { BlurFade } from "@/components/ui/blur-fade";
import { Languages, FileText, Wand2, Globe, Brain, Lightbulb } from "lucide-react";
import { HyperText } from "./components/magicui/hyper-text";
import { cn } from "./lib/utils";
import { AnimatedGridPattern } from "./components/magicui/animated-grid-pattern";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
declare global {
  interface Window {
    Translator?: {
      availability(options: { sourceLanguage: string; targetLanguage: string }): Promise<string>;
      create(options: { sourceLanguage: string; targetLanguage: string }): Promise<{
        translate(text: string): Promise<string>;
        ready: Promise<void>;
      }>;
    };
    LanguageDetector?: {
      availability(): Promise<string>;
      create(): Promise<{
        detect(text: string): Promise<Array<{ detectedLanguage: string; confidence: number }>>;
        ready: Promise<void>;
      }>;
    };
    Summarizer?: {
      availability(): Promise<string>;
      create(options?: {
        sharedContext?: string;
        type?: 'tldr' | 'key-points' | 'teaser' | 'headline';
        format?: 'markdown' | 'plain-text';
        length?: 'short' | 'medium' | 'long';
      }): Promise<{
        summarize(text: string): Promise<string>;
        ready: Promise<void>;
      }>;
    };
  }
}

function App() {
  const [activeTab, setActiveTab] = useState("translator");
  const [translatorText, setTranslatorText] = useState("");
  const [translatedResult, setTranslatedResult] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [detectionText, setDetectionText] = useState("");
  const [detectionResult, setDetectionResult] = useState("");
  const [summarizerText, setSummarizerText] = useState("");
  const [summaryResult, setSummaryResult] = useState("");
  const [summaryType, setSummaryType] = useState<'tldr' | 'key-points' | 'teaser' | 'headline'>('tldr');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const translatorRef = useRef<HTMLDivElement>(null);
  const detectorRef = useRef<HTMLDivElement>(null);
  const summarizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsInView(true);
  }, []);

  const checkAPIAvailability = () => {
    if (!window.Translator || !window.LanguageDetector || !window.Summarizer) {
      toast.error("Chrome AI APIs not available. Please ensure you're using Chrome 138+ with the appropriate flags enabled.");
      return false;
    }
    return true;
  };

  const handleTranslate = async () => {
    if (!checkAPIAvailability() || !translatorText.trim()) {
      toast.error("Please enter text to translate");
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      const availability = await window.Translator!.availability({
        sourceLanguage,
        targetLanguage,
      });

      if (availability === 'unavailable') {
        toast.error("Translation not available for this language pair");
        return;
      }

      setProgress(30);
      
      const translator = await window.Translator!.create({
        sourceLanguage,
        targetLanguage,
      });

      setProgress(60);
      await translator.ready;
      setProgress(80);

      const result = await translator.translate(translatorText);
      setTranslatedResult(result);
      setProgress(100);
      
      toast.success("Translation completed successfully!");
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleDetectLanguage = async () => {
    if (!checkAPIAvailability() || !detectionText.trim()) {
      toast.error("Please enter text to detect language");
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      const availability = await window.LanguageDetector!.availability();
      
      if (availability === 'unavailable') {
        toast.error("Language detection not available");
        return;
      }

      setProgress(40);

      const detector = await window.LanguageDetector!.create();
      setProgress(70);
      await detector.ready;
      setProgress(90);

      const results = await detector.detect(detectionText);
      const topResult = results[0];
      
      if (topResult) {
        const confidence = (topResult.confidence * 100).toFixed(1);
        setDetectionResult(`Language: ${topResult.detectedLanguage} (Confidence: ${confidence}%)`);
        toast.success("Language detected successfully!");
      } else {
        setDetectionResult("Unable to detect language");
        toast.warning("Could not detect language");
      }
      
      setProgress(100);
    } catch (error) {
      console.error("Language detection error:", error);
      toast.error("Language detection failed. Please try again.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleSummarize = async () => {
    if (!checkAPIAvailability() || !summarizerText.trim()) {
      toast.error("Please enter text to summarize");
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      const availability = await window.Summarizer!.availability();
      
      if (availability === 'unavailable') {
        toast.error("Summarization not available");
        return;
      }

      setProgress(30);

      const summarizer = await window.Summarizer!.create({
        type: summaryType,
        format: 'plain-text',
        length: 'medium',
      });

      setProgress(60);
      await summarizer.ready;
      setProgress(80);

      const result = await summarizer.summarize(summarizerText);
      setSummaryResult(result);
      setProgress(100);
      
      toast.success("Summarization completed successfully!");
    } catch (error) {
      console.error("Summarization error:", error);
      toast.error("Summarization failed. Please try again.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-accent dark:from-background dark:via-secondary dark:to-accent relative overflow-hidden">
       <AnimatedGridPattern
        numSquares={200}
        maxOpacity={0.5}
        duration={3}
        repeatDelay={1.5}
        className={cn(
          "[mask-image:radial-gradient(700px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
        )}
      />
      <div ref={containerRef} className="container mx-auto px-4 py-8 relative z-10">
        <BlurFade inView={isInView} delay={0.1}>
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-6xl font-bold bg-gradient-to-r from-primary via-chart-1 to-chart-5 bg-clip-text text-transparent mb-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <HyperText>              Chrome AI Playground
</HyperText>
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Explore the power of Chrome's built-in AI APIs for translation, language detection, and text summarization
            </motion.p>
          </motion.div>
        </BlurFade>

        <BlurFade inView={isInView} delay={0.3}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="translator" className="flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  Translator
                </TabsTrigger>
                <TabsTrigger value="detector" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Language Detector
                </TabsTrigger>
                <TabsTrigger value="summarizer" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Summarizer
                </TabsTrigger>
              </TabsList>

              {isLoading && (
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Progress value={progress} className="w-full" />
                </motion.div>
              )}

              <TabsContent value="translator" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card ref={translatorRef} className="relative overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-primary" />
                        AI Translation
                      </CardTitle>
                      <CardDescription>
                        Translate text between languages using Chrome's built-in AI
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sourceLanguage">Source Language</Label>
                          <LanguageCombobox 
                            value={sourceLanguage}
                            onValueChange={setSourceLanguage}
                            placeholder="Select source language"
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="targetLanguage">Target Language</Label>
                          <LanguageCombobox 
                            value={targetLanguage}
                            onValueChange={setTargetLanguage}
                            placeholder="Select target language"
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="translatorText">Text to Translate</Label>
                        <Textarea
                          id="translatorText"
                          placeholder="Enter text to translate..."
                          value={translatorText}
                          onChange={(e) => setTranslatorText(e.target.value)}
                          className="min-h-[120px]"
                        />
                      </div>

                      <Button 
                        onClick={handleTranslate} 
                        className="w-full"
                        disabled={isLoading || !translatorText.trim()}
                      >
                        {isLoading ? "Translating..." : "Translate"}
                      </Button>

                      {translatedResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2"
                        >
                          <Label>Translation Result</Label>
                          <div className="p-4 bg-muted rounded-lg border">
                            <p className="text-sm">{translatedResult}</p>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="detector" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card ref={detectorRef} className="relative overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-chart-2" />
                        Language Detection
                      </CardTitle>
                      <CardDescription>
                        Automatically detect the language of any text
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="detectionText">Text to Analyze</Label>
                        <Textarea
                          id="detectionText"
                          placeholder="Enter text to detect language..."
                          value={detectionText}
                          onChange={(e) => setDetectionText(e.target.value)}
                          className="min-h-[120px]"
                        />
                      </div>

                      <Button 
                        onClick={handleDetectLanguage} 
                        className="w-full"
                        disabled={isLoading || !detectionText.trim()}
                      >
                        {isLoading ? "Detecting..." : "Detect Language"}
                      </Button>

                      {detectionResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2"
                        >
                          <Label>Detection Result</Label>
                          <div className="p-4 bg-muted rounded-lg border">
                            <p className="text-sm font-medium">{detectionResult}</p>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="summarizer" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card ref={summarizerRef} className="relative overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-chart-4" />
                        AI Summarization
                      </CardTitle>
                      <CardDescription>
                        Generate concise summaries of long texts
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="summaryType">Summary Type</Label>
                        <Select value={summaryType} onValueChange={(value: typeof summaryType) => setSummaryType(value)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select summary type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tldr">TL;DR - Quick overview</SelectItem>
                            <SelectItem value="key-points">Key Points - Bullet format</SelectItem>
                            <SelectItem value="teaser">Teaser - Engaging summary</SelectItem>
                            <SelectItem value="headline">Headline - Title format</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="summarizerText">Text to Summarize</Label>
                        <Textarea
                          id="summarizerText"
                          placeholder="Enter long text to summarize..."
                          value={summarizerText}
                          onChange={(e) => setSummarizerText(e.target.value)}
                          className="min-h-[200px]"
                        />
                      </div>

                      <Button 
                        onClick={handleSummarize} 
                        className="w-full"
                        disabled={isLoading || !summarizerText.trim()}
                      >
                        {isLoading ? "Summarizing..." : "Generate Summary"}
                      </Button>

                      {summaryResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2"
                        >
                          <Label>Summary Result</Label>
                          <div className="p-4 bg-muted rounded-lg border">
                            <p className="text-sm leading-relaxed">{summaryResult}</p>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
  
        </BlurFade>

        <BlurFade inView={isInView} delay={0.6}>
          <motion.div 
            className="text-center mt-12 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p>Powered by Chrome's Built-in AI APIs | Requires Chrome 138+ with appropriate flags</p>
          </motion.div>
        </BlurFade>
      </div>
    </div>
  );
}

export default App;
