import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Video, Upload, Play, Trash2, Plus, Loader2, Eye, X } from "lucide-react";

interface WorkerVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration: number | null;
  skills_demonstrated: string[] | null;
  views_count: number | null;
  created_at: string | null;
}

interface WorkerVideoUploadProps {
  workerId: string;
  videos: WorkerVideo[];
  onVideosChange: () => void;
}

export default function WorkerVideoUpload({ workerId, videos, onVideosChange }: WorkerVideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    skills: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewVideo, setPreviewVideo] = useState<WorkerVideo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video must be less than 50MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !newVideo.title.trim()) {
      toast.error('Please provide a title and select a video');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${workerId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('worker-videos')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('worker-videos')
        .getPublicUrl(fileName);

      // Parse skills
      const skills = newVideo.skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Insert video record
      const { error: insertError } = await supabase
        .from('worker_videos')
        .insert({
          worker_id: workerId,
          title: newVideo.title.trim(),
          description: newVideo.description.trim() || null,
          video_url: publicUrl,
          skills_demonstrated: skills.length > 0 ? skills : null,
        });

      if (insertError) throw insertError;

      toast.success('Video uploaded successfully!');
      setShowUploadDialog(false);
      setNewVideo({ title: '', description: '', skills: '' });
      setSelectedFile(null);
      onVideosChange();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload video');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (video: WorkerVideo) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      // Extract file path from URL
      const urlParts = video.video_url.split('/');
      const filePath = urlParts.slice(-2).join('/');

      // Delete from storage
      await supabase.storage.from('worker-videos').remove([filePath]);

      // Delete record
      const { error } = await supabase
        .from('worker_videos')
        .delete()
        .eq('id', video.id);

      if (error) throw error;

      toast.success('Video deleted');
      onVideosChange();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete video');
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Video Portfolio
        </CardTitle>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="video-title">Title *</Label>
                <Input
                  id="video-title"
                  placeholder="e.g., TIG Welding Demonstration"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="video-description">Description</Label>
                <Textarea
                  id="video-description"
                  placeholder="Describe what's shown in the video..."
                  rows={3}
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="video-skills">Skills Demonstrated</Label>
                <Input
                  id="video-skills"
                  placeholder="e.g., Welding, Metal Fabrication, Safety"
                  value={newVideo.skills}
                  onChange={(e) => setNewVideo({ ...newVideo, skills: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">Comma-separated list of skills</p>
              </div>
              <div>
                <Label>Video File *</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <Video className="h-5 w-5 text-primary" />
                      <span className="text-sm">{selectedFile.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to select video</p>
                      <p className="text-xs text-muted-foreground mt-1">Max 50MB, MP4/MOV/WebM</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading || !selectedFile || !newVideo.title}>
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {videos.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <Video className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No videos uploaded yet</p>
            <p className="text-sm text-muted-foreground">
              Upload videos to showcase your skills to employers
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group relative bg-muted/30 rounded-lg overflow-hidden"
              >
                {/* Video Thumbnail / Preview */}
                <div className="aspect-video relative bg-black">
                  <video
                    src={video.video_url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPreviewVideo(video)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-3">
                  <h4 className="font-medium truncate">{video.title}</h4>
                  {video.description && (
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {video.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {video.views_count || 0} views
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(video)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {video.skills_demonstrated && video.skills_demonstrated.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {video.skills_demonstrated.slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Preview Dialog */}
        <Dialog open={!!previewVideo} onOpenChange={() => setPreviewVideo(null)}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{previewVideo?.title}</DialogTitle>
            </DialogHeader>
            {previewVideo && (
              <div className="space-y-4">
                <video
                  src={previewVideo.video_url}
                  controls
                  autoPlay
                  className="w-full rounded-lg"
                />
                {previewVideo.description && (
                  <p className="text-muted-foreground">{previewVideo.description}</p>
                )}
                {previewVideo.skills_demonstrated && previewVideo.skills_demonstrated.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {previewVideo.skills_demonstrated.map((skill, idx) => (
                      <Badge key={idx} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
