import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, Smartphone, Clock, Volume2, BellRing } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/use-push-notifications";

// VAPID public key - generate with: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

const NotificationSettings = () => {
  const { isSupported, isSubscribed, isLoading: pushLoading, subscribe, unsubscribe } = usePushNotifications();
  
  const [settings, setSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    inAppNotifications: true,
    soundEnabled: true,
    frequency: "immediate",
    quietHours: [22, 7], // 10 PM to 7 AM
    priority: "high"
  });

  const { toast } = useToast();

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated successfully.",
    });
  };

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Customize how and when you receive job alerts
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notification Channels</CardTitle>
            <CardDescription>
              Choose how you want to receive job alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">Email Notifications</span>
                  <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                </div>
              </div>
              <Switch 
                checked={settings.emailAlerts}
                onCheckedChange={(value) => handleSettingChange('emailAlerts', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">SMS Alerts</span>
                  <p className="text-sm text-muted-foreground">Get instant text messages</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Premium</Badge>
                <Switch 
                  checked={settings.smsAlerts}
                  onCheckedChange={(value) => handleSettingChange('smsAlerts', value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">In-App Notifications</span>
                  <p className="text-sm text-muted-foreground">See alerts within the platform</p>
                </div>
              </div>
              <Switch 
                checked={settings.inAppNotifications}
                onCheckedChange={(value) => handleSettingChange('inAppNotifications', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">Sound Notifications</span>
                  <p className="text-sm text-muted-foreground">Play sound for new alerts</p>
                </div>
              </div>
              <Switch 
                checked={settings.soundEnabled}
                onCheckedChange={(value) => handleSettingChange('soundEnabled', value)}
              />
            </div>

            {isSupported && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BellRing className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Push Notifications</span>
                    <p className="text-sm text-muted-foreground">
                      Get notified even when the browser is closed
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={isSubscribed}
                  disabled={pushLoading || !VAPID_PUBLIC_KEY}
                  onCheckedChange={async (checked) => {
                    if (checked) {
                      await subscribe(VAPID_PUBLIC_KEY);
                    } else {
                      await unsubscribe();
                    }
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Frequency & Timing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Frequency & Timing</CardTitle>
            <CardDescription>
              Control when and how often you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-3 block">Notification Frequency</label>
              <Select value={settings.frequency} onValueChange={(value) => handleSettingChange('frequency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate - Real-time alerts</SelectItem>
                  <SelectItem value="hourly">Hourly - Digest every hour</SelectItem>
                  <SelectItem value="daily">Daily - Once per day</SelectItem>
                  <SelectItem value="weekly">Weekly - Weekly summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Priority Level</label>
              <Select value={settings.priority} onValueChange={(value) => handleSettingChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Opportunities</SelectItem>
                  <SelectItem value="high">High Priority Only</SelectItem>
                  <SelectItem value="critical">Critical Opportunities Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Quiet Hours
              </label>
              <div className="space-y-4">
                <div className="px-4 py-3 bg-accent/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    No notifications between: {formatTime(settings.quietHours[0])} - {formatTime(settings.quietHours[1])}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Start: {formatTime(settings.quietHours[0])}</span>
                      <span>End: {formatTime(settings.quietHours[1])}</span>
                    </div>
                    <Slider
                      value={settings.quietHours}
                      onValueChange={(value) => handleSettingChange('quietHours', value)}
                      max={23}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Settings */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Save Your Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Changes will be applied immediately
                </p>
              </div>
              <Button onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationSettings;