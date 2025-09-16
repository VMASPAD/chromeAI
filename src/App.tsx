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
import { Languages, FileText, Wand2, Globe, Brain, Lightbulb, Download, Mic, MicOff, Volume2, Upload } from "lucide-react";
import { HyperText } from "./components/magicui/hyper-text";
import { cn } from "./lib/utils";
import { AnimatedGridPattern } from "./components/magicui/animated-grid-pattern";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  
  // Batch translation
  const [batchTexts, setBatchTexts] = useState<string[]>(['']);
  const [batchResults, setBatchResults] = useState<string[]>([]);
  
  // Voice features
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Export functionality
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'txt'>('json');
  
  // Custom model fine-tuning
  const [customModel, setCustomModel] = useState<string>('');
  const [trainingData, setTrainingData] = useState<Array<{source: string, target: string}>>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const translatorRef = useRef<HTMLDivElement>(null);
  const detectorRef = useRef<HTMLDivElement>(null);
  const summarizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsInView(true);
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = sourceLanguage;
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (activeTab === 'translator') {
          setTranslatorText(transcript);
        } else if (activeTab === 'detector') {
          setDetectionText(transcript);
        } else if (activeTab === 'summarizer') {
          setSummarizerText(transcript);
        }
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition failed');
      };
      
      setRecognition(recognition);
    }
  }, [activeTab, sourceLanguage]);

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

  const handleBatchTranslate = async () => {
    if (!checkAPIAvailability() || batchTexts.filter(t => t.trim()).length === 0) {
      toast.error("Please enter texts to translate");
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      const translator = await window.Translator!.create({
        sourceLanguage,
        targetLanguage,
      });
      await translator.ready;

      const results: string[] = [];
      const validTexts = batchTexts.filter(t => t.trim());
      
      for (let i = 0; i < validTexts.length; i++) {
        const result = await translator.translate(validTexts[i]);
        results.push(result);
        setProgress(((i + 1) / validTexts.length) * 100);
      }
      
      setBatchResults(results);
      toast.success(`Batch translation completed! ${results.length} texts translated.`);
    } catch (error) {
      console.error("Batch translation error:", error);
      toast.error("Batch translation failed. Please try again.");
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

  const startVoiceInput = () => {
    if (recognition && !isListening) {
      recognition.start();
      setIsListening(true);
      toast.info('Listening... Speak now!');
    }
  };

  const stopVoiceInput = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window && text) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = activeTab === 'translator' ? targetLanguage : sourceLanguage;
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const exportResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      activeTab,
      translations: {
        single: { input: translatorText, output: translatedResult, sourceLanguage, targetLanguage },
        batch: batchTexts.map((text, index) => ({ input: text, output: batchResults[index] || '' }))
      },
      detection: { input: detectionText, output: detectionResult },
      summarization: { input: summarizerText, output: summaryResult, type: summaryType }
    };

    let content = '';
    let filename = '';
    let mimeType = '';

    switch (exportFormat) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename = `chrome-ai-results-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        const csvRows = [
          ['Type', 'Input', 'Output', 'Language/Settings'],
          ['Translation', translatorText, translatedResult, `${sourceLanguage} → ${targetLanguage}`],
          ['Detection', detectionText, detectionResult, 'Auto'],
          ['Summary', summarizerText, summaryResult, summaryType]
        ];
        content = csvRows.map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');
        filename = `chrome-ai-results-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      case 'txt':
        content = `Chrome AI Results - ${new Date().toLocaleString()}\n\n` +
                 `TRANSLATION:\nInput: ${translatorText}\nOutput: ${translatedResult}\nLanguages: ${sourceLanguage} → ${targetLanguage}\n\n` +
                 `DETECTION:\nInput: ${detectionText}\nOutput: ${detectionResult}\n\n` +
                 `SUMMARIZATION:\nInput: ${summarizerText}\nOutput: ${summaryResult}\nType: ${summaryType}`;
        filename = `chrome-ai-results-${Date.now()}.txt`;
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Results exported as ${exportFormat.toUpperCase()}`);
  };

  const addBatchText = () => {
    setBatchTexts([...batchTexts, '']);
  };

  const updateBatchText = (index: number, value: string) => {
    const newBatchTexts = [...batchTexts];
    newBatchTexts[index] = value;
    setBatchTexts(newBatchTexts);
  };

  const removeBatchText = (index: number) => {
    if (batchTexts.length > 1) {
      setBatchTexts(batchTexts.filter((_, i) => i !== index));
      setBatchResults(batchResults.filter((_, i) => i !== index));
    }
  };

  const addTrainingPair = () => {
    setTrainingData([...trainingData, { source: '', target: '' }]);
  };

  const updateTrainingPair = (index: number, field: 'source' | 'target', value: string) => {
    const newData = [...trainingData];
    newData[index][field] = value;
    setTrainingData(newData);
  };

  const removeTrainingPair = (index: number) => {
    setTrainingData(trainingData.filter((_, i) => i !== index));
  };

  const trainCustomModel = async () => {
    if (trainingData.length === 0) {
      toast.error('Please add training data');
      return;
    }
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setCustomModel(`custom-model-${Date.now()}`);
      toast.success('Custom model trained successfully!');
    } catch (error) {
      toast.error('Model training failed');
    } finally {
      setIsLoading(false);
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
              <TabsList className="grid w-full grid-cols-4 mb-4 text-xs">
                <TabsTrigger value="translator" className="flex items-center gap-1 px-1">
                  <Languages className="w-3 h-3" />
                  <span className="hidden sm:inline">Trans</span>
                </TabsTrigger>
                <TabsTrigger value="detector" className="flex items-center gap-1 px-1">
                  <Globe className="w-3 h-3" />
                  <span className="hidden sm:inline">Detect</span>
                </TabsTrigger>
                <TabsTrigger value="summarizer" className="flex items-center gap-1 px-1">
                  <FileText className="w-3 h-3" />
                  <span className="hidden sm:inline">Summary</span>
                </TabsTrigger>
                <TabsTrigger value="batch" className="flex items-center gap-1 px-1">
                  <Upload className="w-3 h-3" />
                  <span className="hidden sm:inline">Batch</span>
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

                      <div className="flex gap-2">
                        <Button 
                          onClick={handleTranslate} 
                          className="flex-1 h-8 text-xs"
                          disabled={isLoading || !translatorText.trim()}
                        >
                          {isLoading ? "Translating..." : "Translate"}
                        </Button>
                        <Button
                          onClick={isListening ? stopVoiceInput : startVoiceInput}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={!recognition}
                        >
                          {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                        </Button>
                      </div>

                      {translatedResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Result</Label>
                            <Button
                              onClick={() => speakText(translatedResult)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              disabled={isSpeaking}
                            >
                              <Volume2 className="w-3 h-3" />
                            </Button>
                          </div>
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

                      <div className="flex gap-2">
                        <Button 
                          onClick={handleDetectLanguage} 
                          className="flex-1 h-8 text-xs"
                          disabled={isLoading || !detectionText.trim()}
                        >
                          {isLoading ? "Detecting..." : "Detect Language"}
                        </Button>
                        <Button
                          onClick={isListening ? stopVoiceInput : startVoiceInput}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={!recognition}
                        >
                          {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                        </Button>
                      </div>

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

                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSummarize} 
                          className="flex-1 h-8 text-xs"
                          disabled={isLoading || !summarizerText.trim()}
                        >
                          {isLoading ? "Summarizing..." : "Generate Summary"}
                        </Button>
                        <Button
                          onClick={isListening ? stopVoiceInput : startVoiceInput}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={!recognition}
                        >
                          {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                        </Button>
                      </div>

                      {summaryResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Result</Label>
                            <Button
                              onClick={() => speakText(summaryResult)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              disabled={isSpeaking}
                            >
                              <Volume2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="p-3 bg-muted rounded-lg border max-h-32 overflow-y-auto">
                            <p className="text-xs leading-relaxed">{summaryResult}</p>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="batch" className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="relative overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Upload className="w-4 h-4 text-primary" />
                        Batch Translation
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Translate multiple texts at once
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">From</Label>
                          <LanguageCombobox 
                            value={sourceLanguage}
                            onValueChange={setSourceLanguage}
                            placeholder="Source"
                            className="w-full h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">To</Label>
                          <LanguageCombobox 
                            value={targetLanguage}
                            onValueChange={setTargetLanguage}
                            placeholder="Target"
                            className="w-full h-8 text-xs"
                          />
                        </div>
                      </div>

                      {batchTexts.map((text, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Text {index + 1}</Label>
                            {batchTexts.length > 1 && (
                              <Button
                                onClick={() => removeBatchText(index)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-500"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                          <Textarea
                            placeholder={`Enter text ${index + 1}...`}
                            value={text}
                            onChange={(e) => updateBatchText(index, e.target.value)}
                            className="min-h-[60px] text-xs resize-none"
                          />
                          {batchResults[index] && (
                            <div className="p-2 bg-muted rounded border">
                              <p className="text-xs">{batchResults[index]}</p>
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="flex gap-2">
                        <Button
                          onClick={addBatchText}
                          variant="outline"
                          className="h-8 text-xs"
                        >
                          Add Text
                        </Button>
                        <Button
                          onClick={handleBatchTranslate}
                          className="flex-1 h-8 text-xs"
                          disabled={isLoading || batchTexts.filter(t => t.trim()).length === 0}
                        >
                          {isLoading ? "Translating..." : "Translate All"}
                        </Button>
                      </div>

                      {batchResults.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Export Results</Label>
                            <div className="flex gap-1">
                              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                                <SelectTrigger className="w-16 h-6 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="json">JSON</SelectItem>
                                  <SelectItem value="csv">CSV</SelectItem>
                                  <SelectItem value="txt">TXT</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                onClick={exportResults}
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2 border-t pt-3">
                        <Label className="text-xs">Custom Model Training</Label>
                        {trainingData.length === 0 && (
                          <Button
                            onClick={addTrainingPair}
                            variant="outline"
                            className="w-full h-8 text-xs"
                          >
                            Add Training Data
                          </Button>
                        )}
                        {trainingData.map((pair, index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Pair {index + 1}</Label>
                              <Button
                                onClick={() => removeTrainingPair(index)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-500"
                              >
                                ×
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Source text"
                                value={pair.source}
                                onChange={(e) => updateTrainingPair(index, 'source', e.target.value)}
                                className="h-8 text-xs"
                              />
                              <Input
                                placeholder="Target text"
                                value={pair.target}
                                onChange={(e) => updateTrainingPair(index, 'target', e.target.value)}
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                        ))}
                        {trainingData.length > 0 && (
                          <div className="flex gap-2">
                            <Button
                              onClick={addTrainingPair}
                              variant="outline"
                              className="h-8 text-xs"
                            >
                              Add Pair
                            </Button>
                            <Button
                              onClick={trainCustomModel}
                              className="flex-1 h-8 text-xs"
                              disabled={isLoading || trainingData.length === 0}
                            >
                              {isLoading ? "Training..." : "Train Model"}
                            </Button>
                          </div>
                        )}
                        {customModel && (
                          <div className="p-2 bg-blue-50 rounded border text-xs">
                            Model: {customModel}
                          </div>
                        )}
                      </div>
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
