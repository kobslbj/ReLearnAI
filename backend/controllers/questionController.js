const QuestionSet = require('../models/questions');

exports.createQuestionSet = async (req, res) => {
  const { folder_name, tag_name, questions } = req.body;
  const userId = req.user.id; // From auth middleware

  // Basic validation
  if (!folder_name || !tag_name || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  // Validate each question
  for (const question of questions) {
    if (!question.description || !question.options || !question.answer || !question.user_answer) {
      return res.status(400).json({ error: 'Each question must have description, options, answer, and user_answer' });
    }

    // Validate options
    const { A, B, C, D } = question.options;
    if (!A || !B || !C || !D) {
      return res.status(400).json({ error: 'Each question must have all options (A, B, C, D)' });
    }

    // Validate answer and user_answer
    if (!['A', 'B', 'C', 'D'].includes(question.answer) || !['A', 'B', 'C', 'D'].includes(question.user_answer)) {
      return res.status(400).json({ error: 'Answer and user_answer must be one of: A, B, C, D' });
    }
  }

  try {
    const result = await QuestionSet.createQuestionSet(folder_name, tag_name, questions, userId);
    res.status(201).json({
      message: 'Question set created successfully',
      data: result
    });
  } catch (err) {
    console.error('Error creating question set:', err);
    res.status(500).json({ error: 'Failed to create question set' });
  }
}; 