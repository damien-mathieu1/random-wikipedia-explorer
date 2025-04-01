import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/auth-context";
import { LoginFormAuth } from "./components/auth/login-form";
import Cookies from 'js-cookie';

import { StreakDisplay } from "./components/streak/streak-display";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RefreshCw } from "lucide-react";
import RegisterForm from "./components/auth/register-form";

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



function MainContent() {
  const [article, setArticle] = useState<WikipediaArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullArticle, setShowFullArticle] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const { user, updateStreak } = useAuth();

  const updateStats = async () => {
    if (!user) return;

    try {
      // Update streak in the backend
      await updateStreak();
    } catch (error) {
      console.error('Failed to update streak:', error);
    }
  };

  const getLanguage = () => {
    if (user?.lang) return user.lang
    return Cookies.get('preferred_lang') || 'en'
  }

  const fetchRandomArticle = async () => {
    setLoading(true);
    try {
      const lang = getLanguage()
      console.log(lang)
      const response = await fetch(
        `https://${lang}.wikipedia.org/api/rest_v1/page/random/summary`
      );
      const data = await response.json();

      // Fetch full content
      const fullContentResponse = await fetch(
        `https://${lang}.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(
          data.title
        )}`
      );
      const fullContent = await fullContentResponse.text();

      // Get high-quality image if available
      let highQualityImage = data.thumbnail?.source;
      if (highQualityImage) {
        highQualityImage = highQualityImage.replace(/\d+px/, "2400px");
      }

      setArticle({
        title: data.title,
        extract: data.extract,
        fullurl: data.content_urls.desktop.page,
        thumbnail: highQualityImage
          ? {
            source: highQualityImage,
            width: data.thumbnail.width,
            height: data.thumbnail.height,
          }
          : undefined,
        fullContent: fullContent,
      });
    } catch (error) {
      console.error("Error fetching article:", error);
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
    if (aspectRatio < 1) {
      // Portrait images
      return { maxHeight: "400px", width: "auto" };
    } else if (aspectRatio > 2) {
      // Very wide images
      return { width: "100%", maxHeight: "300px", objectFit: "contain" } as const;
    } else {
      // Landscape images
      return { maxWidth: "100%", maxHeight: "400px", objectFit: "contain" } as const;
    }
  };

  return (
    <>
      <div className="min-h-screen p-3 sm:p-4 md:p-8 flex flex-col items-center">
        <div className="w-[90vw] max-w-4xl min-w-[320px]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">

            <div className="w-full">
              <StreakDisplay />
            </div>
          </div>

          <Card className="w-full min-w-80">
            {loading ? (
              <>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <div className="px-3 sm:px-6 flex justify-center">
                  <Skeleton className="h-[300px] w-full max-w-[500px] rounded-lg m-2" />
                </div>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full " />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </>
            ) : (
              article && (
                <>
                  <CardHeader>
                    <CardTitle className="text-2xl">{article.title}</CardTitle>
                    <CardDescription>
                      From Wikipedia, the free encyclopedia
                    </CardDescription>
                  </CardHeader>
                  {article.thumbnail && (
                    <div className="px-3 sm:px-6 flex justify-center">
                      <img
                        src={article.thumbnail.source}
                        alt={article.title}
                        className="rounded-lg object-cover mb-4 sm:mb-6 shadow-lg cursor-zoom-in transition-transform hover:scale-[1.02] max-w-full"
                        style={getImageStyle()}
                        loading="lazy"
                        onClick={() => setShowFullImage(true)}
                      />
                    </div>
                  )}
                  <CardContent>
                    <ScrollArea className="rounded-md text-justify">
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
              )
            )}
          </Card>
        </div>
      </div>

      <Dialog open={showFullArticle} onOpenChange={setShowFullArticle}>
        <DialogContent className="max-w-4xl h-[95vh] sm:h-[90vh]">
          <DialogHeader>
            <DialogTitle>{article?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-full mt-4">
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: article?.fullContent || "" }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-6">
          <DialogHeader>
            <DialogTitle>{article?.title}</DialogTitle>
          </DialogHeader>
          {article?.thumbnail && (
            <div className="relative w-full h-full flex items-center justify-center overflow-auto">
              <img
                src={article.thumbnail.source}
                alt={article.title}
                className="max-w-full max-h-[70vh] object-contain"
                style={{ margin: 'auto' }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col justify-center items-center  bg-gradient-to-b to-muted from-background ">
          {/* Main Content */}
          <main className="flex-1 flex flex-col justify-center">
            <Routes>
              <Route path="/login" element={<LoginFormAuth />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/*" element={<MainContent />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
