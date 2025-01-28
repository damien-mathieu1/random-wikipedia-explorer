import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, RefreshCw, Trophy, Flame } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface WikipediaArticle {
  title: string;
  extract: string;
  fullurl: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  fullContent?: string;
}

interface UserStats {
  articlesRead: number;
  dailyStreak: number;
  lastReadDate: string;
  dailyGoal: number;
  dailyProgress: number;
}

function App() {
  const [article, setArticle] = useState<WikipediaArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullArticle, setShowFullArticle] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('wikiStats');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      articlesRead: 0,
      dailyStreak: 0,
      lastReadDate: new Date().toDateString(),
      dailyGoal: 5,
      dailyProgress: 0,
    };
  });

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateCursor);
    return () => window.removeEventListener('mousemove', updateCursor);
  }, []);

  const updateStats = () => {
    const today = new Date().toDateString();
    const newStats = { ...stats };

    if (stats.lastReadDate !== today) {
      if (new Date(stats.lastReadDate).getTime() + 86400000 >= new Date().getTime()) {
        newStats.dailyStreak += 1;
      } else {
        newStats.dailyStreak = 1;
      }
      newStats.dailyProgress = 1;
      newStats.lastReadDate = today;
    } else {
      newStats.dailyProgress = Math.min(stats.dailyProgress + 1, stats.dailyGoal);
    }

    newStats.articlesRead += 1;
    setStats(newStats);
    localStorage.setItem('wikiStats', JSON.stringify(newStats));
  };

  const fetchRandomArticle = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://en.wikipedia.org/api/rest_v1/page/random/summary'
      );
      const data = await response.json();
      
      // Fetch full content
      const fullContentResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(data.title)}`
      );
      const fullContent = await fullContentResponse.text();

      // Get high-quality image if available
      let highQualityImage = data.thumbnail?.source;
      if (highQualityImage) {
        highQualityImage = highQualityImage.replace(/\d+px/, '2400px');
      }

      setArticle({
        title: data.title,
        extract: data.extract,
        fullurl: data.content_urls.desktop.page,
        thumbnail: highQualityImage ? {
          source: highQualityImage,
          width: data.thumbnail.width,
          height: data.thumbnail.height,
        } : undefined,
        fullContent: fullContent,
      });
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomArticle();
  }, []);

  const getImageStyle = () => {
    if (!article?.thumbnail) return {};
    const aspectRatio = article.thumbnail.width / article.thumbnail.height;
    return aspectRatio < 1 ? { maxHeight: '600px', width: 'auto' } : { width: '100%', maxHeight: '400px' };
  };

  return (
    <>
      <div className="cursor-none min-h-screen bg-gradient-to-b from-background to-muted p-4 md:p-8 flex flex-col items-center">
        <div 
          className="cursor-dot"
          style={{
            transform: `translate(${cursorPosition.x}px, ${cursorPosition.y}px)`
          }}
        />
        <div 
          className="cursor-dot-outline"
          style={{
            transform: `translate(${cursorPosition.x}px, ${cursorPosition.y}px)`
          }}
        />
        <div className="w-full max-w-4xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8" />
              <h1 className="text-2xl md:text-3xl font-bold">Random Wikipedia Explorer</h1>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Card className="p-4 flex items-center gap-4 flex-1 md:flex-initial">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="font-bold">{stats.dailyStreak} day streak</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Daily Progress</span>
                    <span className="text-sm font-medium">{stats.dailyProgress}/{stats.dailyGoal}</span>
                  </div>
                  <Progress value={(stats.dailyProgress / stats.dailyGoal) * 100} className="w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="font-bold">{stats.articlesRead} total</span>
                </div>
              </Card>
              <ThemeToggle />
            </div>
          </div>

          <Card className="w-full">
            {loading ? (
              <>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[200px] w-full" />
                </CardContent>
              </>
            ) : article && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">{article.title}</CardTitle>
                  <CardDescription>
                    From Wikipedia, the free encyclopedia
                  </CardDescription>
                </CardHeader>
                {article.thumbnail && (
                  <div className="px-6 flex justify-center">
                    <img
                      src={article.thumbnail.source}
                      alt={article.title}
                      className="rounded-lg object-cover mb-6 shadow-lg cursor-zoom-in transition-transform hover:scale-[1.02]"
                      style={getImageStyle()}
                      loading="lazy"
                      onClick={() => setShowFullImage(true)}
                    />
                  </div>
                )}
                <CardContent>
                  <ScrollArea className="h-[300px] rounded-md">
                    <p className="text-lg leading-relaxed">
                      {article.extract}
                    </p>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowFullArticle(true);
                      updateStats();
                    }}
                  >
                    Read Full Article
                  </Button>
                  <Button onClick={fetchRandomArticle}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Load Another
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      </div>

      <Dialog open={showFullArticle} onOpenChange={setShowFullArticle}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>{article?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-full mt-4">
            <div 
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: article?.fullContent || '' }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          {article?.thumbnail && (
            <img
              src={article.thumbnail.source}
              alt={article.title}
              className="w-full h-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default App;