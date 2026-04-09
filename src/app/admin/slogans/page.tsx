"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Slogan {
  id: string;
  text: string;
  isActive: boolean;
  sort: number;
}

export default function SlogansPage() {
  const [slogans, setSlogans] = useState<Slogan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlogan, setEditingSlogan] = useState<Slogan | null>(null);
  const [formData, setFormData] = useState({ text: "", isActive: true, sort: 0 });

  useEffect(() => {
    fetchSlogans();
  }, []);

  async function fetchSlogans() {
    try {
      const res = await fetch("/api/slogans/all");
      const data = await res.json();
      if (res.ok) {
        setSlogans(data);
      } else {
        console.error("Failed to fetch slogans:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch slogans:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingSlogan(null);
    setFormData({ text: "", isActive: true, sort: 0 });
    setDialogOpen(true);
  }

  function openEditDialog(slogan: Slogan) {
    setEditingSlogan(slogan);
    setFormData({
      text: slogan.text,
      isActive: slogan.isActive,
      sort: slogan.sort,
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingSlogan) {
      await fetch(`/api/slogans/${editingSlogan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    } else {
      await fetch("/api/slogans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }

    setDialogOpen(false);
    fetchSlogans();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this slogan?")) return;
    await fetch(`/api/slogans/${id}`, { method: "DELETE" });
    fetchSlogans();
  }

  async function toggleActive(slogan: Slogan) {
    await fetch(`/api/slogans/${slogan.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !slogan.isActive }),
    });
    fetchSlogans();
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Slogans</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Slogan
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Text</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sort</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slogans.map((slogan: Slogan) => (
              <TableRow key={slogan.id}>
                <TableCell className="max-w-md truncate">{slogan.text}</TableCell>
                <TableCell>
                  <Badge
                    variant={slogan.isActive ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleActive(slogan)}
                  >
                    {slogan.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{slogan.sort}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(slogan)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(slogan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {slogans.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No slogans yet
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSlogan ? "Edit Slogan" : "Add Slogan"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Text</Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Enter slogan text..."
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort">Sort</Label>
              <Input
                id="sort"
                type="number"
                value={formData.sort}
                onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
