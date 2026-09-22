export default function Field({label,...props}:any){return <label className="block mb-4"><span className="text-sm muted block mb-2">{label}</span><input className="input" {...props}/></label>}
