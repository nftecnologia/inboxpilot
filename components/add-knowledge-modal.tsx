"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, FileText, Loader2 } from "lucide-react"
import type { KnowledgeCard } from "@/types/knowledge"

interface AddKnowledgeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (card: Omit<KnowledgeCard, "id" | "createdAt" | "updatedAt">) => void
  categories: string[]
}

export function AddKnowledgeModal({ isOpen, onClose, onSave, categories }: AddKnowledgeModalProps) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessingFiles, setIsProcessingFiles] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [autoSaveMode, setAutoSaveMode] = useState(true) // Modo automático ativado por padrão
  const [processedFiles, setProcessedFiles] = useState<Array<{
    file: File
    title: string
    category: string
    content: string
    status: 'pending' | 'processing' | 'done' | 'error' | 'saved'
    error?: string
  }>>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !category || !content.trim()) return

    setIsLoading(true)

    // Simular salvamento
    setTimeout(() => {
      onSave({
        title: title.trim(),
        category,
        content: content.trim(),
      })

      // Reset form
      setTitle("")
      setCategory("")
      setContent("")
      setIsLoading(false)
    }, 500)
  }

  const handleClose = () => {
    setTitle("")
    setCategory("")
    setContent("")
    setSelectedFiles([])
    setProcessedFiles([])
    onClose()
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const markdownFiles = files.filter(file => 
      file.name.endsWith('.md') || file.name.endsWith('.markdown')
    )
    
    if (markdownFiles.length === 0) {
      alert('Por favor, selecione apenas arquivos Markdown (.md ou .markdown)')
      return
    }

    setSelectedFiles(markdownFiles)
    
    // Se for apenas um arquivo e modo manual, processa para preencher o formulário
    if (markdownFiles.length === 1 && !autoSaveMode) {
      setIsProcessingFiles(true)
      const file = markdownFiles[0]
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/knowledge/process-markdown', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
          throw new Error(errorData.error || `Erro ao processar arquivo: ${response.status}`)
        }

        const data = await response.json()
        
        // Preencher automaticamente os campos com os dados extraídos
        setTitle(data.title || file.name.replace(/\.(md|markdown)$/, ''))
        setCategory(data.category || '')
        setContent(data.content || '')
      } catch (error) {
        console.error('Erro ao processar Markdown:', error)
        const errorMessage = error instanceof Error ? error.message : 'Erro ao processar o arquivo'
        alert(errorMessage)
      } finally {
        setIsProcessingFiles(false)
      }
    } else {
      // Processa em lote (modo automático ou múltiplos arquivos)
      processMarkdownFiles(markdownFiles)
    }
  }

  const processMarkdownFiles = async (files: File[]) => {
    if (autoSaveMode) {
      await processAndAutoSave(files)
    } else {
      await processForReview(files)
    }
  }

  const processAndAutoSave = async (files: File[]) => {
    setIsProcessingFiles(true)
    
    // Inicializa o status de todos os arquivos
    const initialStatus = files.map(file => ({
      file,
      title: '',
      category: '',
      content: '',
      status: 'pending' as const,
    }))
    setProcessedFiles(initialStatus)

    // Processa e salva cada arquivo automaticamente
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Atualiza status para processando
      setProcessedFiles(prev => 
        prev.map((f, idx) => 
          idx === i ? { ...f, status: 'processing' as const } : f
        )
      )

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/knowledge/process-markdown', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
          throw new Error(errorData.error || `Erro ao processar arquivo: ${response.status}`)
        }

        const data = await response.json()
        
        // Verifica se recebeu erro da API
        if (data.error) {
          throw new Error(data.error)
        }
        
        // Salva automaticamente
        await onSave({
          title: data.title,
          category: data.category,
          content: data.content,
        })
        
        // Atualiza status para salvo
        setProcessedFiles(prev => 
          prev.map((f, idx) => 
            idx === i ? { 
              ...f, 
              title: data.title,
              category: data.category,
              content: data.content,
              status: 'saved' as const
            } : f
          )
        )
      } catch (error) {
        console.error(`Erro ao processar ${file.name}:`, error)
        const errorMessage = error instanceof Error ? error.message : 'Erro ao processar arquivo'
        setProcessedFiles(prev => 
          prev.map((f, idx) => 
            idx === i ? { 
              ...f, 
              status: 'error' as const,
              error: errorMessage
            } : f
          )
        )
      }
    }

    setIsProcessingFiles(false)
    
    // Fecha o modal após 2 segundos se houver arquivos salvos
    const savedCount = processedFiles.filter(f => f.status === 'saved').length
    if (savedCount > 0) {
      setTimeout(() => {
        handleClose()
      }, 2000)
    }
  }

  const processForReview = async (files: File[]) => {
    setIsProcessingFiles(true)
    
    // Inicializa o status de todos os arquivos
    const initialStatus = files.map(file => ({
      file,
      title: '',
      category: '',
      content: '',
      status: 'pending' as const,
    }))
    setProcessedFiles(initialStatus)

    // Processa cada arquivo
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Atualiza status para processando
      setProcessedFiles(prev => 
        prev.map((f, idx) => 
          idx === i ? { ...f, status: 'processing' as const } : f
        )
      )

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/knowledge/process-markdown', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
          throw new Error(errorData.error || `Erro ao processar arquivo: ${response.status}`)
        }

        const data = await response.json()
        
        // Verifica se recebeu erro da API
        if (data.error) {
          throw new Error(data.error)
        }
        
        // Atualiza com os dados processados
        setProcessedFiles(prev => 
          prev.map((f, idx) => 
            idx === i ? { 
              ...f, 
              title: data.title,
              category: data.category,
              content: data.content,
              status: 'done' as const
            } : f
          )
        )
      } catch (error) {
        console.error(`Erro ao processar ${file.name}:`, error)
        const errorMessage = error instanceof Error ? error.message : 'Erro ao processar arquivo'
        setProcessedFiles(prev => 
          prev.map((f, idx) => 
            idx === i ? { 
              ...f, 
              status: 'error' as const,
              error: errorMessage
            } : f
          )
        )
      }
    }

    setIsProcessingFiles(false)
  }

  const handleBatchSave = async () => {
    setIsLoading(true)
    
    const successfulFiles = processedFiles.filter(f => f.status === 'done')
    
    for (const file of successfulFiles) {
      await onSave({
        title: file.title,
        category: file.category,
        content: file.content,
      })
    }

    // Reset form
    setTitle("")
    setCategory("")
    setContent("")
    setSelectedFiles([])
    setProcessedFiles([])
    setIsLoading(false)
    
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-visible">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#2E2E2E]">Adicionar Novo Conhecimento</DialogTitle>
        </DialogHeader>
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Modo de operação */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-save"
                  checked={autoSaveMode}
                  onChange={(e) => setAutoSaveMode(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="auto-save" className="text-sm font-medium text-gray-700">
                  Salvar automaticamente após processar
                </label>
              </div>
              <p className="text-xs text-gray-500">
                {autoSaveMode ? 'Arquivos serão salvos direto na base' : 'Você poderá revisar antes de salvar'}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-[#2E2E2E]">
                Upload de Arquivo Markdown
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#2A65F9] transition-colors">
                <input
                  type="file"
                  accept=".md,.markdown"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="markdown-upload"
                  disabled={isProcessingFiles}
                  multiple
                />
                <label
                  htmlFor="markdown-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {isProcessingFiles ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-[#2A65F9]" />
                      <p className="text-sm text-gray-600">
                        Processando {selectedFiles.length} arquivo{selectedFiles.length > 1 ? 's' : ''}...
                      </p>
                    </>
                  ) : selectedFiles.length > 0 ? (
                    <>
                      <FileText className="h-8 w-8 text-[#2A65F9]" />
                      <p className="text-sm text-gray-600">
                        {selectedFiles.length} arquivo{selectedFiles.length > 1 ? 's' : ''} selecionado{selectedFiles.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-500">Clique para alterar</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Clique para fazer upload de arquivos Markdown
                      </p>
                      <p className="text-xs text-gray-500">
                        Selecione arquivos .md ou .markdown. A IA organizará e categorizará automaticamente
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Mostrar status do processamento em lote */}
            {processedFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-[#2E2E2E]">
                  Status do Processamento
                </Label>
                <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
                  {processedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="truncate flex-1 mr-2">{file.file.name}</span>
                      <span className={`
                        ${file.status === 'pending' ? 'text-gray-500' : ''}
                        ${file.status === 'processing' ? 'text-blue-500' : ''}
                        ${file.status === 'done' ? 'text-green-500' : ''}
                        ${file.status === 'error' ? 'text-red-500' : ''}
                      `}>
                        {file.status === 'pending' && 'Aguardando'}
                        {file.status === 'processing' && <Loader2 className="h-4 w-4 animate-spin inline" />}
                        {file.status === 'done' && '✓ Processado'}
                        {file.status === 'saved' && '✓ Salvo'}
                        {file.status === 'error' && `✗ ${file.error || 'Erro'}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2" style={{ display: processedFiles.length > 0 || autoSaveMode ? 'none' : 'block' }}>
              <Label htmlFor="title" className="text-sm text-[#2E2E2E]">
                Título
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Como resetar senha"
                className="border-[#D1D5DB] focus:border-[#2A65F9]"
                required
              />
            </div>

            <div className="space-y-2" style={{ display: processedFiles.length > 0 || autoSaveMode ? 'none' : 'block' }}>
              <Label htmlFor="category" className="text-sm text-[#2E2E2E]">
                Categoria
              </Label>
              <Select value={category} onValueChange={setCategory} required={!autoSaveMode}>
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

            <div className="space-y-2" style={{ display: processedFiles.length > 0 || autoSaveMode ? 'none' : 'block' }}>
              <Label htmlFor="content" className="text-sm text-[#2E2E2E]">
                Conteúdo
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Descreva o conhecimento que a IA deve usar para responder..."
                className="min-h-[120px] border-[#D1D5DB] focus:border-[#2A65F9] resize-none"
                required={!autoSaveMode}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="px-4">
                {processedFiles.some(f => f.status === 'saved') ? 'Fechar' : 'Cancelar'}
              </Button>
              {processedFiles.length > 0 && !autoSaveMode ? (
                <Button
                  type="button"
                  onClick={handleBatchSave}
                  className="bg-[#2A65F9] hover:bg-[#1E50D2] px-4"
                  disabled={isLoading || processedFiles.filter(f => f.status === 'done').length === 0}
                >
                  {isLoading ? "Salvando..." : `Salvar ${processedFiles.filter(f => f.status === 'done').length} conhecimentos`}
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-[#2A65F9] hover:bg-[#1E50D2] px-4"
                  disabled={isLoading || !title.trim() || !category || !content.trim()}
                >
                  {isLoading ? "Salvando..." : "Salvar"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
