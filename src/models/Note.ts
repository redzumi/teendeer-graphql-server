import { model, Schema } from 'mongoose';

export const NoteSchema = new Schema({
  title: String,
  body: String,
})

export default model('Note', NoteSchema);