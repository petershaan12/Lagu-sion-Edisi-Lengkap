"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { addCollectionAction } from "@/app/admin/actions";
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

export function CollectionAdd() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          title="Tambah katalog"
          aria-label="Tambah katalog"
          className="ml-1 grid size-6 place-items-center rounded text-muted hover:text-brand"
        >
          <Plus size={15} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-105">
        <form action={addCollectionAction}>
          <DialogHeader>
            <DialogTitle>Katalog baru</DialogTitle>
            <DialogDescription>
              Alamat katalog dibuat otomatis dari namanya dan tidak berubah walau nanti namanya diganti.
            </DialogDescription>
          </DialogHeader>
          <div className="my-5 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="katalog-baru">Nama katalog</Label>
              <Input id="katalog-baru" name="label" required minLength={2} placeholder="Kidung Jemaat" autoFocus />
            </div>
            <label className="flex items-center gap-2.5 text-sm text-ink">
              <input name="numbered" type="checkbox" className="size-4 accent-brand" />
              Lagu punya nomor urut
            </label>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit">Buat katalog</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
