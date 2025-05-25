const db = require('../db/db');

class QuestionSet {
  static async createFolder(title, tagId, userId) {
    const query = `
      INSERT INTO folders (title, tag_id, user_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await db.query(query, [title, tagId, userId]);
    return result.rows[0];
  }

  static async createTag(name, userId) {
    const query = `
      INSERT INTO tags (name, user_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await db.query(query, [name, userId]);
    return result.rows[0];
  }

  static async createQuestion(folderId, description, options, answer, userAnswer, note) {
    const query = `
      INSERT INTO questions (folder_id, description, options, answer, user_answer, note)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await db.query(query, [
      folderId,
      description,
      JSON.stringify(options),
      answer,
      userAnswer,
      note
    ]);
    return result.rows[0];
  }

  static async createQuestionSet(folderName, tagName, questions, userId) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Create tag
      const tag = await this.createTag(tagName, userId);

      // Create folder
      const folder = await this.createFolder(folderName, tag.id, userId);

      // Create questions
      const createdQuestions = await Promise.all(
        questions.map(q => this.createQuestion(
          folder.id,
          q.description,
          q.options,
          q.answer,
          q.user_answer,
          q.note
        ))
      );

      await client.query('COMMIT');
      return {
        folder,
        tag,
        questions: createdQuestions
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = QuestionSet; 