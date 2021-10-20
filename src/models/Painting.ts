import { model, Schema } from 'mongoose';

const PaintingSchema = new Schema({
  name: String,
  url: String,
  techniques: [String]
})

export default model('Painting', PaintingSchema);