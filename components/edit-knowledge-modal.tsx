"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { KnowledgeCard } from "@/types/knowledge"

interface EditKnowledgeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (card: KnowledgeCard) => void
  card: KnowledgeCard
  categories: string[]
}

export function EditKnowledgeModal({ isOpen, onClose, onSave, card, categories }: EditKnowledgeModalProps) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (card) {
      setTitle(card.title)
      setCategory(card.category)
      setContent(card.content)
    }
  }, [card])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !category || !content.trim()) return

    setIsLoading(true)

    // Simular salvamento
    setTimeout(() => {
      onSave({
        ...card,
        title: title.trim(),
        category,
        content: content.trim(),
      })
      setIsLoading(false)
    }, 500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-visible">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#2E2E2E]">Editar Conhecimento</DialogTitle>
        </DialogHeader>
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-sm text-[#2E2E2E]">
                Título
              </Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Como resetar senha"
                className="border-[#D1D5DB] focus:border-[#2A65F9]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-sm text-[#2E2E2E]">
                Categoria
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="border-[#D1D5DB] focus:border-[#2A65F9]">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  side="bottom"
                  align="start"
                  className="max-h-[200px] overflow-y-auto z-[60]"
                  sideOffset={4}
                >
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="cursor-pointer">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content" className="text-sm text-[#2E2E2E]">
                Conteúdo
              </Label>
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Descreva o conhecimento que a IA deve usar para responder..."
                className="min-h-[120px] border-[#D1D5DB] focus:border-[#2A65F9] resize-none"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="px-4">
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#2A65F9] hover:bg-[#1E50D2] px-4"
                disabled={isLoading || !title.trim() || !category || !content.trim()}
              >
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
