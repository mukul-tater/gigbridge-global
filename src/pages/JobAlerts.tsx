import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobAlertsSubscription from "@/components/JobAlertsSubscription";
import NotificationSettings from "@/components/NotificationSettings";
import AlertsManagement from "@/components/AlertsManagement";

const JobAlerts = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="subscribe" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="subscribe">Subscribe</TabsTrigger>
                <TabsTrigger value="manage">Manage</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="subscribe">
              <JobAlertsSubscription />
            </TabsContent>

            <TabsContent value="manage">
              <AlertsManagement />
            </TabsContent>

            <TabsContent value="settings">
              <NotificationSettings />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobAlerts;