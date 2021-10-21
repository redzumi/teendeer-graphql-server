import { model, Schema } from 'mongoose';

const NoteSchema = new Schema({
  title: String,
  body: String,
})

export default model('Note', NoteSchema);