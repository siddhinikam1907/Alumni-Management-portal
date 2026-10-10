import { LoaderCircle } from "lucide-react";

function Loading({ text = "Loading..." }) {
  return (
    <div className="flex min-h-75 flex-col items-center justify-center gap-3">
      <LoaderCircle size={32} className="animate-spin text-indigo-600" />

      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}

export default Loading;
