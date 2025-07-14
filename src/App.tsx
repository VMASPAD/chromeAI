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
    <div className="h-screen bg-gradient-to-br from-background via-secondary to-accent dark:from-background dark:via-secondary dark:to-accent relative overflow-hidden">
       <AnimatedGridPattern
        numSquares={50}
        maxOpacity={0.3}
        duration={3}
        repeatDelay={1.5}
        className={cn(
          "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
        )}
      />
      <div ref={containerRef} className="container mx-auto px-3 py-4 relative z-10">
        <BlurFade inView={isInView} delay={0.1}>
          <motion.div 
            className="text-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-2xl font-bold bg-gradient-to-r from-primary via-chart-1 to-chart-5 bg-clip-text text-transparent mb-2"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <HyperText>Chrome AI Playground</HyperText>
            </motion.h1>
            <motion.p 
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              AI-powered translation, detection & summarization
            </motion.p>
          </motion.div>
        </BlurFade>

        <BlurFade inView={isInView} delay={0.3}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 text-xs">
                <TabsTrigger value="translator" className="flex items-center gap-1 px-2">
                  <Languages className="w-3 h-3" />
                  <span className="hidden sm:inline">Translator</span>
                  <span className="sm:hidden">Trans</span>
                </TabsTrigger>
                <TabsTrigger value="detector" className="flex items-center gap-1 px-2">
                  <Globe className="w-3 h-3" />
                  <span className="hidden sm:inline">Detector</span>
                  <span className="sm:hidden">Detect</span>
                </TabsTrigger>
                <TabsTrigger value="summarizer" className="flex items-center gap-1 px-2">
                  <FileText className="w-3 h-3" />
                  <span className="hidden sm:inline">Summarizer</span>
                  <span className="sm:hidden">Summary</span>
                </TabsTrigger>
              </TabsList>

              {isLoading && (
                <motion.div 
                  className="mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Progress value={progress} className="w-full h-2" />
                </motion.div>
              )}

              <TabsContent value="translator" className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card ref={translatorRef} className="relative overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Wand2 className="w-4 h-4 text-primary" />
                        AI Translation
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Translate text using Chrome's AI
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="sourceLanguage" className="text-xs">From</Label>
                          <LanguageCombobox 
                            value={sourceLanguage}
                            onValueChange={setSourceLanguage}
                            placeholder="Source"
                            className="w-full h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="targetLanguage" className="text-xs">To</Label>
                          <LanguageCombobox 
                            value={targetLanguage}
                            onValueChange={setTargetLanguage}
                            placeholder="Target"
                            className="w-full h-8 text-xs"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="translatorText" className="text-xs">Text to Translate</Label>
                        <Textarea
                          id="translatorText"
                          placeholder="Enter text..."
                          value={translatorText}
                          onChange={(e) => setTranslatorText(e.target.value)}
                          className="min-h-[80px] text-xs resize-none"
                        />
                      </div>

                      <Button 
                        onClick={handleTranslate} 
                        className="w-full h-8 text-xs"
                        disabled={isLoading || !translatorText.trim()}
                      >
                        {isLoading ? "Translating..." : "Translate"}
                      </Button>

                      {translatedResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-1"
                        >
                          <Label className="text-xs">Result</Label>
                          <div className="p-3 bg-muted rounded-lg border">
                            <p className="text-xs">{translatedResult}</p>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="detector" className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card ref={detectorRef} className="relative overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Brain className="w-4 h-4 text-chart-2" />
                        Language Detection
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Detect the language of any text
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="detectionText" className="text-xs">Text to Analyze</Label>
                        <Textarea
                          id="detectionText"
                          placeholder="Enter text to detect..."
                          value={detectionText}
                          onChange={(e) => setDetectionText(e.target.value)}
                          className="min-h-[80px] text-xs resize-none"
                        />
                      </div>

                      <Button 
                        onClick={handleDetectLanguage} 
                        className="w-full h-8 text-xs"
                        disabled={isLoading || !detectionText.trim()}
                      >
                        {isLoading ? "Detecting..." : "Detect Language"}
                      </Button>

                      {detectionResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-1"
                        >
                          <Label className="text-xs">Result</Label>
                          <div className="p-3 bg-muted rounded-lg border">
                            <p className="text-xs font-medium">{detectionResult}</p>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="summarizer" className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card ref={summarizerRef} className="relative overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Lightbulb className="w-4 h-4 text-chart-4" />
                        AI Summarization
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Generate concise summaries
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="summaryType" className="text-xs">Summary Type</Label>
                        <Select value={summaryType} onValueChange={(value: typeof summaryType) => setSummaryType(value)}>
                          <SelectTrigger className="w-full h-8 text-xs">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tldr">TL;DR</SelectItem>
                            <SelectItem value="key-points">Key Points</SelectItem>
                            <SelectItem value="teaser">Teaser</SelectItem>
                            <SelectItem value="headline">Headline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="summarizerText" className="text-xs">Text to Summarize</Label>
                        <Textarea
                          id="summarizerText"
                          placeholder="Enter long text..."
                          value={summarizerText}
                          onChange={(e) => setSummarizerText(e.target.value)}
                          className="min-h-[100px] text-xs resize-none"
                        />
                      </div>

                      <Button 
                        onClick={handleSummarize} 
                        className="w-full h-8 text-xs"
                        disabled={isLoading || !summarizerText.trim()}
                      >
                        {isLoading ? "Summarizing..." : "Generate Summary"}
                      </Button>

                      {summaryResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-1"
                        >
                          <Label className="text-xs">Result</Label>
                          <div className="p-3 bg-muted rounded-lg border max-h-32 overflow-y-auto">
                            <p className="text-xs leading-relaxed">{summaryResult}</p>
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
            className="text-center mt-4 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p>Chrome 138+ required</p>
          </motion.div>
        </BlurFade>
      </div>
    </div>
  );
}

export default App;
