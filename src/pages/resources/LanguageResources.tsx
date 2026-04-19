import ResourcePageLayout from "@/components/ResourcePageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Languages, BookOpen, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const languages = [
  {
    name: "Arabic (Gulf)",
    flag: "🇦🇪 🇸🇦 🇶🇦",
    needFor: "UAE, Saudi Arabia, Qatar, Oman, Kuwait, Bahrain",
    level: "Basic phrases enough",
    phrases: [
      ["As-salaam alaikum", "Peace be upon you (greeting)"],
      ["Shukran", "Thank you"],
      ["Min fadlak", "Please"],
      ["Kam hatha?", "How much is this?"],
      ["Wayn al-hammam?", "Where is the bathroom?"],
    ],
    free: ["Duolingo (free)", "Drops app", "BBC Learning Arabic"],
  },
  {
    name: "German",
    flag: "🇩🇪",
    needFor: "Germany, Austria, parts of Switzerland",
    level: "B1/B2 mandatory for most work visas",
    phrases: [
      ["Guten Tag", "Good day"],
      ["Danke schön", "Thank you very much"],
      ["Bitte", "Please / You're welcome"],
      ["Wo ist…?", "Where is…?"],
      ["Ich verstehe nicht", "I don't understand"],
    ],
    free: ["Goethe-Institut (paid + free)", "Deutsche Welle (free)", "Duolingo"],
  },
  {
    name: "English (Workplace)",
    flag: "🇸🇬 🇨🇦 🇬🇧",
    needFor: "Singapore, Canada, UK, Australia, New Zealand",
    level: "IELTS 5.5 – 7.0 typical",
    phrases: [
      ["Could you repeat that, please?", "Asking for clarification"],
      ["I'll get back to you on that", "Polite delay"],
      ["Just to confirm…", "Verifying details"],
      ["I appreciate your help", "Thanking politely"],
      ["Could we set up a quick call?", "Requesting a meeting"],
    ],
    free: ["British Council LearnEnglish", "BBC Learning English", "Cambridge Write & Improve"],
  },
];

export default function LanguageResources() {
  return (
    <ResourcePageLayout
      title="Language Resources for Overseas Workers | SafeWorkGlobal"
      description="Free language tools and survival phrases for Indian workers heading to the Gulf, Germany, Singapore and Canada."
      eyebrow="Language Resources"
      heading="Speak just enough to thrive"
      intro="You don't need to be fluent. A few essential phrases and the right free tools will take you 80% of the way there."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {languages.map((l) => (
          <Card key={l.name} className="hover:shadow-lg hover:border-primary/40 transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-2xl mb-2 block" aria-hidden>{l.flag}</span>
                  <h3 className="text-lg font-heading font-bold">{l.name}</h3>
                </div>
                <Languages className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">For: {l.needFor}</p>
              <Badge variant="secondary" className="text-xs mb-4">{l.level}</Badge>

              <p className="text-xs font-semibold text-muted-foreground mb-2">Survival phrases</p>
              <ul className="space-y-2 mb-4">
                {l.phrases.map(([p, m]) => (
                  <li key={p} className="text-sm">
                    <p className="font-medium">{p}</p>
                    <p className="text-xs text-muted-foreground">{m}</p>
                  </li>
                ))}
              </ul>

              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                  <BookOpen className="h-3 w-3 inline mr-1" /> Free tools
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {l.free.map((f) => (
                    <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-10 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 text-center">
        <Globe className="h-6 w-6 text-primary mx-auto mb-2" />
        <h3 className="text-lg font-heading font-bold mb-1">SafeWorkGlobal supports 15+ Indian languages</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Hindi, Tamil, Telugu, Malayalam, Bengali, Punjabi, Marathi, Gujarati, Kannada, Odia and more — chat with us in your language.
        </p>
        <Link to="/contact">
          <Button size="lg" className="rounded-xl">
            Talk to a language buddy <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </Card>
    </ResourcePageLayout>
  );
}
