"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

interface Question {
  id: number
  content: string
  correctAnswer: string
  userAnswer: string
  note: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
}

export default function CreateQuizPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState<string>("")
  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, content: "", correctAnswer: "", userAnswer: "", note: "", options: { A: "", B: "", C: "", D: "" } },
  ])

  const addQuestion = () => {
    const newId = questions.length + 1
    setQuestions([...questions, { id: newId, content: "", correctAnswer: "", userAnswer: "", note: "", options: { A: "", B: "", C: "", D: "" } }])
  }

  const updateQuestion = (id: number, field: keyof Question, value: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !subject || questions.some(q => !q.content || !q.correctAnswer)) {
      alert("請填寫所有必要欄位")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Transform the data to match the API's expected format
      const formattedQuestions = questions.map(q => ({
        description: q.content,
        options: q.options,
        answer: q.correctAnswer,
        user_answer: q.userAnswer,
        note: q.note
      }))
      
      const response = await fetch("/api/question-set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          folder_name: title,
          tag_name: subject,
          questions: formattedQuestions
        })
      })
      
      const data = await response.json()
      
      if (response.status === 201 && data.success) {
        alert("題目集創建成功！")
        router.push("/")
      } else {
        alert(`創建失敗: ${data.error || '未知錯誤'}`)
      }
    } catch (error) {
      console.error("Error submitting question set:", error)
      alert("提交時發生錯誤，請稍後再試")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">ReLearnAI</h1>
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E9%A6%96%E9%A0%81-FdCoEHnALIf50wdlzKQV8AyxDz6RRe.png"
          alt="Logo"
          width={50}
          height={50}
          className="rounded-full"
        />
      </header>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <div>
          <Input placeholder="新題本名稱" value={title} onChange={(e) => setTitle(e.target.value)} className="mb-4" />
          <Select onValueChange={setSubject}>
            <SelectTrigger>
              <SelectValue placeholder="標籤" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="數學">數學</SelectItem>
              <SelectItem value="英文">英文</SelectItem>
              <SelectItem value="物理">物理</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white rounded-lg border p-6 mb-6">
            <div className="mb-4">
              <div className="font-medium mb-2">{index + 1}</div>
              <div className="font-medium mb-2">題目</div>
              <Textarea
                placeholder="請輸入題目"
                value={question.content}
                onChange={(e) => updateQuestion(question.id, "content", e.target.value)}
                className="mb-4"
              />
              
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <div className="font-medium mb-2">選項 A</div>
                  <Input 
                    placeholder="請輸入選項 A" 
                    value={question.options.A}
                    onChange={(e) => {
                      const updatedQuestions = questions.map(q => {
                        if (q.id === question.id) {
                          return {
                            ...q,
                            options: {
                              ...q.options,
                              A: e.target.value
                            }
                          }
                        }
                        return q
                      })
                      setQuestions(updatedQuestions)
                    }}
                  />
                </div>
                <div>
                  <div className="font-medium mb-2">選項 B</div>
                  <Input 
                    placeholder="請輸入選項 B" 
                    value={question.options.B}
                    onChange={(e) => {
                      const updatedQuestions = questions.map(q => {
                        if (q.id === question.id) {
                          return {
                            ...q,
                            options: {
                              ...q.options,
                              B: e.target.value
                            }
                          }
                        }
                        return q
                      })
                      setQuestions(updatedQuestions)
                    }}
                  />
                </div>
                <div>
                  <div className="font-medium mb-2">選項 C</div>
                  <Input 
                    placeholder="請輸入選項 C" 
                    value={question.options.C}
                    onChange={(e) => {
                      const updatedQuestions = questions.map(q => {
                        if (q.id === question.id) {
                          return {
                            ...q,
                            options: {
                              ...q.options,
                              C: e.target.value
                            }
                          }
                        }
                        return q
                      })
                      setQuestions(updatedQuestions)
                    }}
                  />
                </div>
                <div>
                  <div className="font-medium mb-2">選項 D</div>
                  <Input 
                    placeholder="請輸入選項 D" 
                    value={question.options.D}
                    onChange={(e) => {
                      const updatedQuestions = questions.map(q => {
                        if (q.id === question.id) {
                          return {
                            ...q,
                            options: {
                              ...q.options,
                              D: e.target.value
                            }
                          }
                        }
                        return q
                      })
                      setQuestions(updatedQuestions)
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <div className="font-medium mb-2">正確答案</div>
                  <RadioGroup
                    value={question.correctAnswer}
                    onValueChange={(value) => updateQuestion(question.id, "correctAnswer", value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="A" id={`correct-a-${question.id}`} />
                      <Label htmlFor={`correct-a-${question.id}`}>A</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="B" id={`correct-b-${question.id}`} />
                      <Label htmlFor={`correct-b-${question.id}`}>B</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="C" id={`correct-c-${question.id}`} />
                      <Label htmlFor={`correct-c-${question.id}`}>C</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="D" id={`correct-d-${question.id}`} />
                      <Label htmlFor={`correct-d-${question.id}`}>D</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <div className="font-medium mb-2">我的答案</div>
                  <RadioGroup
                    value={question.userAnswer}
                    onValueChange={(value) => updateQuestion(question.id, "userAnswer", value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="A" id={`user-a-${question.id}`} />
                      <Label htmlFor={`user-a-${question.id}`}>A</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="B" id={`user-b-${question.id}`} />
                      <Label htmlFor={`user-b-${question.id}`}>B</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="C" id={`user-c-${question.id}`} />
                      <Label htmlFor={`user-c-${question.id}`}>C</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="D" id={`user-d-${question.id}`} />
                      <Label htmlFor={`user-d-${question.id}`}>D</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div>
                <div className="font-medium mb-2">備註</div>
                <Textarea
                  placeholder="請輸入備註"
                  value={question.note}
                  onChange={(e) => updateQuestion(question.id, "note", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-center mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
            className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="bg-gray-900 hover:bg-gray-800"
            disabled={isSubmitting}
          >
            {isSubmitting ? "處理中..." : "建立"}
          </Button>
        </div>
      </form>
    </div>
  )
}
