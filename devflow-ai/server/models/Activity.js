import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  entity: { type: String, default: '' },
  meta: { type: Object, default: {} }
}, { timestamps: true })

export default mongoose.model('Activity', activitySchema)
