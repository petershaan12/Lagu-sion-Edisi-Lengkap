"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { renameCollectionAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CollectionInfo } from "@/types";

export function CollectionRename({ collection }: { collection: CollectionInfo }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          title={`Ganti nama ${collection.label}`}
          aria-label={`Ganti nama katalog ${collection.label}`}
          className="ml-1 grid size-5 place-items-center rounded text-muted hover:text-brand"
        >
          <Pencil size={13} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-105">
        <form action={renameCollectionAction}>
          <input type="hidden" name="id" value={collection.id} />
          <DialogHeader>
            <DialogTitle>Ganti nama katalog</DialogTitle>
            <DialogDescription>
              Nama ini yang tampil di situs. Alamat halaman dan data lagu tidak ikut berubah.
            </DialogDescription>
          </DialogHeader>
          <div className="my-5 grid gap-2">
            <Label htmlFor={`label-${collection.id}`}>Nama katalog</Label>
            <Input
              id={`label-${collection.id}`}
              name="label"
              defaultValue={collection.label}
              required
              minLength={2}
              autoFocus
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
