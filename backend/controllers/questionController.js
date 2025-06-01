const QuestionSet = require('../models/questions');

exports.createQuestionSet = async (req, res) => {
  const { folder_name, tag_name, questions, user_id } = req.body;
  const userId = user_id || (req.user && req.user.id); // Support both ways

  // Basic validation
  if (!folder_name || !tag_name || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'user_id is required when not authenticated' });
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
      data: result,
      summary: {
        folder: result.isNewFolder ? `Created new folder: ${folder_name}` : `Used existing folder: ${folder_name}`,
        tag: result.isNewTag ? `Created new tag: ${tag_name}` : `Used existing tag: ${tag_name}`,
        questions_added: questions.length
      }
    });
  } catch (err) {
    console.error('Error creating question set:', err);
    res.status(500).json({ error: 'Failed to create question set' });
  }
};

exports.getAllQuestions = async (req, res) => {
  const { user_id } = req.params;
  
  // Basic validation
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required in URL parameter' });
  }

  try {
    console.log('Fetching questions for user_id:', user_id);
    const folders = await QuestionSet.getAllQuestionsByUserId(user_id);
    console.log('Retrieved folders:', folders);
    
    // Calculate total questions count
    const totalQuestions = folders.reduce((total, folder) => total + folder.questions.length, 0);
    
    res.status(200).json({
      message: 'Questions retrieved successfully',
      data: {
        folders,
        total_folders: folders.length,
        total_questions: totalQuestions
      }
    });
  } catch (err) {
    console.error('Error retrieving questions:', err);
    res.status(500).json({ error: 'Failed to retrieve questions' });
  }
}; 