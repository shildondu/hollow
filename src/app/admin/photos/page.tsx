"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Upload, X, Loader2 } from "lucide-react";
import { parseExif, ExifData } from "@/lib/exif";

interface Category {
  id: string;
  name: string;
}

interface Photo {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
  fileHash: string | null;
  camera: string | null;
  lens: string | null;
  aperture: string | null;
  shutter: string | null;
  iso: string | null;
  tags: string | null;
  categoryId: string | null;
  category?: Category;
  sort: number;
  isPublic: boolean;
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    thumbnailUrl: "",
    fileHash: "",
    camera: "",
    lens: "",
    aperture: "",
    shutter: "",
    iso: "",
    tags: "",
    categoryId: "",
    sort: 0,
    isPublic: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [photosRes, categoriesRes] = await Promise.all([
      fetch("/api/photos"),
      fetch("/api/categories"),
    ]);
    setPhotos(await photosRes.json());
    setCategories(await categoriesRes.json());
    setLoading(false);
  }

  function openCreateDialog() {
    setEditingPhoto(null);
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      thumbnailUrl: "",
      fileHash: "",
      camera: "",
      lens: "",
      aperture: "",
      shutter: "",
      iso: "",
      tags: "",
      categoryId: "",
      sort: 0,
      isPublic: true,
    });
    setPreviewUrl(null);
    setExifData(null);
    setDialogOpen(true);
  }

  function openEditDialog(photo: Photo) {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title,
      description: photo.description || "",
      imageUrl: photo.imageUrl,
      thumbnailUrl: photo.thumbnailUrl || "",
      fileHash: photo.fileHash || "",
      camera: photo.camera || "",
      lens: photo.lens || "",
      aperture: photo.aperture || "",
      shutter: photo.shutter || "",
      iso: photo.iso || "",
      tags: photo.tags ? JSON.parse(photo.tags).join(", ") : "",
      categoryId: photo.categoryId || "",
      sort: photo.sort,
      isPublic: photo.isPublic,
    });
    setPreviewUrl(photo.imageUrl);
    setExifData(null);
    setDialogOpen(true);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);

    try {
      // Parse EXIF
      const exif = await parseExif(file);
      setExifData(exif);

      // Upload to local server
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.status === 409) {
        const data = await res.json();
        alert(data.error);
        setPreviewUrl(null);
        setUploading(false);
        return;
      }

      const { url, thumbnailUrl, fileHash } = await res.json();

      setFormData((prev) => ({
        ...prev,
        imageUrl: url,
        thumbnailUrl: thumbnailUrl,
        fileHash: fileHash,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
      }));
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    }

    setUploading(false);
  }

  function applyExifData() {
    if (!exifData) return;
    setFormData((prev) => ({
      ...prev,
      camera: exifData.camera || prev.camera,
      lens: exifData.lens || prev.lens,
      aperture: exifData.aperture || prev.aperture,
      shutter: exifData.shutter || prev.shutter,
      iso: exifData.iso || prev.iso,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = {
      ...formData,
      tags: formData.tags
        ? formData.tags.split(",").map((t) => t.trim())
        : null,
      categoryId: formData.categoryId || null,
    };

    if (editingPhoto) {
      await fetch(`/api/photos/${editingPhoto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }

    setDialogOpen(false);
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    await fetch(`/api/photos/${id}`, { method: "DELETE" });
    fetchData();
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Photos</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Photo
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo: Photo) => (
          <div
            key={photo.id}
            className="group relative overflow-hidden rounded-lg border"
          >
            <img
              src={photo.thumbnailUrl || photo.imageUrl}
              alt={photo.title}
              className="aspect-square w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex h-full items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => openEditDialog(photo)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(photo.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <p className="truncate text-sm font-medium text-white">
                {photo.title}
              </p>
              {photo.category && (
                <Badge variant="secondary" className="mt-1">
                  {photo.category.name}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPhoto ? "Edit Photo" : "Add Photo"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Photo</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-48 w-full rounded-lg object-cover"
                  />
                  {uploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/50">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                      <span className="mt-2 text-sm text-white">Uploading...</span>
                    </div>
                  )}
                  {!uploading && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => {
                      setPreviewUrl(null);
                      setFormData((prev) => ({
                        ...prev,
                        imageUrl: "",
                        thumbnailUrl: "",
                      }));
                    }}
                  >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-32"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Uploading..." : "Select Image"}
                </Button>
              )}
            </div>

            {exifData && Object.values(exifData).some(Boolean) && (
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">
                    EXIF Data Detected
                  </Label>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={applyExifData}
                  >
                    Apply
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {exifData.camera && <span>Camera: {exifData.camera}</span>}
                  {exifData.lens && <span>Lens: {exifData.lens}</span>}
                  {exifData.aperture && <span>f/{exifData.aperture}</span>}
                  {exifData.shutter && <span>{exifData.shutter}s</span>}
                  {exifData.iso && <span>ISO {exifData.iso}</span>}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: !value || value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.map((cat: Category) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
              />
            </div>

            <div className="grid grid-cols-5 gap-2">
              <div className="space-y-2">
                <Label htmlFor="camera">Camera</Label>
                <Input
                  id="camera"
                  value={formData.camera}
                  onChange={(e) =>
                    setFormData({ ...formData, camera: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lens">Lens</Label>
                <Input
                  id="lens"
                  value={formData.lens}
                  onChange={(e) =>
                    setFormData({ ...formData, lens: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aperture">Aperture</Label>
                <Input
                  id="aperture"
                  value={formData.aperture}
                  onChange={(e) =>
                    setFormData({ ...formData, aperture: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shutter">Shutter</Label>
                <Input
                  id="shutter"
                  value={formData.shutter}
                  onChange={(e) =>
                    setFormData({ ...formData, shutter: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iso">ISO</Label>
                <Input
                  id="iso"
                  value={formData.iso}
                  onChange={(e) =>
                    setFormData({ ...formData, iso: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort">Sort Order</Label>
                <Input
                  id="sort"
                  type="number"
                  value={formData.sort}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sort: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) =>
                      setFormData({ ...formData, isPublic: e.target.checked })
                    }
                  />
                  <span className="text-sm">Public</span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!formData.imageUrl || uploading}
            >
              {editingPhoto ? "Update" : "Create"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
