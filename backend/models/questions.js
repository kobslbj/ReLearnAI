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

  static async findFolderByName(title, userId) {
    const query = `
      SELECT * FROM folders 
      WHERE title = $1 AND user_id = $2
      LIMIT 1
    `;
    const result = await db.query(query, [title, userId]);
    return result.rows[0] || null;
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

  static async findTagByName(name, userId) {
    const query = `
      SELECT * FROM tags 
      WHERE name = $1 AND user_id = $2
      LIMIT 1
    `;
    const result = await db.query(query, [name, userId]);
    return result.rows[0] || null;
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

      // Check if tag exists, if not create it
      let tag = await this.findTagByName(tagName, userId);
      const isNewTag = !tag;
      if (!tag) {
        tag = await this.createTag(tagName, userId);
        console.log(`Created new tag: ${tagName}`);
      } else {
        console.log(`Using existing tag: ${tagName}`);
      }

      // Check if folder exists, if not create it
      let folder = await this.findFolderByName(folderName, userId);
      const isNewFolder = !folder;
      if (!folder) {
        folder = await this.createFolder(folderName, tag.id, userId);
        console.log(`Created new folder: ${folderName}`);
      } else {
        console.log(`Using existing folder: ${folderName}`);
      }

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
        questions: createdQuestions,
        isNewFolder,
        isNewTag
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async getAllQuestionsByUserId(userId) {
    const query = `
      SELECT 
        q.id as question_id,
        q.description,
        q.options,
        q.answer,
        q.user_answer,
        q.note,
        f.id as folder_id,
        f.title as folder_title,
        t.id as tag_id,
        t.name as tag_name
      FROM questions q
      JOIN folders f ON q.folder_id = f.id
      JOIN tags t ON f.tag_id = t.id
      WHERE f.user_id = $1
      ORDER BY f.id ASC, q.id ASC
    `;
    const result = await db.query(query, [userId]);
    
    // Parse the options JSON for each question
    const questions = result.rows.map(row => ({
      ...row,
      options: JSON.parse(row.options)
    }));
    
    return questions;
  }
}

module.exports = QuestionSet; 