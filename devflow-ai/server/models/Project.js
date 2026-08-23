import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  color: { type: String, default: '#5b7cff' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  dueDate: { type: Date },
  tags: [{ type: String }]
}, { timestamps: true })

export default mongoose.model('Project', projectSchema)
