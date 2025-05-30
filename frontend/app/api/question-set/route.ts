import { NextResponse } from "next/server"

interface Option {
  [key: string]: string
}

interface Question {
  description: string
  options: Option
  answer: string
  user_answer: string
  note: string
}

interface QuestionSetRequest {
  folder_name: string
  tag_name: string
  questions: Question[]
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate request body
    const { folder_name, tag_name, questions } = body as QuestionSetRequest
    
    if (!folder_name || !tag_name || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { success: false, error: "Invalid request payload" },
        { status: 400 }
      )
    }
    
    // Validate each question
    for (const question of questions) {
      if (
        !question.description ||
        !question.options ||
        !question.answer ||
        typeof question.options !== "object"
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid question format" },
          { status: 400 }
        )
      }
    }
    
    // In a real application, you would save the question set to a database here
    // For now, we'll just return a success response
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Question set created successfully",
        questionSetId: Math.random().toString(36).substring(2, 9) // Generate a random ID
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating question set:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create question set" },
      { status: 400 }
    )
  }
}
