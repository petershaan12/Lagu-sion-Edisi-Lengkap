"use client";

import { Trash2 } from "lucide-react";
import { deleteSongAction } from "@/app/admin/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function SongDelete({ slug, title }: { slug: string; title: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          title="Hapus"
          aria-label={`Hapus ${title}`}
          className="text-muted hover:border-coral hover:text-coral"
        >
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus &ldquo;{title}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            Lagu ini dihapus permanen dari katalog. Tindakan ini tidak bisa dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <form action={deleteSongAction}>
            <input type="hidden" name="slug" value={slug} />
            <AlertDialogAction type="submit" className="bg-coral hover:bg-coral/90">
              Hapus lagu
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
